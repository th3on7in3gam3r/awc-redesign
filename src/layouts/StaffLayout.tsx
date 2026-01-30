import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Settings, LogOut, ShieldCheck, HandHeart, Baby, BookOpen, Menu, X, Home, Calendar, DollarSign, MessageSquare } from 'lucide-react';
import { PermGate } from '../components/auth/PermGate';
import { PERMISSIONS } from '../utils/permissions';
import { NotificationBell } from '../components/notifications/NotificationBell';

import { useChatUnread } from '../hooks/useChatUnread';

export const StaffLayout = () => {
    const { user, logout } = useAuth();
    const { totalUnread } = useChatUnread();

    const navLinks = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/staff/dashboard', permission: null },
        { icon: Users, label: 'Ministries', path: '/staff/ministries', permission: PERMISSIONS.MINISTRIES_READ },
        { icon: Users, label: 'People Directory', path: '/staff/members', permission: PERMISSIONS.PEOPLE_READ },
        { icon: Home, label: 'Households', path: '/staff/households', permission: PERMISSIONS.HOUSEHOLDS_READ },
        { icon: Calendar, label: 'Calendar', path: '/staff/calendar', permission: null },
        {
            icon: MessageSquare,
            label: 'Team Chat',
            path: '/staff/chat',
            permission: PERMISSIONS.CHAT_READ,
            badge: totalUnread > 0 ? totalUnread : undefined
        },
        { icon: DollarSign, label: 'Finance & Ledger', path: '/staff/finance', permission: PERMISSIONS.FINANCE_READ },
        { icon: Settings, label: 'Settings', path: '/staff/settings', permission: PERMISSIONS.SETTINGS_MANAGE },
        { icon: HandHeart, label: 'Giving Management', path: '/staff/giving', permission: null },
        { icon: Baby, label: 'Kids Check-In', path: '/staff/programs/roster', permission: PERMISSIONS.CHECKIN_READ },
        { icon: BookOpen, label: 'Check-in Screen', path: '/staff/checkin/screen', permission: PERMISSIONS.CHECKIN_READ },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gradient-to-b from-church-burgundy to-church-burgundy-dark border-r border-church-gold hidden md:flex flex-col text-white">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-6 h-6 text-church-gold" />
                        <h1 className="text-xl font-bold text-white">Staff Console</h1>
                    </div>
                    <p className="text-xs text-church-gold/80">AWC-Connect Administration</p>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navLinks.map((link) => {
                        const NavItem = (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={link.path === '/staff/dashboard'}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all mb-1 ${isActive
                                        ? 'bg-church-gold text-white shadow-lg'
                                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                                    }`
                                }
                            >
                                <link.icon className={`w-5 h-5 mr-3 ${({ isActive }: { isActive: boolean }) => isActive ? 'text-white' : 'text-church-gold'}`} />
                                <span className="flex-1">{link.label}</span>
                                {link.badge && (
                                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                        {link.badge}
                                    </span>
                                )}
                            </NavLink>
                        );

                        // If no permission required, show to all staff
                        if (!link.permission) {
                            return NavItem;
                        }

                        // Otherwise, gate by permission
                        return (
                            <PermGate key={link.path} permission={link.permission}>
                                {NavItem}
                            </PermGate>
                        );
                    })}
                </nav>

                {/* User Info & Actions */}
                <div className="p-4 border-t border-white/10 bg-black/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-church-gold flex items-center justify-center text-white font-bold shadow-md">
                            {user?.name.charAt(0)}
                        </div>
                        <div className="text-sm overflow-hidden flex-1">
                            <p className="font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-church-gold capitalize flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                {user?.role}
                            </p>
                        </div>
                    </div>

                    {/* Member Portal Link */}
                    <Link
                        to="/dashboard"
                        className="flex items-center justify-center w-full px-4 py-2 mb-2 text-sm text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors border border-white/10"
                    >
                        ← Member Portal
                    </Link>

                    <button
                        onClick={logout}
                        className="flex items-center justify-center w-full px-4 py-2 text-sm text-red-200 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-slate-50">
                {/* Top Header with Notifications */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-church-burgundy" />
                            <h2 className="text-lg font-semibold text-gray-900">Staff Portal</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationBell />
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-church-gold flex items-center justify-center text-white text-sm font-bold">
                                    {user?.name.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-gray-700 hidden md:block">{user?.name}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
