import React, { useState } from 'react';
import { Calendar, MapPin, Phone } from 'lucide-react';

interface WelcomeStepProps {
    onNext: (data: any) => void;
    initialData?: any;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext, initialData }) => {
    const [phone, setPhone] = useState(initialData?.phone || '');
    const [birthday, setBirthday] = useState(initialData?.birthday || '');
    const [address, setAddress] = useState(initialData?.address || '');

    const handleNext = () => {
        onNext({ phone, birthday, address });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Header */}
            <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-church-burgundy to-church-gold rounded-full mx-auto mb-6 flex items-center justify-center">
                    <span className="text-4xl">👋</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Welcome to AWC-Connect!</h2>
                <p className="text-slate-600 max-w-md mx-auto">
                    We're excited to have you join our church family. Let's get your profile set up so we can stay connected.
                </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 max-w-md mx-auto">
                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-church-gold focus:border-transparent"
                    />
                </div>

                {/* Birthday */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Birthday
                    </label>
                    <input
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-church-gold focus:border-transparent"
                    />
                </div>

                {/* Address */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Address
                    </label>
                    <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Main St, City, State ZIP"
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-church-gold focus:border-transparent resize-none"
                    />
                </div>
            </div>

            {/* Next Button */}
            <div className="flex justify-end max-w-md mx-auto">
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
