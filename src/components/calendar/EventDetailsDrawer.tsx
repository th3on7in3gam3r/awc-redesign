import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, User, CheckCircle, XCircle, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

interface Event {
    id: string;
    title: string;
    description?: string;
    starts_at: string;
    ends_at: string;
    status: 'requested' | 'approved' | 'booked' | 'canceled' | 'completed';
    bookings: { resource_id: string; resource_name: string }[];
    requested_by_name?: string;
    approved_by_name?: string;
    ministry_label?: string;
}

interface EventDetailsDrawerProps {
    event: Event | null;
    onClose: () => void;
    onUpdate: () => void;
}

export const EventDetailsDrawer: React.FC<EventDetailsDrawerProps> = ({ event, onClose, onUpdate }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!event) return null;

    const isAdminOrStaff = ['admin', 'pastor', 'staff'].includes(user?.role || '');
    const isOwner = user?.role === 'ministry_leader'; // In full implementation check ID

    // Status Badge Helpers
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'booked': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'canceled': return 'bg-gray-100 text-gray-500 border-gray-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    const handleAction = async (action: 'approve' | 'book' | 'cancel') => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/staff/events/${event.id}/${action}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || `Failed to ${action} event`);
            }

            onUpdate();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/20" onClick={onClose} />
            <div className="absolute inset-y-0 right-0 w-full max-w-md flex pl-10 pointer-events-none">
                <div className="w-full h-full bg-white shadow-xl pointer-events-auto flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-900">Event Details</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div>
                            <div className="flex justify-between items-start">
                                <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${getStatusColor(event.status)}`}>
                                    {event.status}
                                </span>
                            </div>
                            {event.ministry_label && (
                                <p className="text-sm text-church-gold font-medium mt-1">{event.ministry_label}</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 text-sm">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {new Date(event.starts_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className="text-gray-500">
                                        {new Date(event.starts_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {' '}
                                        {new Date(event.ends_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 text-sm">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Resources</p>
                                    {event.bookings && event.bookings.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {event.bookings.map((b, i) => (
                                                <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                    {b.resource_name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">No resources booked</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3 text-sm">
                                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Requested By</p>
                                    <p className="text-gray-600">{event.requested_by_name || 'Unknown'}</p>
                                </div>
                            </div>

                            {event.description && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 leading-relaxed">
                                    {event.description}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-3">
                        {isAdminOrStaff && event.status === 'requested' && (
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={() => handleAction('approve')}
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                </Button>
                                <Button
                                    onClick={() => handleAction('cancel')}
                                    disabled={loading}
                                    variant="outline"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                    <XCircle className="w-4 h-4 mr-2" /> Reject
                                </Button>
                            </div>
                        )}

                        {isAdminOrStaff && event.status === 'approved' && (
                            <Button
                                onClick={() => handleAction('book')}
                                disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Mark as Booked
                            </Button>
                        )}

                        {event.status !== 'canceled' && (isAdminOrStaff || (isOwner && event.status === 'requested')) && (
                            <Button
                                onClick={() => handleAction('cancel')}
                                disabled={loading}
                                variant="ghost"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 w-full"
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Cancel Event
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
