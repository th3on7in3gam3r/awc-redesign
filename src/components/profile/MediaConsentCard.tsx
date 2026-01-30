import React, { useState, useEffect } from 'react';
import { Camera, Edit2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ConsentStatus {
    status: 'consent' | 'decline' | 'unset';
    updated_at: string | null;
    source: string | null;
}

interface MediaConsentCardProps {
    onUpdate: () => void;
}

export const MediaConsentCard: React.FC<MediaConsentCardProps> = ({ onUpdate }) => {
    const [consent, setConsent] = useState<ConsentStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConsent();
    }, []);

    const fetchConsent = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/me/consent', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setConsent(data.user);
            }
        } catch (err) {
            console.error('Error fetching consent:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = () => {
        if (!consent || consent.status === 'unset') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-600">
                    <AlertCircle className="w-4 h-4" />
                    Not Set
                </span>
            );
        }

        if (consent.status === 'consent') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    Consent Given
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700">
                <XCircle className="w-4 h-4" />
                Declined
            </span>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                    <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Camera className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Media Consent</h3>
                        <p className="text-sm text-slate-500">Photos & video preferences</p>
                    </div>
                </div>
                {getStatusBadge()}
            </div>

            <div className="space-y-2 mb-4">
                {consent && consent.updated_at && (
                    <p className="text-sm text-slate-600">
                        Last updated: {new Date(consent.updated_at).toLocaleDateString()}
                    </p>
                )}
                {consent && consent.source && (
                    <p className="text-xs text-slate-500">
                        Source: {consent.source}
                    </p>
                )}
            </div>

            {(!consent || consent.status === 'unset') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800">
                        Please set your media consent preference to help us know how to feature you in church photos and videos.
                    </p>
                </div>
            )}

            <button
                onClick={onUpdate}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
            >
                <Edit2 className="w-4 h-4" />
                Update Preferences
            </button>
        </div>
    );
};
