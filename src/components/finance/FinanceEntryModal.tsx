import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { X, DollarSign } from 'lucide-react';

interface FinanceEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    token: string | null;
}

export const FinanceEntryModal: React.FC<FinanceEntryModalProps> = ({ isOpen, onClose, onSuccess, token }) => {
    const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState('');
    const [memo, setMemo] = useState('');
    const [fundId, setFundId] = useState('');
    const [sourceId, setSourceId] = useState('');
    const [funds, setFunds] = useState<{ id: string, name: string }[]>([]);
    const [sources, setSources] = useState<{ id: string, name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && token) {
            fetchOptions();
            resetForm();
        }
    }, [isOpen, token]);

    const resetForm = () => {
        setEntryDate(new Date().toISOString().split('T')[0]);
        setAmount('');
        setMemo('');
        // Don't reset lists, just selections if needed
        setError(null);
    };

    const fetchOptions = async () => {
        try {
            const [fundsRes, sourcesRes] = await Promise.all([
                fetch('/api/staff/finance/funds', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/staff/finance/sources', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (fundsRes.ok) setFunds(await fundsRes.json());
            if (sourcesRes.ok) setSources(await sourcesRes.json());
        } catch (err) {
            console.error('Error fetching finance options:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fundId || !sourceId || !amount) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const res = await fetch('/api/staff/finance/entries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    entry_date: entryDate,
                    fund_id: fundId,
                    source_id: sourceId,
                    amount: parseFloat(amount),
                    memo
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to save entry');
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Add Finance Entry</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            required
                            value={entryDate}
                            onChange={(e) => setEntryDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fund</label>
                            <select
                                required
                                value={fundId}
                                onChange={(e) => setFundId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                            >
                                <option value="">Select Fund</option>
                                {funds.map(f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                            <select
                                required
                                value={sourceId}
                                onChange={(e) => setSourceId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                            >
                                <option value="">Select Source</option>
                                {sources.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Memo (Optional)</label>
                        <input
                            type="text"
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                            placeholder="Description or notes"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Entry'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
