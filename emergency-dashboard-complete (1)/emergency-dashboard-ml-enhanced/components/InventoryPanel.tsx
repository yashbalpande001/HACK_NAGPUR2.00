import React from 'react';
import { ResourceUnit, ResourceStatus, ResourceType } from '../types';
import { Package, Truck, Activity, Wrench, Archive } from 'lucide-react';

interface InventoryPanelProps {
    resources: ResourceUnit[];
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ resources }) => {
    const getIcon = (type: ResourceType) => {
        switch (type) {
            case ResourceType.AMBULANCE: return Truck;
            case ResourceType.MEDICAL_TEAM: return Activity;
            case ResourceType.FOOD_SUPPLY: return Package;
            case ResourceType.RESCUE_UNIT: return Wrench;
            default: return Archive;
        }
    };

    const grouped = resources.reduce((acc, res) => {
        if (!acc[res.type]) acc[res.type] = { total: 0, available: 0, units: [] };
        acc[res.type].total++;
        if (res.status === ResourceStatus.AVAILABLE) acc[res.type].available++;
        acc[res.type].units.push(res);
        return acc;
    }, {} as Record<string, { total: number; available: number; units: ResourceUnit[] }>);

    return (
        <div className="w-full max-w-5xl mx-auto p-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-500" />
                Resource Inventory
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {(Object.entries(grouped) as [string, typeof grouped[string]][]).map(([type, data]) => {
                    const Icon = getIcon(type as ResourceType);
                    return (
                        <div key={type} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${data.available > 0
                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                    : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                                    }`}>
                                    {Math.round((data.available / data.total) * 100)}% Ready
                                </div>
                            </div>
                            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">{type}</h3>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                                {data.available} <span className="text-lg text-slate-400 dark:text-slate-500 font-normal">/ {data.total}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg dark:text-white">Detailed Asset Tracking</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Location</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {resources.map((res) => (
                                <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs">{res.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{res.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2">
                                            {React.createElement(getIcon(res.type), { size: 14 })}
                                            {res.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${res.status === ResourceStatus.AVAILABLE ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                            res.status === ResourceStatus.IN_USE ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400' :
                                                'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400'
                                            }`}>
                                            {res.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">
                                        {res.location.lat.toFixed(4)}, {res.location.lng.toFixed(4)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
