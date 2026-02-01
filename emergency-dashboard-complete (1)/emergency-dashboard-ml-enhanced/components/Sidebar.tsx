import React from 'react';
import { ActiveView, UserRole } from '../types';
import {
    BarChart2,
    Map,
    Shield,
    FileText,
    Users,
    Settings,
    LogOut,
    LifeBuoy,
    AlertTriangle,
    Radio,
    Package,
    BrainCircuit,
    LayoutDashboard
} from 'lucide-react';

interface SidebarProps {
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void;
    role: UserRole;
    onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, role, onLogout }) => {
    const getMenuItems = () => {
        switch (role) {
            case 'authority':
                return [
                    { id: 'home', label: 'Command Center', icon: LayoutDashboard },
                    { id: 'intelligence', label: 'AI Intelligence', icon: BrainCircuit },
                    { id: 'inventory', label: 'Resource Inventory', icon: Package },
                    { id: 'report', label: 'Public Reports', icon: FileText },
                ];
            case 'civil_servant':
                return [
                    { id: 'task', label: 'Field Tasks', icon: Shield },
                    { id: 'inventory', label: 'Equipment', icon: Package },
                    { id: 'guidelines', label: 'Protocols', icon: FileText },
                ];
            case 'citizen':
            case 'guest':
                return [
                    { id: 'guidelines', label: 'Survival Guide', icon: LifeBuoy },
                    { id: 'report', label: 'Report Incident', icon: AlertTriangle },
                ];
            default:
                return [];
        }
    };

    const menuItems = getMenuItems();

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20 shadow-xl">
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Radio className="w-6 h-6 text-white animate-pulse" />
                    </div>
                    <div>
                        <h1 className="font-bold text-white tracking-tight">ResQ-AI</h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Online</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                <div className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {role === 'authority' ? 'Operations' : role === 'citizen' ? 'Assistance' : 'Field Work'}
                </div>

                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id as ActiveView)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeView === item.id
                                ? 'bg-blue-600/10 text-blue-400 ring-1 ring-blue-600/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                            }`}
                    >
                        <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-blue-400' : 'text-slate-500'}`} />
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="p-4 border-t border-slate-800">
                <div className="bg-slate-800/50 rounded-xl p-4 mb-3 border border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role === 'authority' ? 'bg-purple-500/20 text-purple-400' :
                                role === 'civil_servant' ? 'bg-orange-500/20 text-orange-400' :
                                    'bg-emerald-500/20 text-emerald-400'
                            }`}>
                            <Shield className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-200 truncate capitalize">{role.replace('_', ' ')}</p>
                            <p className="text-[10px] text-slate-500 truncate">ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Disconnect
                </button>
            </div>
        </aside>
    );
};
