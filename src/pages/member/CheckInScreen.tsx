import React, { useState, useEffect } from 'react';
import { QrCode, AlertCircle } from 'lucide-react';

export const CheckInScreen: React.FC = () => {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchSession = async () => {
        try {
            const res = await fetch('/api/checkin/active');
            const data = await res.json();

            // Transform response to include event and session
            if (data && data.session) {
                setSession({
                    ...data.session,
                    event: data.event
                });
            } else {
                setSession(null);
            }
            setError(false);
        } catch (err) {
            console.error('Error fetching session:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSession();
        const interval = setInterval(fetchSession, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-church-burgundy via-church-burgundy to-black flex items-center justify-center">
                <div className="w-20 h-20 border-8 border-white/20 border-t-church-gold rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!session || error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center text-center px-6">
                <div className="max-w-2xl">
                    <div className="w-32 h-32 bg-slate-700/50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-8">
                        <AlertCircle className="w-16 h-16" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4">Session Ended</h1>
                    <p className="text-2xl text-slate-400">
                        Check-in is currently closed. Please wait for the next service to begin.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-church-burgundy via-church-burgundy to-black flex flex-col items-center justify-center text-center px-6 py-12 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-20 w-96 h-96 bg-church-gold rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>

            {/* Logo */}
            <div className="relative z-10 mb-12">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-8 border-church-gold/30 shadow-2xl mx-auto mb-6">
                    <img
                        src="https://anointedworshipcenter.com/logo.png"
                        className="w-full h-full object-contain p-4"
                        alt="AWC Logo"
                    />
                </div>
                <h2 className="text-3xl font-bold text-white/90 uppercase tracking-widest">
                    Anointed Worship Center
                </h2>
            </div>

            {/* Event Title */}
            <div className="relative z-10 mb-8">
                <div className="inline-block bg-church-gold/20 border-2 border-church-gold px-8 py-4 rounded-2xl">
                    <p className="text-3xl font-bold text-church-gold uppercase tracking-wider">
                        {session.event?.title || 'Check-In'}
                    </p>
                    {session.event?.location && (
                        <p className="text-lg text-white/80 mt-2">
                            {session.event.location}
                        </p>
                    )}
                </div>
            </div>

            {/* Main Code Display */}
            <div className="relative z-10 mb-12">
                <p className="text-2xl font-bold text-white/60 uppercase tracking-widest mb-6">
                    Enter This Code
                </p>
                <div className="flex gap-6 justify-center mb-8">
                    {session.code.split('').map((digit: string, i: number) => (
                        <div
                            key={i}
                            className="w-32 h-40 bg-white rounded-3xl shadow-2xl flex items-center justify-center border-4 border-church-gold/30 transform hover:scale-105 transition-transform"
                        >
                            <span className="text-9xl font-black text-church-burgundy">
                                {digit}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Instructions */}
            <div className="relative z-10 max-w-3xl">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <QrCode className="w-8 h-8 text-church-gold" />
                        <h3 className="text-2xl font-bold text-white">How to Check In</h3>
                    </div>
                    <ol className="text-left text-xl text-white/80 space-y-3 max-w-xl mx-auto">
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-church-gold text-church-burgundy rounded-full flex items-center justify-center font-black text-sm">1</span>
                            <span>Open <strong>AWC-Connect</strong> on your phone or device</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-church-gold text-church-burgundy rounded-full flex items-center justify-center font-black text-sm">2</span>
                            <span>Navigate to <strong>Check-In</strong></span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 bg-church-gold text-church-burgundy rounded-full flex items-center justify-center font-black text-sm">3</span>
                            <span>Enter the <strong>4-digit code</strong> shown above</span>
                        </li>
                    </ol>
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 mt-12">
                <p className="text-sm text-white/40 uppercase tracking-widest">
                    Session started at {new Date(session.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
};

export default CheckInScreen;
