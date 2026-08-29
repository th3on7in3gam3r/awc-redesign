import React, { useState } from 'react';
import { SecuritySettings } from '../components/settings/SecuritySettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { UsernameSettings } from '../components/profile/UsernameSettings';
import { Shield, Bell, User, Settings as SettingsIcon } from 'lucide-react';

type Tab = 'security' | 'notifications' | 'profile';

export const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('security');

    const tabs = [
        { id: 'security' as Tab, label: 'Security', icon: Shield },
        { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
        { id: 'profile' as Tab, label: 'Profile', icon: User }
    ];

    return (
        <div className="max-w-5xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <SettingsIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                        <p className="text-gray-500">Manage your account preferences and security</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex gap-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'security' && <SecuritySettings />}
                {activeTab === 'notifications' && <NotificationSettings />}
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <UsernameSettings />
                        {/* Add other profile settings here */}
                    </div>
                )}
            </div>
        </div>
    );
};
