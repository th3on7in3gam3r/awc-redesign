import React, { useState } from 'react';
import { Button } from '../../ui/Button';

interface MinistryRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AVAILABLE_MINISTRIES = [
    'Worship Team',
    'Tech Team',
    'Ushers & Greeters',
    'Kids Ministry',
    'Youth Ministry',
    'Prayer Team',
    'Community Outreach'
];

export const MinistryRequestModal: React.FC<MinistryRequestModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [selectedMinistry, setSelectedMinistry] = useState(AVAILABLE_MINISTRIES[0]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/me/ministry-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ministryName: selectedMinistry })
            });
            if (res.ok) {
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Failed to submit request:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-church-burgundy">Join a Ministry</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <p className="text-slate-500 text-sm mb-6">
                        We are thrilled you want to serve! Select a ministry below, and a leader will reach out to you shortly.
                    </p>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Select Ministry</label>
                        <select
                            value={selectedMinistry}
                            onChange={(e) => setSelectedMinistry(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-church-gold/50 bg-white"
                        >
                            {AVAILABLE_MINISTRIES.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={onClose} type="button" className="text-slate-500 hover:bg-slate-50">Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-church-gold hover:bg-church-burgundy text-white">
                            {loading ? 'Submitting...' : 'Send Interest'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
