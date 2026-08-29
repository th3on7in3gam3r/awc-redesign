import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, ShieldCheck, ArrowRight } from 'lucide-react';

const ADMIN_ROLES = ['admin', 'pastor'];

export const ChoosePortal: React.FC = () => {
    const { user } = useAuth();

    // Redirect non-admin users to dashboard
    if (!user || !ADMIN_ROLES.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-3">
                        Where would you like to go?
                    </h1>
                    <p className="text-white/70 text-lg">
                        Choose your portal to get started
                    </p>
                </div>

                {/* Portal Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Member Portal Card */}
                    <Link
                        to="/dashboard"
                        className="group bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-3xl p-8 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Users className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">
                                Member Portal
                            </h2>
                            <p className="text-white/70 mb-6">
                                Access your profile, sermons, check-in, and giving
                            </p>
                            <div className="flex items-center gap-2 text-indigo-300 font-medium group-hover:gap-3 transition-all">
                                Enter Portal
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>
                    </Link>

                    {/* Staff Console Card */}
                    <Link
                        to="/staff/dashboard"
                        className="group bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-3xl p-8 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">
                                Staff Console
                            </h2>
                            <p className="text-white/70 mb-6">
                                Manage members, events, giving, and church operations
                            </p>
                            <div className="flex items-center gap-2 text-amber-300 font-medium group-hover:gap-3 transition-all">
                                Enter Console
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Footer Note */}
                <div className="text-center">
                    <p className="text-white/50 text-sm">
                        You can switch between portals anytime from your profile menu
                    </p>
                </div>
            </div>
        </div>
    );
};
