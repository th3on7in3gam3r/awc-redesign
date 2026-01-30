import React, { useState, useEffect } from 'react';
import { Camera, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Child {
    id: string;
    first_name: string;
    last_name: string;
    dob: string;
}

interface MediaConsentStepProps {
    onNext: (data: any) => void;
    onBack: () => void;
    initialData?: any;
}

export const MediaConsentStep: React.FC<MediaConsentStepProps> = ({ onNext, onBack, initialData }) => {
    const [adultConsent, setAdultConsent] = useState<'consent' | 'decline' | null>(null);
    const [children, setChildren] = useState<Child[]>([]);
    const [childrenConsent, setChildrenConsent] = useState<Record<string, 'consent' | 'decline'>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/programs/my-children', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setChildren(data);

                // Initialize consent states
                const initialConsent: Record<string, 'consent' | 'decline'> = {};
                data.forEach((child: Child) => {
                    initialConsent[child.id] = 'consent'; // Default to consent
                });
                setChildrenConsent(initialConsent);
            }
        } catch (err) {
            console.error('Error fetching children:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (adultConsent === null) {
            alert('Please select your media consent preference');
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');

            // Prepare consent data
            const consentData = {
                user_consent: {
                    status: adultConsent
                },
                children_consent: children.map(child => ({
                    child_id: child.id,
                    status: childrenConsent[child.id] || 'consent'
                })),
                source: 'onboarding'
            };

            // Save consent
            const res = await fetch('/api/me/consent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(consentData)
            });

            if (res.ok) {
                onNext({ media_consent_completed: true });
            } else {
                throw new Error('Failed to save consent');
            }
        } catch (err) {
            console.error('Error saving consent:', err);
            alert('Error saving consent preferences. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const toggleChildConsent = (childId: string) => {
        setChildrenConsent(prev => ({
            ...prev,
            [childId]: prev[childId] === 'consent' ? 'decline' : 'consent'
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-slate-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                    <Camera className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Photos & Video Consent</h2>
                <p className="text-slate-600 max-w-2xl mx-auto">
                    We occasionally take photos and videos during services and events to share our church community's story.
                    Your consent helps us know how to feature you and your family.
                </p>
            </div>

            {/* Adult Consent Section */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="flex items-start gap-3 mb-4">
                    <Shield className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-slate-800 mb-1">Your Media Consent</h3>
                        <p className="text-sm text-slate-600">
                            May we feature you in photos and videos from church services and events?
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        onClick={() => setAdultConsent('consent')}
                        className={`p-4 rounded-lg border-2 transition-all ${adultConsent === 'consent'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle2 className={`w-5 h-5 ${adultConsent === 'consent' ? 'text-green-600' : 'text-slate-400'}`} />
                            <span className="font-semibold">I Consent</span>
                        </div>
                    </button>

                    <button
                        onClick={() => setAdultConsent('decline')}
                        className={`p-4 rounded-lg border-2 transition-all ${adultConsent === 'decline'
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <AlertCircle className={`w-5 h-5 ${adultConsent === 'decline' ? 'text-amber-600' : 'text-slate-400'}`} />
                            <span className="font-semibold">I Do Not Consent</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Children Consent Section */}
            {children.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <div className="flex items-start gap-3 mb-4">
                        <Shield className="w-5 h-5 text-indigo-600 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-slate-800 mb-1">Children's Media Consent</h3>
                            <p className="text-sm text-slate-600">
                                Set consent preferences for each of your children
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {children.map(child => (
                            <div key={child.id} className="bg-white rounded-lg p-4 border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-800">
                                            {child.first_name} {child.last_name}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Born: {new Date(child.dob).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => toggleChildConsent(child.id)}
                                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${childrenConsent[child.id] === 'consent'
                                                ? 'bg-green-100 text-green-700 border-2 border-green-500'
                                                : 'bg-amber-100 text-amber-700 border-2 border-amber-500'
                                            }`}
                                    >
                                        {childrenConsent[child.id] === 'consent' ? 'Consent' : 'Decline'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Important Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Important Note</p>
                        <p>
                            If you decline consent, we'll make a reasonable effort to avoid featuring you or your child in photos and videos.
                            However, you may appear incidentally in wide shots or group photos. You can update these preferences anytime in your profile settings.
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
                <button
                    onClick={onBack}
                    className="px-6 py-3 text-slate-600 hover:text-slate-800 font-semibold transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={adultConsent === null || saving}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
                >
                    {saving ? 'Saving...' : 'Continue'}
                </button>
            </div>
        </div>
    );
};
