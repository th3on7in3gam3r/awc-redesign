import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Volume2, Monitor } from 'lucide-react';
import { Button } from '../ui/Button';

interface NotificationPreferences {
    email_events: string;
    email_ministry: string;
    email_prayer: string;
    email_chat: string;
    email_system: string;
    push_chat: boolean;
    push_mentions: boolean;
    push_events: boolean;
    push_prayer: boolean;
    sms_emergency: boolean;
    sms_events: boolean;
    sms_prayer: boolean;
    sound_enabled: boolean;
    desktop_notifications: boolean;
    badge_counts: boolean;
}

export const NotificationSettings: React.FC = () => {
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/me/notification-preferences', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setPreferences(data);
        } catch (err) {
            console.error('Error fetching preferences:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!preferences) return;

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/me/notification-preferences', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(preferences)
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            console.error('Error saving preferences:', err);
        } finally {
            setSaving(false);
        }
    };

    const updatePreference = (key: keyof NotificationPreferences, value: any) => {
        if (!preferences) return;
        setPreferences({ ...preferences, [key]: value });
    };

    if (loading || !preferences) {
        return <div className="p-8">Loading preferences...</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Notification Preferences</h3>
                </div>
                {success && (
                    <span className="text-sm text-green-600 font-medium">✓ Saved!</span>
                )}
            </div>

            <div className="space-y-8">
                {/* Email Notifications */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <h4 className="font-semibold text-gray-900">Email Notifications</h4>
                    </div>
                    <div className="space-y-3 ml-7">
                        {[
                            { key: 'email_events', label: 'Events & Announcements' },
                            { key: 'email_ministry', label: 'Ministry Updates' },
                            { key: 'email_prayer', label: 'Prayer Requests' },
                            { key: 'email_chat', label: 'Chat Messages' },
                            { key: 'email_system', label: 'System Notifications' }
                        ].map(({ key, label }) => (
                            <div key={key} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{label}</span>
                                <select
                                    value={preferences[key as keyof NotificationPreferences] as string}
                                    onChange={(e) => updatePreference(key as keyof NotificationPreferences, e.target.value)}
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="immediately">Immediately</option>
                                    <option value="daily">Daily Digest</option>
                                    <option value="weekly">Weekly Digest</option>
                                    <option value="never">Never</option>
                                </select>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Push Notifications */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Smartphone className="w-5 h-5 text-gray-600" />
                        <h4 className="font-semibold text-gray-900">Push Notifications</h4>
                    </div>
                    <div className="space-y-3 ml-7">
                        {[
                            { key: 'push_chat', label: 'Chat Messages' },
                            { key: 'push_mentions', label: 'Mentions' },
                            { key: 'push_events', label: 'Event Reminders' },
                            { key: 'push_prayer', label: 'Prayer Requests' }
                        ].map(({ key, label }) => (
                            <div key={key} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{label}</span>
                                <button
                                    onClick={() => updatePreference(key as keyof NotificationPreferences, !preferences[key as keyof NotificationPreferences])}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences[key as keyof NotificationPreferences] ? 'bg-indigo-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences[key as keyof NotificationPreferences] ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SMS Notifications */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Smartphone className="w-5 h-5 text-gray-600" />
                        <h4 className="font-semibold text-gray-900">SMS Notifications</h4>
                    </div>
                    <div className="space-y-3 ml-7">
                        {[
                            { key: 'sms_emergency', label: 'Emergency Alerts' },
                            { key: 'sms_events', label: 'Event Reminders' },
                            { key: 'sms_prayer', label: 'Prayer Requests' }
                        ].map(({ key, label }) => (
                            <div key={key} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{label}</span>
                                <button
                                    onClick={() => updatePreference(key as keyof NotificationPreferences, !preferences[key as keyof NotificationPreferences])}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences[key as keyof NotificationPreferences] ? 'bg-indigo-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences[key as keyof NotificationPreferences] ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* In-App Settings */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Monitor className="w-5 h-5 text-gray-600" />
                        <h4 className="font-semibold text-gray-900">In-App Settings</h4>
                    </div>
                    <div className="space-y-3 ml-7">
                        {[
                            { key: 'sound_enabled', label: 'Sound Effects', icon: Volume2 },
                            { key: 'desktop_notifications', label: 'Desktop Notifications', icon: Monitor },
                            { key: 'badge_counts', label: 'Badge Counts', icon: Bell }
                        ].map(({ key, label }) => (
                            <div key={key} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{label}</span>
                                <button
                                    onClick={() => updatePreference(key as keyof NotificationPreferences, !preferences[key as keyof NotificationPreferences])}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences[key as keyof NotificationPreferences] ? 'bg-indigo-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences[key as keyof NotificationPreferences] ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
            </div>
        </div>
    );
};
