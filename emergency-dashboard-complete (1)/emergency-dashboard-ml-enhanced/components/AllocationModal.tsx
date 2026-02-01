import React, { useState } from 'react';
import { EmergencyRequest, ResourceUnit, ResourceStatus, ResourceType } from '../types';
import { Truck, X, ShieldCheck, MapPin, Clock } from 'lucide-react';
import { getBestResource } from '../services/allocationEngine';

interface AllocationModalProps {
    request: EmergencyRequest;
    resources: ResourceUnit[];
    onClose: () => void;
    onAllocate: (requestId: string, resourceId: string) => void;
}

export const AllocationModal: React.FC<AllocationModalProps> = ({ request, resources, onClose, onAllocate }) => {
    const [selectedResource, setSelectedResource] = useState<string>('');

    const compatibleResources = resources.filter(
        r => r.type === request.resourceNeeded && r.status === ResourceStatus.AVAILABLE
    );

    const bestResource = getBestResource(request, resources);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                            <Truck className="w-6 h-6 text-blue-500" />
                        </div>
                        Deploy Resources
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4">Incident Details</h3>
                        <div className="bg-slate-800/50 rounded-xl p-4 space-y-4">
                            <div>
                                <label className="text-xs text-slate-400">Type</label>
                                <div className="font-bold text-white">{request.disasterType}</div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Description</label>
                                <div className="text-sm text-slate-300">{request.description}</div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Required Resource</label>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold mt-1">
                                    {request.resourceNeeded}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4">Available Units</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {bestResource && (
                                <div
                                    onClick={() => setSelectedResource(bestResource.id)}
                                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedResource === bestResource.id
                                            ? 'border-emerald-500 bg-emerald-500/10'
                                            : 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-white text-sm">{bestResource.name}</span>
                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wide">Best Match</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> 2.4km</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 4m ETA</span>
                                    </div>
                                </div>
                            )}

                            {compatibleResources.filter(r => r.id !== bestResource?.id).map(res => (
                                <div
                                    key={res.id}
                                    onClick={() => setSelectedResource(res.id)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedResource === res.id
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800'
                                        }`}
                                >
                                    <div className="font-bold text-white text-sm">{res.name}</div>
                                    <div className="text-xs text-slate-500 mt-1">ID: {res.id}</div>
                                </div>
                            ))}

                            {compatibleResources.length === 0 && (
                                <div className="text-center py-8 text-slate-500 text-sm">
                                    No {request.resourceNeeded} available.
                                    <br />
                                    <button className="text-blue-400 hover:underline mt-2">Request Mutual Aid</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors">
                        Cancel
                    </button>
                    <button
                        disabled={!selectedResource}
                        onClick={() => selectedResource && onAllocate(request.id, selectedResource)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        Confirm Allocation
                    </button>
                </div>
            </div>
        </div>
    );
};
