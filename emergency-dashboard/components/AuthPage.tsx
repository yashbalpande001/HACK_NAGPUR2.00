import React, { useState } from 'react';
import { UserRole } from '../types';
import { authService } from '../services/authService';
import { Shield, User, Lock, HeartHandshake } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: (role: UserRole) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    authService.login(name, role);
    onAuthSuccess(role);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-2">Emergency Response</h1>
        <p className="text-slate-400 text-center mb-8">Secure Access Portal</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Classification</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('citizen')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === 'citizen'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                  }`}
              >
                <User className="w-5 h-5" />
                <span className="text-xs font-bold">Rescuer</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('authority')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === 'authority'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                  }`}
              >
                <Shield className="w-5 h-5" />
                <span className="text-xs font-bold">Authority</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('civil_servant')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === 'civil_servant'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                  }`}
              >
                <HeartHandshake className="w-5 h-5" />
                <span className="text-xs font-bold">Civil Ser.</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Access ID / Name</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-11"
                placeholder="Enter your name"
                required
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};
