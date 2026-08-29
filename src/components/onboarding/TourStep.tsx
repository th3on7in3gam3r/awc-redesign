import React from 'react';
import { Video, Calendar, BookOpen, Sparkles } from 'lucide-react';

interface TourStepProps {
    onComplete: () => void;
    onBack: () => void;
}

export const TourStep: React.FC<TourStepProps> = ({ onComplete, onBack }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-church-burgundy to-church-gold rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">You're All Set!</h2>
                <p className="text-slate-600 max-w-md mx-auto">
                    Here's a quick tour of what you can do with AWC-Connect
                </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {/* Sermons */}
                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-4">
                        <Video className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">Watch Sermons</h3>
                    <p className="text-sm text-slate-600">
                        Access our full sermon library with videos, audio, and notes
                    </p>
                </div>

                {/* Events */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                        <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">Join Events</h3>
                    <p className="text-sm text-slate-600">
                        Stay updated on upcoming services, Bible studies, and community events
                    </p>
                </div>

                {/* Check-in */}
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">Express Check-in</h3>
                    <p className="text-sm text-slate-600">
                        Get your digital pass for Sunday services and track your attendance
                    </p>
                </div>
            </div>

            {/* Celebration Message */}
            <div className="max-w-md mx-auto">
                <div className="p-6 bg-gradient-to-r from-church-burgundy to-purple-900 rounded-2xl text-center text-white">
                    <p className="text-2xl mb-2">🎉</p>
                    <p className="font-bold mb-1">Welcome to the family!</p>
                    <p className="text-sm text-white/80">
                        We're excited to journey with you in faith
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between max-w-md mx-auto">
                <button
                    onClick={onBack}
                    className="px-8 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                    ← Back
                </button>
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-gradient-to-r from-church-burgundy to-church-gold text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg"
                >
                    Get Started! 🚀
                </button>
            </div>
        </div>
    );
};
