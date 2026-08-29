import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Calendar, BookOpen, LogOut, ShieldCheck, Settings, HandHeart } from 'lucide-react';
import { OnboardingModal } from '../components/onboarding/OnboardingModal';
import { NotificationBell } from '../components/notifications/NotificationBell';

export const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const isStaff = user?.role === 'admin' || user?.role === 'pastor';
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [checkingOnboarding, setCheckingOnboarding] = useState(true);

    useEffect(() => {
        checkOnboardingStatus();
    }, []);

    const checkOnboardingStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/onboarding/status', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (!data.completed) {
                setShowOnboarding(true);
            }
        } catch (err) {
            console.error('Error checking onboarding status:', err);
        } finally {
            setCheckingOnboarding(false);
        }
    };

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
    };

    if (checkingOnboarding) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-church-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    const memberLinks = [
        { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { name: 'My Profile', path: '/dashboard/profile', icon: Users },
        { name: 'Check In', path: '/dashboard/checkin', icon: BookOpen },
        { name: 'Sermons', path: '/dashboard/sermons', icon: BookOpen },
        { name: 'Tithes & Offerings', path: '/dashboard/giving', icon: HandHeart },
    ];

    const staffLinks = [
        { name: 'People Directory', path: '/dashboard/members', icon: Users },
        { name: 'Events Manager', path: '/dashboard/events', icon: Calendar },
        { name: 'Audit Log', path: '/dashboard/audit', icon: Settings },
        { name: 'Projector', path: '/dashboard/checkin/screen', icon: settings => <ShieldCheck className="w-5 h-5 mr-3" /> }, // Example added link if needed
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            <OnboardingModal isOpen={showOnboarding} onComplete={handleOnboardingComplete} />
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-indigo-700">AWC-Connect</h1>
                    <p className="text-xs text-slate-500 mt-1">Church Management OS</p>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {/* Member Section */}
                    <div className="mb-6">
                        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Member Portal
                        </p>
                        {memberLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={link.path === '/dashboard'}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors mb-1 ${isActive
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                                    }`
                                }
                            >
                                <link.icon className="w-5 h-5 mr-3" />
                                {link.name}
                            </NavLink>
                        ))}
                    </div>

                    {/* Staff Section */}
                    {isStaff && (
                        <div className="mb-6 animate-fade-in">
                            <div className="px-4 flex items-center gap-2 mb-2">
                                <ShieldCheck className="w-3 h-3 text-amber-500" />
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Administration
                                </p>
                            </div>
                            <div className="space-y-1">
                                {staffLinks.map((link) => (
                                    <NavLink
                                        key={link.path}
                                        to={link.path}
                                        className={({ isActive }) =>
                                            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive
                                                ? 'bg-amber-50 text-amber-700'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-amber-700'
                                            }`
                                        }
                                    >
                                        {/* Handle icon rendering properly if it's a function or component */}
                                        {typeof link.icon === 'function' ? (
                                            // @ts-ignore
                                            <link.icon className="w-5 h-5 mr-3" />
                                        ) : (
                                            <link.icon className="w-5 h-5 mr-3" />
                                        )}
                                        {link.name}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${isStaff ? 'bg-amber-500' : 'bg-indigo-500'}`}>
                            {user?.name.charAt(0)}
                        </div>
                        <div className="text-sm overflow-hidden">
                            <p className="font-medium text-slate-900 truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 capitalize flex items-center gap-1">
                                {user?.role}
                                {isStaff && <ShieldCheck className="w-3 h-3 text-amber-500" />}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 hover:border-red-100 border border-transparent transition-all"
                    >
                        <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-slate-50">
                {/* Header with Notifications */}
                <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                {isStaff ? 'Admin Dashboard' : 'My Dashboard'}
                            </h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationBell />
                            <div className="hidden md:flex items-center gap-2 text-sm text-slate-600">
                                <div className={`w-2 h-2 rounded-full ${isStaff ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                                <span>{user?.name}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
