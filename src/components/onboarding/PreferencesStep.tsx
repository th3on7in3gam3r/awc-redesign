import React, { useState } from 'react';
import { Bell, Mail, MessageSquare } from 'lucide-react';

interface PreferencesStepProps {
    onNext: (data: any) => void;
    onBack: () => void;
    initialData?: any;
}

export const PreferencesStep: React.FC<PreferencesStepProps> = ({ onNext, onBack, initialData }) => {
    const [emailNotifications, setEmailNotifications] = useState(initialData?.email_notifications ?? true);
    const [smsNotifications, setSmsNotifications] = useState(initialData?.sms_notifications ?? false);

    const handleNext = () => {
        onNext({ email_notifications: emailNotifications, sms_notifications: smsNotifications });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Bell className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Stay Connected</h2>
                <p className="text-slate-600 max-w-md mx-auto">
                    Choose how you'd like to receive updates about events, sermons, and church announcements.
                </p>
            </div>

            {/* Preferences */}
            <div className="space-y-4 max-w-md mx-auto">
                {/* Email Notifications */}
                <div className="p-6 bg-white border-2 border-slate-200 rounded-2xl">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Mail className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">Email Notifications</h3>
                                <p className="text-sm text-slate-500">
                                    Receive weekly updates, event reminders, and sermon notifications
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setEmailNotifications(!emailNotifications)}
                            className={`relative w-14 h-8 rounded-full transition-colors ${emailNotifications ? 'bg-church-gold' : 'bg-slate-300'
                                }`}
                        >
                            <div
                                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* SMS Notifications */}
                <div className="p-6 bg-white border-2 border-slate-200 rounded-2xl">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">SMS Notifications</h3>
                                <p className="text-sm text-slate-500">
                                    Get text messages for urgent updates and prayer requests
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSmsNotifications(!smsNotifications)}
                            className={`relative w-14 h-8 rounded-full transition-colors ${smsNotifications ? 'bg-church-gold' : 'bg-slate-300'
                                }`}
                        >
                            <div
                                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${smsNotifications ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Note */}
            <div className="max-w-md mx-auto">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                        💡 You can change these preferences anytime in your profile settings.
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
                    onClick={handleNext}
                    className="px-8 py-3 bg-church-gold text-white rounded-xl font-bold hover:bg-church-gold/90 transition-colors"
                >
                    Continue →
                </button>
            </div>
        </div>
    );
};
