import React, { useState } from 'react';
import { UserRole } from '../types';
import { Shield, Mail, Lock, User, Phone, ArrowRight, AlertTriangle } from 'lucide-react';
import { authService } from '../services/authService';

interface AuthPageProps {
    onAuthSuccess: (role: UserRole) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState<UserRole>('citizen');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            if (isLogin) {
                const user = authService.login({ email, password });
                if (user) {
                    onAuthSuccess(user.role);
                } else {
                    setError('Invalid credentials');
                }
            } else {
                const user = authService.signup({
                    name,
                    email,
                    password,
                    contactNumber: phone,
                    role
                });

                if (user) {
                    onAuthSuccess(user.role);
                } else {
                    setError('Email already exists or invalid data');
                }
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.1),transparent_50%)]" />

            <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-blue-500/20">
                        <Shield className="w-8 h-8 text-blue-500" />
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        ResQ-AI
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">Next-Gen Emergency Response System</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</label>
                                <select
                                    value={role}
                                    onChange={e => setRole(e.target.value as UserRole)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                >
                                    <option value="citizen">Citizen</option>
                                    <option value="civil_servant">Civil Servant (Responder)</option>
                                    <option value="authority">Authority (Admin)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6 group"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-slate-400 hover:text-white text-sm transition-colors hover:underline underline-offset-4"
                    >
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                </div>
            </div>

            {/* Demo Credentials Hint */}
            {isLogin && (
                <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-slate-600 pointer-events-none">
                    Try: admin@emergency.gov / admin123
                </div>
            )}
        </div>
    );
};
