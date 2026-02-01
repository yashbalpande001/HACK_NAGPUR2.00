import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { EmergencyRequest, Severity } from '../types';
import { proximityService } from '../services/proximityService';

interface NearbyIncidentsProps {
  userLocation: { lat: number; lng: number } | null;
  allRequests: EmergencyRequest[];
  onSelectIncident: (requestId: string) => void;
  onNavigate: (requestId: string) => void;
}

export const NearbyIncidents: React.FC<NearbyIncidentsProps> = ({
  userLocation,
  allRequests,
  onSelectIncident,
  onNavigate
}) => {
  const [nearbyIncidents, setNearbyIncidents] = useState<any[]>([]);
  const [maxDistance, setMaxDistance] = useState(10); // km

  useEffect(() => {
    if (userLocation) {
      const nearby = proximityService.findNearbyIncidentsForResponder(
        userLocation,
        allRequests,
        maxDistance
      );
      setNearbyIncidents(nearby);
    }
  }, [userLocation, allRequests, maxDistance]);

  if (!userLocation) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 text-center border-2 border-blue-200">
        <MapPin className="w-16 h-16 text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Enable Location Access</h3>
        <p className="text-slate-600 mb-4">
          To see nearby emergencies and respond faster, please enable your location.
        </p>
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  // Location will be handled by parent component
                  window.location.reload();
                },
                (error) => {
                  alert('Unable to access location. Please enable GPS in your browser settings.');
                }
              );
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
        >
          Enable Location
        </button>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-600 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getDistanceIcon = (distance: number) => {
    if (distance < 2) return '🔥'; // Very close
    if (distance < 5) return '⚡'; // Close
    return '📍'; // Moderate distance
  };

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-black">Nearby Emergencies</h2>
            <p className="text-blue-100 text-sm">Within {maxDistance} km radius</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black">{nearbyIncidents.length}</div>
            <div className="text-blue-100 text-sm">Active</div>
          </div>
        </div>

        {/* Distance filter */}
        <div className="bg-white/20 rounded-xl p-3">
          <label className="text-xs font-bold mb-2 block">Search Radius</label>
          <input
            type="range"
            min="5"
            max="50"
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs mt-1">
            <span>5 km</span>
            <span className="font-bold">{maxDistance} km</span>
            <span>50 km</span>
          </div>
        </div>
      </div>

      {/* Incidents list */}
      {nearbyIncidents.length === 0 ? (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-800 mb-2">All Clear!</h3>
          <p className="text-green-700">No emergencies within {maxDistance} km of your location.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {nearbyIncidents.map((incident, idx) => {
            const request = allRequests.find(r => r.id === incident.requestId);
            if (!request) return null;

            const eta = proximityService.estimateETA(incident.distance);

            return (
              <div
                key={incident.requestId}
                className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 hover:border-blue-400 transition-all overflow-hidden"
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{getDistanceIcon(incident.distance)}</div>
                      <div>
                        <div className="font-bold text-slate-800 text-lg">
                          {incident.disasterType}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {incident.requestId}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-black ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {incident.description}
                  </p>

                  {/* Distance and ETA */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <MapPin className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-2xl font-black text-blue-700">
                        {incident.distance}
                      </div>
                      <div className="text-xs text-blue-600 font-bold">km away</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <Clock className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <div className="text-2xl font-black text-green-700">
                        {eta}
                      </div>
                      <div className="text-xs text-green-600 font-bold">min ETA</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onNavigate(incident.requestId)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      Navigate
                    </button>
                    <button
                      onClick={() => onSelectIncident(incident.requestId)}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl py-3 font-bold transition-all"
                    >
                      Details
                    </button>
                  </div>

                  {/* Priority badge for very close incidents */}
                  {incident.distance < 2 && (
                    <div className="mt-3 bg-red-600 text-white rounded-lg p-2 flex items-center gap-2 text-sm font-bold animate-pulse">
                      <AlertTriangle className="w-4 h-4" />
                      <span>VERY CLOSE - Immediate response possible!</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Location indicator */}
      <div className="bg-slate-100 rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Location updates automatically • Refreshes every 30 seconds
        </div>
      </div>
    </div>
  );
};
