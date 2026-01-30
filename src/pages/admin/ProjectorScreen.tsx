import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Clock, QrCode, Monitor } from 'lucide-react';

export const ProjectorScreen: React.FC = () => {
    const { user } = useAuth();
    const [activeSession, setActiveSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchSession = async () => {
        try {
            const res = await fetch('/api/sessions/active');
            const data = await res.json();
            setActiveSession(data);
        } catch (err) {
            console.error('Error fetching session:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSession();
        const interval = setInterval(fetchSession, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-slate-800 border-t-church-gold rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!activeSession) {
        return (
            <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center text-center p-10">
                <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center mb-8 border border-slate-800">
                    <Monitor className="w-12 h-12 text-slate-700" />
                </div>
                <h1 className="text-5xl font-bold text-white mb-4 italic tracking-tight">Anointed Worship Center</h1>
                <p className="text-2xl text-slate-500">No active check-in session</p>
                <div className="mt-20 text-slate-600 text-sm">Waiting for administrator to start session...</div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-between py-24 text-center">
            {/* Header */}
            <div>
                <h2 className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xl mb-4">Anointed Worship Center</h2>
                <h1 className="text-6xl font-black text-white italic tracking-tighter">{activeSession.service_type}</h1>
            </div>

            {/* Code Section */}
            <div className="flex flex-col items-center scale-110 lg:scale-[1.5]">
                <p className="text-2xl font-bold text-church-gold uppercase tracking-widest mb-6">Check-In Code</p>
                <div className="flex gap-4">
                    {activeSession.code.split('').map((digit: string, i: number) => (
                        <div key={i} className="w-32 h-44 bg-white rounded-2xl flex items-center justify-center text-8xl font-black text-slate-950 shadow-2xl border-b-8 border-slate-300">
                            {digit}
                        </div>
                    ))}
                </div>
                <div className="mt-12 flex items-center gap-4 bg-slate-900/50 border border-slate-800 px-8 py-4 rounded-full">
                    <QrCode className="w-8 h-8 text-church-gold" />
                    <p className="text-2xl font-medium text-slate-300">Open <span className="text-white font-bold">AWC-Connect</span> App & Enter Code</p>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-12 text-slate-500">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-lg font-semibold uppercase tracking-widest">Started at {new Date(activeSession.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span className="text-lg font-semibold uppercase tracking-widest">Secure Live Session</span>
                </div>
            </div>
        </div>
    );
};
