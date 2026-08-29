import React, { useState } from 'react';
import { Button } from '../../ui/Button';

interface PrayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const PrayerModal: React.FC<PrayerModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [requestText, setRequestText] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/me/prayers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ requestText })
            });
            if (res.ok) {
                setRequestText('');
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Failed to submit prayer:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-church-burgundy">Submit Prayer Request</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <p className="text-slate-500 text-sm mb-4">
                        Our pastoral team reviews every request and prays for you. Your request will remain confidential.
                    </p>
                    <textarea
                        value={requestText}
                        onChange={(e) => setRequestText(e.target.value)}
                        placeholder="How can we pray for you?"
                        className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-church-gold/50 resize-none mb-4 text-slate-700"
                        required
                    />
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={onClose} type="button" className="text-slate-500 hover:bg-slate-50">Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-church-gold hover:bg-church-burgundy text-white">
                            {loading ? 'Sending...' : 'Send Request'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
