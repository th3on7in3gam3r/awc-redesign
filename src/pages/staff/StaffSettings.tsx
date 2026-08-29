import React, { useState } from 'react';
import { Shield, Bell, Lock, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { SecuritySettings } from '../../components/settings/SecuritySettings';
import { NotificationSettings } from '../../components/settings/NotificationSettings';
import { UsernameSettings } from '../../components/profile/UsernameSettings';

export const StaffSettings = () => {
    const { user } = useAuth();
    const [expandedSection, setExpandedSection] = useState<'username' | 'security' | 'notifications' | null>(null);

    const toggleSection = (section: 'username' | 'security' | 'notifications') => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Staff Settings</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-2xl font-bold">
                        {user?.name?.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                        <p className="text-gray-500 capitalize">{user?.role}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Username Section */}
                    <div className="border rounded-lg overflow-hidden">
                        <div
                            className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center cursor-pointer"
                            onClick={() => toggleSection('username' as any)}
                        >
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-gray-500" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">Username</h3>
                                    <p className="text-sm text-gray-500">Set your unique @username for chat mentions</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSection('username' as any);
                                    }}
                                >
                                    {expandedSection === 'username' ? 'Close' : 'Set Username'}
                                </Button>
                                {expandedSection === 'username' ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </div>
                        </div>
                        {expandedSection === 'username' && (
                            <div className="p-6 bg-gray-50 border-t">
                                <UsernameSettings />
                            </div>
                        )}
                    </div>

                    {/* Security Section */}
                    <div className="border rounded-lg overflow-hidden">
                        <div
                            className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center cursor-pointer"
                            onClick={() => toggleSection('security')}
                        >
                            <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5 text-gray-500" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">Security</h3>
                                    <p className="text-sm text-gray-500">Change password, manage sessions, and login history</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSection('security');
                                    }}
                                >
                                    {expandedSection === 'security' ? 'Close' : 'Manage'}
                                </Button>
                                {expandedSection === 'security' ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </div>
                        </div>
                        {expandedSection === 'security' && (
                            <div className="p-6 bg-gray-50 border-t">
                                <SecuritySettings />
                            </div>
                        )}
                    </div>

                    {/* Notifications Section */}
                    <div className="border rounded-lg overflow-hidden">
                        <div
                            className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center cursor-pointer"
                            onClick={() => toggleSection('notifications')}
                        >
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-gray-500" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                                    <p className="text-sm text-gray-500">Manage email, push, and SMS alerts</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSection('notifications');
                                    }}
                                >
                                    {expandedSection === 'notifications' ? 'Close' : 'Configure'}
                                </Button>
                                {expandedSection === 'notifications' ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </div>
                        </div>
                        {expandedSection === 'notifications' && (
                            <div className="p-6 bg-gray-50 border-t">
                                <NotificationSettings />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-amber-900">System Information</h3>
                </div>
                <p className="text-sm text-amber-800">
                    AWC-Connect Version 2.0.0 (Staff Portal)<br />
                    Environment: {process.env.NODE_ENV}
                </p>
            </div>
        </div>
    );
};
