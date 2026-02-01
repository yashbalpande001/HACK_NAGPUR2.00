import React, { useMemo, useState } from 'react';
import { EmergencyRequest, ResourceUnit, Severity } from '../types';
import {
    AlertCircle,
    MapPin,
    Truck,
    Filter,
    Search,
    Clock,
    MoreHorizontal,
    ArrowUpRight
} from 'lucide-react';

interface EmergencyPanelProps {
    requests: EmergencyRequest[];
    resources: ResourceUnit[];
    onSelect: (req: EmergencyRequest) => void;
    selectedRequestId?: string;
    onAutoAllocate: (id: string) => void;
}

export const EmergencyPanel: React.FC<EmergencyPanelProps> = ({
    requests,
    resources,
    onSelect,
    selectedRequestId,
    onAutoAllocate
}) => {
    const [filter, setFilter] = useState<'all' | 'pending' | 'allocated'>('all');
    const [search, setSearch] = useState('');

    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            if (filter === 'pending' && req.status !== 'Pending') return false;
            if (filter === 'allocated' && req.status !== 'Allocated') return false;

            if (search) {
                const query = search.toLowerCase();
                return (
                    req.disasterType.toLowerCase().includes(query) ||
                    req.description.toLowerCase().includes(query) ||
                    req.id.toLowerCase().includes(query)
                );
            }

            return true;
        });
    }, [requests, filter, search]);

    const getSeverityColor = (severity: Severity) => {
        switch (severity) {
            case Severity.CRITICAL: return 'text-red-500 bg-red-500/10 border-red-500/20';
            case Severity.HIGH: return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case Severity.MEDIUM: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case Severity.LOW: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-900 overflow-hidden">
            <div className="p-4 border-b border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-slate-100 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-500" />
                        Live Incidents
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-400 border border-slate-700">
                            {filteredRequests.length}
                        </span>
                    </h2>
                    <div className="flex gap-1">
                        <button className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search incident ID, type..."
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                </div>

                <div className="flex gap-2">
                    {(['all', 'pending', 'allocated'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${filter === f
                                    ? 'bg-blue-600/10 text-blue-400 border-blue-600/20'
                                    : 'bg-slate-800/50 text-slate-500 border-transparent hover:bg-slate-800'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredRequests.map(req => (
                    <div
                        key={req.id}
                        onClick={() => onSelect(req)}
                        className={`group p-4 rounded-xl border transition-all cursor-pointer ${selectedRequestId === req.id
                                ? 'bg-blue-600/5 border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                                : 'bg-slate-800/30 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${getSeverityColor(req.severity)}`}>
                                    {req.severity}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500">#{req.id.split('-')[1]}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded-full">
                                <Clock className="w-3 h-3" />
                                {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        <h3 className="font-semibold text-slate-200 text-sm mb-1 group-hover:text-blue-400 transition-colors flex items-center justify-between">
                            {req.disasterType}
                            {selectedRequestId === req.id && <ArrowUpRight className="w-4 h-4 opacity-50" />}
                        </h3>

                        <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                            {req.description}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <MapPin className="w-3 h-3" />
                                Location detected
                            </div>

                            {req.status === 'Pending' ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAutoAllocate(req.id);
                                    }}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors"
                                >
                                    Dispatch
                                </button>
                            ) : (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-wide">
                                    <Truck className="w-3 h-3" />
                                    {req.status}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {filteredRequests.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                        <Filter className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">No incidents match filter</p>
                    </div>
                )}
            </div>
        </div>
    );
};
