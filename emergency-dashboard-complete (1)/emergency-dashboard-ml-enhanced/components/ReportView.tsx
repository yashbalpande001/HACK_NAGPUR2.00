import React, { useState, useRef, useEffect } from 'react';
import { DisasterType, Severity, ResourceType, EmergencyRequest } from '../types';
import { Camera, MapPin, Upload, AlertCircle, Shield, CheckCircle, XCircle, Loader } from 'lucide-react';
import { mlVerificationService } from '../services/mlVerificationService';
import { AREAS } from '../constants';

interface ReportViewProps {
  onSubmit: (reportData: Partial<EmergencyRequest>) => void;
  currentUser: { id: string; contactNumber: string; trustScore: number; totalReports: number; verifiedReports: number; spamReports: number; lastReportTime: number };
}

export const ReportView: React.FC<ReportViewProps> = ({ onSubmit, currentUser }) => {
  const [disasterType, setDisasterType] = useState<DisasterType>(DisasterType.FLOOD);
  const [severity, setSeverity] = useState<Severity>(Severity.MEDIUM);
  const [description, setDescription] = useState('');
  const [areaId, setAreaId] = useState('');
  const [contactNumber, setContactNumber] = useState(currentUser.contactNumber || '');
  
  // Image upload state
  const [imageData, setImageData] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // GPS location state
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Get current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate single image
    if (imageData) {
      alert('❌ Only ONE image allowed to prevent spam');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageData(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }

    setLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoadingLocation(false);
      },
      (error) => {
        setLocationError('Unable to get location. Please enable GPS.');
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate mandatory fields
    if (!imageData) {
      alert('❌ Image verification is MANDATORY. Please upload a photo of the disaster.');
      return;
    }

    if (!location) {
      alert('❌ Location is required. Please enable GPS or click "Use Current Location"');
      return;
    }

    if (!contactNumber || contactNumber.length < 10) {
      alert('❌ Valid contact number required (min 10 digits)');
      return;
    }

    setIsVerifying(true);

    try {
      // ML Verification
      const verification = await mlVerificationService.verifyReport(
        {
          disasterType,
          severity,
          description,
          location,
          areaId
        },
        imageData,
        {
          userId: currentUser.id,
          totalReports: currentUser.totalReports,
          verifiedReports: currentUser.verifiedReports,
          spamReports: currentUser.spamReports,
          trustScore: currentUser.trustScore,
          lastReportTime: currentUser.lastReportTime
        },
        [] // Pass existing reports from parent in real implementation
      );

      setVerificationResult(verification);
      setIsVerifying(false);

      // Show verification results
      if (verification.recommendation === 'reject') {
        alert(`❌ Report REJECTED\n\nReasons:\n${verification.reasons.join('\n')}\n\nSpam Score: ${Math.round(verification.spamScore * 100)}%\nTrust Score: ${verification.trustScore}/100`);
        return;
      }

      if (verification.recommendation === 'review') {
        const proceed = confirm(`⚠️ Report FLAGGED FOR REVIEW\n\nReasons:\n${verification.reasons.join('\n')}\n\nSpam Score: ${Math.round(verification.spamScore * 100)}%\nTrust Score: ${verification.trustScore}/100\n\nSubmit anyway for manual review?`);
        if (!proceed) return;
      }

      // Submit report
      const imageAnalysis = await mlVerificationService.analyzeImage(imageData);
      
      onSubmit({
        disasterType,
        severity: imageAnalysis.severity, // Use AI-detected severity
        computedSeverity: imageAnalysis.severity,
        description,
        location,
        areaId,
        resourceNeeded: ResourceType.RESCUE_UNIT, // Default
        imageData,
        imageAnalysis: {
          hasDisaster: imageAnalysis.hasDisaster,
          disasterType: imageAnalysis.disasterType,
          confidence: imageAnalysis.confidence,
          features: imageAnalysis.features
        },
        verificationStatus: verification.recommendation === 'approve' ? 'approved' : 'reviewing',
        spamScore: verification.spamScore,
        trustScore: verification.trustScore,
        verificationReasons: verification.reasons
      });

      // Clear form
      setDescription('');
      setImageData(null);
      setImagePreview(null);
      setVerificationResult(null);

      alert(`✅ Report Submitted Successfully!\n\nVerification: ${verification.recommendation.toUpperCase()}\nConfidence: ${Math.round(verification.confidence * 100)}%\nTrust Score: ${verification.trustScore}/100`);

    } catch (error) {
      setIsVerifying(false);
      alert('❌ Error submitting report. Please try again.');
      console.error(error);
    }
  };

  const trustColor = currentUser.trustScore >= 70 ? 'text-green-500' : currentUser.trustScore >= 40 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Trust Score Badge */}
        <div className="mb-6 bg-white rounded-2xl shadow-lg p-4 border-2 border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className={`w-8 h-8 ${trustColor}`} />
              <div>
                <h3 className="font-bold text-lg text-slate-800">Your Trust Score</h3>
                <p className="text-xs text-slate-500">Based on {currentUser.totalReports} reports</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-black ${trustColor}`}>{currentUser.trustScore}</div>
              <div className="text-xs text-slate-500">/ 100</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-green-50 rounded-lg p-2">
              <div className="font-bold text-green-700">{currentUser.verifiedReports}</div>
              <div className="text-green-600">Verified</div>
            </div>
            <div className="bg-red-50 rounded-lg p-2">
              <div className="font-bold text-red-700">{currentUser.spamReports}</div>
              <div className="text-red-600">Spam</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <div className="font-bold text-blue-700">{currentUser.totalReports}</div>
              <div className="text-blue-600">Total</div>
            </div>
          </div>
        </div>

        {/* Report Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border-2 border-red-100">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-red-600 mb-2">🚨 Emergency Report</h2>
            <p className="text-slate-600">Image verification is mandatory to prevent spam</p>
          </div>

          {/* Image Upload - MANDATORY */}
          <div className="border-4 border-dashed border-red-300 rounded-xl p-6 bg-red-50">
            <label className="block text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              PHOTO VERIFICATION (MANDATORY) - Single image only
            </label>
            
            {!imagePreview ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageCapture}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Camera className="w-6 h-6" />
                  Capture / Upload Disaster Photo
                </button>
                <p className="text-xs text-red-600 mt-2 text-center">⚠️ Required for ML verification</p>
              </div>
            ) : (
              <div className="relative">
                <img src={imagePreview} alt="Disaster" className="w-full h-64 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => { setImageData(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700"
                >
                  <XCircle className="w-5 h-5" />
                </button>
                <div className="mt-2 text-xs text-green-700 font-bold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Image captured successfully
                </div>
              </div>
            )}
          </div>

          {/* GPS Location */}
          <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50">
            <label className="block text-sm font-bold text-blue-700 mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Current Location
            </label>
            
            {location ? (
              <div className="bg-white rounded-lg p-3 mb-2">
                <div className="text-sm font-mono text-slate-700">
                  📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </div>
                <div className="text-xs text-green-600 mt-1">✓ Location captured</div>
              </div>
            ) : (
              <div className="text-sm text-red-600 mb-2">❌ Location not available</div>
            )}
            
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={loadingLocation}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:bg-blue-300"
            >
              {loadingLocation ? (
                <><Loader className="w-4 h-4 animate-spin" /> Getting Location...</>
              ) : (
                <><MapPin className="w-4 h-4" /> Use Current Location</>
              )}
            </button>
            {locationError && <p className="text-xs text-red-600 mt-2">{locationError}</p>}
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Contact Number (Required)</label>
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
              required
              minLength={10}
            />
          </div>

          {/* Disaster Type */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Disaster Type</label>
            <select
              value={disasterType}
              onChange={(e) => setDisasterType(e.target.value as DisasterType)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
            >
              {Object.values(DisasterType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Severity (AI will verify)</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
            >
              {Object.values(Severity).map(sev => (
                <option key={sev} value={sev}>{sev}</option>
              ))}
            </select>
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Area (Optional)</label>
            <select
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
            >
              <option value="">Auto-detect from GPS</option>
              {AREAS.map(area => (
                <option key={area.id} value={area.id}>{area.name} - {area.district}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the emergency situation..."
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none h-24 resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isVerifying || !imageData || !location}
            className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-black text-lg shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            {isVerifying ? (
              <><Loader className="w-6 h-6 animate-spin" /> Verifying with ML...</>
            ) : (
              <><AlertCircle className="w-6 h-6" /> Submit Emergency Report</>
            )}
          </button>

          <p className="text-xs text-center text-slate-500">
            ⚠️ False reports will decrease your trust score and may be rejected
          </p>
        </form>
      </div>
    </div>
  );
};
