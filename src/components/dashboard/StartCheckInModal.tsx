import React, { useState } from 'react';
import { X, Play, Shield, Users, Clock, Hash } from 'lucide-react';

interface StartCheckInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (session: { type: string, code: string }) => void;
}

export const StartCheckInModal: React.FC<StartCheckInModalProps> = ({ isOpen, onClose, onStart }) => {
    const [serviceType, setServiceType] = useState('Sunday Worship');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');

    if (!isOpen) return null;

    const handleStart = async () => {
        setIsGenerating(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/checkin/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    service_type: serviceType
                })
            });

            if (!response.ok) {
                throw new Error('Failed to start session');
            }

            const data = await response.json();

            // Show generated code briefly
            setGeneratedCode(data.session.code);

            setTimeout(() => {
                onStart(data.session);
                setIsGenerating(false);
                setGeneratedCode('');
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Error starting session:', error);
            alert('Failed to start check-in session. Please try again.');
            setIsGenerating(false);
        }
    };

    const serviceTypes = [
        { name: 'Sunday Worship', icon: Users, color: 'text-indigo-600' },
        { name: 'Bible Study', icon: Shield, color: 'text-emerald-600' },
        { name: 'Prayer Night', icon: Clock, color: 'text-purple-600' },
        { name: 'Youth Night', icon: Hash, color: 'text-rose-600' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Start Check-In Session</h3>
                        <p className="text-sm text-slate-500 mt-1">Select a service to generate a secure 4-digit code.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                        {serviceTypes.map((type) => (
                            <button
                                key={type.name}
                                onClick={() => setServiceType(type.name)}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${serviceType === type.name
                                    ? 'border-church-gold bg-amber-50 shadow-sm'
                                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                <type.icon className={`w-6 h-6 mb-2 ${type.color}`} />
                                <span className={`text-xs font-bold leading-tight text-center ${serviceType === type.name ? 'text-amber-900' : 'text-slate-600'}`}>
                                    {type.name}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100">
                                <Shield className="w-5 h-5 text-church-gold" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Session Security</p>
                                <p className="text-sm font-semibold text-slate-700">Encrypted check-in active</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0">
                    <button
                        onClick={handleStart}
                        disabled={isGenerating}
                        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-church-gold/20 ${isGenerating ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-church-gold text-white hover:bg-amber-600'
                            }`}
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                                Initializing Session...
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5 fill-current" />
                                Start {serviceType}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
