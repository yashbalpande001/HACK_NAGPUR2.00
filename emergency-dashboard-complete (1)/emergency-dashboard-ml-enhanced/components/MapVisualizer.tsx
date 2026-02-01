import React, { useEffect, useRef, useState } from 'react';
import { EmergencyRequest, ResourceUnit, MapZone, Severity, ResourceStatus, UserRole } from '../types';
import { MapPin, Truck, AlertTriangle } from 'lucide-react';

interface MapVisualizerProps {
    requests: EmergencyRequest[];
    resources: ResourceUnit[];
    zones: MapZone[];
    role: UserRole;
    selectedRequest?: EmergencyRequest;
    onMarkerClick: (id: string, type: 'req' | 'res') => void;
    onZonesChange: (zones: MapZone[]) => void;
}

export const MapVisualizer: React.FC<MapVisualizerProps> = ({
    requests,
    resources,
    zones,
    role,
    selectedRequest,
    onMarkerClick,
    onZonesChange
}) => {
    const mapRef = useRef<HTMLDivElement>(null);

    // Simplified map visualization using a dark static background
    // In a real app complexity this would be Leaflet or React Map GL

    const getSeverityColor = (severity: Severity) => {
        switch (severity) {
            case Severity.CRITICAL: return 'bg-red-500 shadow-red-500/50';
            case Severity.HIGH: return 'bg-orange-500 shadow-orange-500/50';
            case Severity.MEDIUM: return 'bg-yellow-500 shadow-yellow-500/50';
            case Severity.LOW: return 'bg-emerald-500 shadow-emerald-500/50';
        }
    };

    // Helper to project lat/long to percent for this fake map container
    // Bounding box for "City" demo: 
    const minLat = 28.5;
    const maxLat = 28.7;
    const minLng = 77.1;
    const maxLng = 77.3;

    const project = (lat: number, lng: number) => {
        // Normalize to 0-100%
        // If coords are wild, clamp them or center them
        // For demo using generic offsets
        const y = ((lat - minLat) / (maxLat - minLat)) * 100;
        const x = ((lng - minLng) / (maxLng - minLng)) * 100;

        // Fallback for random demo data that might be widely spread
        // We'll hash coords to placement for stable random position if out of bounds
        if (y < 0 || y > 100 || x < 0 || x > 100) {
            return {
                top: `${(Math.abs(lat * 1000) % 80) + 10}%`,
                left: `${(Math.abs(lng * 1000) % 80) + 10}%`
            };
        }

        return { top: `${100 - y}%`, left: `${x}%` };
    };

    return (
        <div className="absolute inset-0 bg-slate-950 overflow-hidden group">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Radar Scan Effect */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(16,185,129,0.05)_50%,transparent_100%)] animate-pulse" />
            </div>

            {/* Map Content Container */}
            <div ref={mapRef} className="absolute inset-0 relative z-10">

                {/* Render Requests */}
                {requests.map(req => {
                    const pos = project(req.location.lat, req.location.lng);
                    const isSelected = selectedRequest?.id === req.id;

                    return (
                        <button
                            key={req.id}
                            onClick={() => onMarkerClick(req.id, 'req')}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${isSelected ? 'z-50 scale-125' : 'z-20 hover:scale-110 hover:z-40'}`}
                            style={pos}
                        >
                            <div className={`relative flex items-center justify-center w-8 h-8 rounded-full ${getSeverityColor(req.severity)} bg-opacity-20 backdrop-blur-sm border-2 border-white/20 shadow-lg ${req.status === 'Pending' ? 'animate-bounce-slow' : ''}`}>
                                <AlertTriangle className="w-4 h-4 text-white" />
                                {/* Ripple for critical pending */}
                                {req.severity === Severity.CRITICAL && req.status === 'Pending' && (
                                    <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                                )}
                            </div>
                            {isSelected && (
                                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900/90 text-xs px-2 py-1 rounded border border-slate-700 whitespace-nowrap text-white pointer-events-none">
                                    {req.disasterType}
                                </div>
                            )}
                        </button>
                    );
                })}

                {/* Render Resources */}
                {resources.map(res => {
                    if (res.status === ResourceStatus.MAINTENANCE) return null;
                    const pos = project(res.location.lat, res.location.lng);

                    return (
                        <div
                            key={res.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-700 ease-in-out"
                            style={pos}
                        >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center shadow-md ${res.status === ResourceStatus.AVAILABLE ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                <Truck className="w-3 h-3" />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-800 p-2 rounded-lg text-[10px] text-slate-400 z-20">
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Critical
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span> High
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span> Resource
                </div>
            </div>
        </div>
    );
};
