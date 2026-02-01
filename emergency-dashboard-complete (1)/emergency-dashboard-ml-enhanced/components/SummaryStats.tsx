import React from 'react';
import { EmergencyRequest, ResourceUnit, Severity } from '../types';
import { Activity, ShieldCheck, Users, Zap } from 'lucide-react';

interface SummaryStatsProps {
    requests: EmergencyRequest[];
    resources: ResourceUnit[];
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ requests, resources }) => {
    const activeIncidents = requests.filter(r => r.status !== 'Resolved').length;
    const critical = requests.filter(r => r.severity === Severity.CRITICAL && r.status !== 'Resolved').length;
    const availableResources = resources.filter(r => r.status === 'Available').length;
    const resolutionRate = Math.round((requests.filter(r => r.status === 'Resolved').length / (requests.length || 1)) * 100);

    const stats = [
        { label: 'Active Incidents', value: activeIncidents, icon: Activity, color: 'text-blue-400', sub: `${critical} Critical` },
        { label: 'Units Available', value: availableResources, icon: ShieldCheck, color: 'text-emerald-400', sub: 'Ready to deploy' },
        { label: 'Resolution Rate', value: `${resolutionRate}%`, icon: Zap, color: 'text-yellow-400', sub: 'Last 24 hours' },
    ];

    return (
        <div className="flex items-center gap-6 py-3 px-6">
            {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-slate-800 ${stat.color} bg-opacity-10`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                        <div className="text-xl font-bold text-white leading-none">{stat.value}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">{stat.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};
