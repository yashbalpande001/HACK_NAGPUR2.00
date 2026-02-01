import React from 'react';
import { BookOpen, Shield, Heart, Zap, Waves, Wind, Flame, AlertTriangle } from 'lucide-react';
import { DisasterType } from '../types';

export const SurvivalGuide: React.FC = () => {
    const guides = [
        {
            title: 'Earthquake Safety',
            icon: ActivityIcon,
            type: DisasterType.EARTHQUAKE,
            steps: [
                'Drop, Cover, and Hold On',
                'Stay away from windows and heavy furniture',
                'If indoors, stay there until shaking stops',
                'Identify safe spots in each room'
            ],
            color: 'text-orange-500 bg-orange-500/10'
        },
        {
            title: 'Flood Precautions',
            icon: Waves,
            type: DisasterType.FLOOD,
            steps: [
                'Move to higher ground immediately',
                'Do not walk or drive through flood waters',
                'Disconnect electrical appliances',
                'Follow evacuation orders instantly'
            ],
            color: 'text-blue-500 bg-blue-500/10'
        },
        {
            title: 'Fire Emergency',
            icon: Flame,
            type: DisasterType.FIRE,
            steps: [
                'Crawl low under smoke to exit',
                'Check doors for heat before opening',
                'Stop, Drop, and Roll if clothes catch fire',
                'Use stairs, never elevators'
            ],
            color: 'text-red-500 bg-red-500/10'
        }
    ];

    function ActivityIcon(props: any) {
        return (
            <svg
                {...props}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
        )
    }

    return (
        <div className="flex-1 bg-slate-50 dark:bg-slate-900 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold dark:text-white flex items-center justify-center gap-3">
                        <BookOpen className="w-8 h-8 text-blue-500" />
                        Emergency Survival Guide
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-lg mx-auto">
                        Essential protocols and safety measures for various emergency scenarios. Read these carefully to prepare yourself.
                    </p>
                </div>

                <div className="grid gap-6">
                    {guides.map((guide, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6 md:flex gap-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${guide.color} mb-4 md:mb-0`}>
                                    <guide.icon className="w-8 h-8" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold dark:text-white mb-3 flex items-center gap-2">
                                        {guide.title}
                                        <span className="text-[10px] uppercase font-bold text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full tracking-wider">Protocol</span>
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        {guide.steps.map((step, idx) => (
                                            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 flex-shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-sm dark:text-slate-300">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="p-6 bg-indigo-600 rounded-2xl text-white shadow-xl mt-4 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Emergency Contacts
                            </h3>
                            <p className="text-indigo-200 text-sm mt-1">Keep these numbers handy at all times.</p>
                        </div>
                        <div className="flex gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold bg-indigo-500 px-3 py-1 rounded-lg">112</div>
                                <div className="text-[10px] uppercase font-bold tracking-wider mt-1 opacity-75">Universal</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold bg-indigo-500 px-3 py-1 rounded-lg">108</div>
                                <div className="text-[10px] uppercase font-bold tracking-wider mt-1 opacity-75">Medical</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
