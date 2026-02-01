import React from 'react';
import { EmergencyRequest, ResourceUnit } from '../types';
import { Brain, TrendingUp, AlertOctagon, Map as MapIcon, FileText } from 'lucide-react';

interface IntelligenceViewProps {
    requests: EmergencyRequest[];
    resources: ResourceUnit[];
}

export const IntelligenceView: React.FC<IntelligenceViewProps> = ({ requests, resources }) => {
    return (
        <div className="flex-1 bg-slate-50 dark:bg-slate-900 p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                        <Brain className="w-8 h-8 text-purple-500" />
                        Strategic Intelligence
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        AI-driven insights for disaster management and predictive resource allocation.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold dark:text-white">Trend Analysis</h3>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Incident rates are trending <span className="text-red-500 font-bold">↑ 15%</span> compared to last week.
                        </p>
                        <div className="h-24 flex items-end gap-1">
                            {[40, 60, 45, 70, 85, 30, 65].map((h, i) => (
                                <div key={i} className="flex-1 bg-purple-500/20 rounded-t-sm hover:bg-purple-500 transition-colors" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                                <AlertOctagon className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold dark:text-white">Risk Prediction</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Flood Risk</span>
                                <span className="font-bold text-red-500">High</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 w-[85%]"></div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Fire Hazard</span>
                                <span className="font-bold text-yellow-500">Moderate</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500 w-[45%]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <MapIcon className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold dark:text-white">Hotspots</h3>
                        </div>
                        <ul className="space-y-3">
                            {['Downtown Sector 4', 'North Industrial Zone', 'Riverside District'].map((spot, i) => (
                                <li key={i} className="flex items-center justify-between text-sm p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                    <span className="dark:text-slate-300">{spot}</span>
                                    <span className="text-xs font-bold bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-2 py-0.5 rounded">
                                        Active
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold dark:text-white">AI Recommendations</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800 rounded-xl relative overflow-hidden">
                            <div className="flex gap-4">
                                <Brain className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-blue-900 dark:text-blue-100">Predictive Deployment Suggested</h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                        Based on historical data and current weather patterns, there is an 85% probability of increased flood reports in the <strong>Riverside District</strong> within the next 4 hours. Recommend pre-positioning Rescue Unit-04 to Sector 2.
                                    </p>
                                    <button className="mt-3 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold transition-colors">
                                        Execute Deployment
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800 rounded-xl relative">
                            <div className="flex gap-4">
                                <TrendingUp className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-yellow-900 dark:text-yellow-100">Resource Optimization</h4>
                                    <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                                        Ambulance utilization is currently at 90%. Consider requesting mutual aid from neighboring jurisdictions or activating reserve private ambulance fleets.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
