import React from 'react';
import { EmergencyRequest, ResourceUnit } from '../types';
import { CheckCircle, MapPin, Navigation, Camera, AlertTriangle } from 'lucide-react';

interface CivilServantViewProps {
    requests: EmergencyRequest[];
    resources: ResourceUnit[];
    onResolve: (requestId: string) => void;
    onStatusUpdate: (status: string) => void;
}

export const CivilServantView: React.FC<CivilServantViewProps> = ({
    requests,
    resources,
    onResolve,
    onStatusUpdate
}) => {
    // Filter for assigned tasks (mock logic - in real app would filter by user ID)
    // For demo, shows all allocated tasks or high priority ones
    const activeTasks = requests.filter(r => r.status === 'Allocated' || (r.status === 'Pending' && r.severity === 'Critical'));

    return (
        <div className="flex-1 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
            <div className="p-4 bg-slate-900 text-white sticky top-0 z-10 shadow-lg">
                <div className="flex items-center justify-between">
                    <h1 className="font-bold text-lg">Field Ops Dashboard</h1>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs uppercase font-bold text-emerald-500">Active Duty</span>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4 max-w-2xl mx-auto">
                {activeTasks.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300">All Clear</h3>
                        <p>No active tasks assigned to your unit.</p>
                    </div>
                ) : (
                    activeTasks.map(task => (
                        <div key={task.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${task.severity === 'Critical' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                                            }`}>
                                            {task.severity}
                                        </span>
                                        <span className="text-xs font-mono text-slate-500">#{task.id}</span>
                                    </div>
                                    <h3 className="font-bold text-lg dark:text-white">{task.disasterType}</h3>
                                </div>
                                {task.status === 'Pending' && (
                                    <div className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold animate-pulse">
                                        New Alert
                                    </div>
                                )}
                            </div>

                            <div className="p-4 space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                        <MapPin className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 font-bold uppercase">Location</label>
                                        <p className="text-sm font-medium dark:text-slate-300">
                                            Lat: {task.location.lat.toFixed(4)}, Lng: {task.location.lng.toFixed(4)}
                                        </p>
                                        <button className="mt-2 text-xs flex items-center gap-1 text-blue-500 font-bold hover:underline">
                                            <Navigation className="w-3 h-3" /> Start Navigation
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                        <AlertTriangle className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 font-bold uppercase">Details</label>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">{task.description}</p>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        onClick={() => onResolve(task.id)}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
                                    >
                                        <Camera className="w-4 h-4" />
                                        Verify & Complete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
