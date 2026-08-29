import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Hold {
    id: string;
    type: string;
    requested_by_profile_id: string;
    status: string;
    target_date: string;
    target_resource: string;
    notes: string;
    created_at: string;
    first_name: string;
    last_name: string;
}

export const HoldsWidget: React.FC = () => {
    const [holds, setHolds] = useState<Hold[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHolds();
    }, []);

    const fetchHolds = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/staff/holds?status=PENDING', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setHolds(data);
            }
        } catch (err) {
            console.error('Error fetching holds:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/staff/holds/${id}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchHolds();
        } catch (err) {
            console.error('Error approving hold:', err);
        }
    };

    const handleDecline = async (id: string) => {
        if (!confirm('Are you sure you want to decline this hold?')) return;

        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/staff/holds/${id}/decline`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchHolds();
        } catch (err) {
            console.error('Error declining hold:', err);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-20 bg-slate-100 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-slate-900">Pending Holds</h3>
                </div>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                    {holds.length}
                </span>
            </div>

            {holds.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">No pending holds</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {holds.map((hold) => (
                        <div
                            key={hold.id}
                            className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-amber-300 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-semibold text-slate-900 text-sm">
                                        {hold.type.replace('_', ' ')}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                        {hold.first_name} {hold.last_name}
                                    </p>
                                </div>
                                <span className="text-xs text-slate-500">
                                    {new Date(hold.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            {hold.target_resource && (
                                <p className="text-sm text-slate-700 mb-1">
                                    <strong>Resource:</strong> {hold.target_resource}
                                </p>
                            )}

                            {hold.target_date && (
                                <p className="text-sm text-slate-700 mb-1">
                                    <strong>Date:</strong> {new Date(hold.target_date).toLocaleDateString()}
                                </p>
                            )}

                            {hold.notes && (
                                <p className="text-xs text-slate-600 mb-3 italic">
                                    "{hold.notes}"
                                </p>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleApprove(hold.id)}
                                    className="flex-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleDecline(hold.id)}
                                    className="flex-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
