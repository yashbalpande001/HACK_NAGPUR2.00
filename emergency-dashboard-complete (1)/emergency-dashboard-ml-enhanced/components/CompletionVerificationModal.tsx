import React, { useState, useRef } from 'react';
import { Camera, CheckCircle, XCircle, Loader, Shield } from 'lucide-react';
import { mlVerificationService } from '../services/mlVerificationService';

interface CompletionVerificationModalProps {
  requestId: string;
  responderId: string;
  onVerified: (imageData: string, verified: boolean) => void;
  onClose: () => void;
}

export const CompletionVerificationModal: React.FC<CompletionVerificationModalProps> = ({
  requestId,
  responderId,
  onVerified,
  onClose
}) => {
  const [imageData, setImageData] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageData(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleVerifyCompletion = async () => {
    if (!imageData) {
      alert('Please capture a photo of the completed rescue operation');
      return;
    }

    setIsVerifying(true);

    try {
      const result = await mlVerificationService.verifyCompletion(
        imageData,
        requestId,
        responderId
      );

      setVerificationResult(result);
      setIsVerifying(false);

      if (result.verified) {
        alert(`✅ RESCUE COMPLETION VERIFIED!\n\n${result.reason}\nConfidence: ${Math.round(result.confidence * 100)}%\n\nResources will be marked as available.`);
        onVerified(imageData, true);
      } else {
        const retry = confirm(`⚠️ VERIFICATION FAILED\n\n${result.reason}\nConfidence: ${Math.round(result.confidence * 100)}%\n\nPlease ensure photo shows:\n- Rescue team in uniform\n- Rescued victims\n- Medical/rescue equipment\n\nRetry with better photo?`);
        if (!retry) {
          onVerified(imageData, false);
        }
      }
    } catch (error) {
      setIsVerifying(false);
      alert('Error verifying completion. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-green-700 flex items-center gap-2">
              <Shield className="w-7 h-7" />
              Verify Rescue Completion
            </h2>
            <p className="text-sm text-slate-600 mt-1">Photo proof required for verification</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-blue-800 mb-2">📸 Photo Requirements:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✓ Rescue team in uniform/gear visible</li>
            <li>✓ Rescued victims in frame</li>
            <li>✓ Medical or rescue equipment shown</li>
            <li>✓ Clear, well-lit photo</li>
          </ul>
        </div>

        {/* Image Capture */}
        <div className="border-4 border-dashed border-green-300 rounded-xl p-6 bg-green-50 mb-6">
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
                className="w-full py-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all text-lg"
              >
                <Camera className="w-8 h-8" />
                Capture Completion Photo
              </button>
            </div>
          ) : (
            <div className="relative">
              <img src={imagePreview} alt="Completion" className="w-full h-80 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => { setImageData(null); setImagePreview(null); setVerificationResult(null); }}
                className="absolute top-3 right-3 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 shadow-lg"
              >
                <XCircle className="w-6 h-6" />
              </button>
              
              {verificationResult && (
                <div className={`absolute bottom-3 left-3 right-3 ${verificationResult.verified ? 'bg-green-600' : 'bg-red-600'} text-white rounded-lg p-3`}>
                  <div className="flex items-center gap-2 font-bold">
                    {verificationResult.verified ? (
                      <><CheckCircle className="w-5 h-5" /> VERIFIED</>
                    ) : (
                      <><XCircle className="w-5 h-5" /> NOT VERIFIED</>
                    )}
                  </div>
                  <div className="text-xs mt-1">{verificationResult.reason}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleVerifyCompletion}
            disabled={!imageData || isVerifying}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            {isVerifying ? (
              <><Loader className="w-5 h-5 animate-spin" /> Verifying...</>
            ) : (
              <><Shield className="w-5 h-5" /> Verify & Complete</>
            )}
          </button>
        </div>

        <p className="text-xs text-center text-slate-500 mt-4">
          ML verification ensures authentic rescue completion
        </p>
      </div>
    </div>
  );
};
