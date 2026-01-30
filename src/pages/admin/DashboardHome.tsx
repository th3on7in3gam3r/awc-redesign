import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChurchPulse } from '../../components/dashboard/ChurchPulse';
import { ActionCenter } from '../../components/dashboard/ActionCenter';
import { AttendanceInsights } from '../../components/dashboard/AttendanceInsights';
import { ActivityFeed } from '../../components/dashboard/ActivityFeed';
import { TimeframeToggle, Timeframe } from '../../components/dashboard/TimeframeToggle';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { Link } from 'react-router-dom';
import { Calendar, Video, BookOpen, Heart } from 'lucide-react';
import { GiveCard } from '../../components/dashboard/GiveCard';
import { GivingSummaryCard } from '../../components/dashboard/GivingSummaryCard';
import { HoldsWidget } from '../../components/dashboard/HoldsWidget';

export const DashboardHome = () => {
    const { user } = useAuth();
    const [timeframe, setTimeframe] = useState<Timeframe>('This Week');
    const isStaff = user?.role === 'admin' || user?.role === 'pastor';

    // Member View
    if (!isStaff) {
        return (
            <div className="space-y-8 pb-12 animate-fade-in">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
                        <p className="text-indigo-100 max-w-xl">
                            We're so glad you're here. Check out the latest sermon, manage your profile, or explore upcoming events.
                        </p>
                    </div>
                </div>

                {/* Quick Links Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/dashboard/sermons" className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
                            <Video className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg mb-1">Latest Sermon</h3>
                        <p className="text-sm text-slate-500">Catch up on Sunday's message</p>
                    </Link>

                    <Link to="/dashboard/checkin" className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg mb-1">Express Check-in</h3>
                        <p className="text-sm text-slate-500">Get your pass for Sunday service</p>
                    </Link>

                    <Link to="/dashboard/profile" className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                        <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 mb-4 group-hover:scale-110 transition-transform">
                            <Heart className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg mb-1">My Profile</h3>
                        <p className="text-sm text-slate-500">Update your info & preferences</p>
                    </Link>
                </div>


                {/* Latest Message with Welcome Image */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <img
                            src="https://anointedworshipcenter.com/images/new_welcome.png"
                            alt="Welcome"
                            className="w-full md:w-80 h-56 object-contain rounded-xl"
                        />
                        <div className="flex-1 text-center md:text-left">
                            <div className="text-amber-500 font-bold uppercase tracking-wider text-xs mb-2">Latest Message</div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-3">Welcome to Church HQ!</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Your central hub for managing church operations, connecting with members, and staying organized.
                            </p>
                            <Link
                                to="/dashboard/profile"
                                className="inline-block px-6 py-2.5 bg-church-gold hover:bg-amber-600 text-white font-semibold rounded-lg shadow-sm transition-colors"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>


                {/* Give Card */}
                <GiveCard />
            </div>
        );
    }

    // Staff/Admin View
    return (
        <div className="space-y-8 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-amber-500 uppercase tracking-widest text-xs mb-1">Admin Portal</h2>
                    <h1 className="text-3xl font-bold text-slate-900">Weekly Dashboard</h1>
                    <p className="text-slate-500 mt-1">Operational metrics and tasks for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <TimeframeToggle value={timeframe} onChange={setTimeframe} />
            </div>

            {/* Quick Actions Strip */}
            <section>
                <QuickActions />
            </section>

            {/* Holds Widget (Staff Only) */}
            <section>
                <HoldsWidget />
            </section>

            {/* 1. Pulse Metrics */}
            <section>
                <ChurchPulse timeframe={timeframe} />
            </section>

            {/* 2. Main Grid: Action Center + Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Action Center */}
                <div className="lg:col-span-1 h-full">
                    <ActionCenter />
                </div>

                {/* Right Column: Attendance & Activity */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="h-[400px]">
                        <AttendanceInsights />
                    </div>
                    <div>
                        <ActivityFeed />
                    </div>
                </div>
            </div>
        </div>
    );
};
