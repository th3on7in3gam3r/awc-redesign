import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Button } from '../ui/Button';

interface Resource {
    id: string;
    name: string;
}

interface EventRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    resources: Resource[];
}

export const EventRequestModal: React.FC<EventRequestModalProps> = ({ isOpen, onClose, onSuccess, resources }) => {
    const [title, setTitle] = useState('');
    const [ministryId, setMinistryId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [description, setDescription] = useState('');
    const [selectedResources, setSelectedResources] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [conflictError, setConflictError] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    // Ministries State
    const [ministries, setMinistries] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchMinistries();
        }
    }, [isOpen]);

    const fetchMinistries = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/staff/ministries', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMinistries(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setMinistryId('');
            setDescription('');
            setSelectedResources([]);
            setError(null);
            setConflictError(null);
        }
    }, [isOpen]);

    // Check availability when time or resources change
    useEffect(() => {
        if (isOpen && selectedResources.length > 0 && date && startTime && endTime) {
            checkAvailability();
        } else {
            setConflictError(null);
        }
    }, [date, startTime, endTime, selectedResources]); // eslint-disable-line

    const checkAvailability = async () => {
        try {
            setIsChecking(true);
            setConflictError(null);
            const token = localStorage.getItem('token');
            const start = new Date(`${date}T${startTime}`);
            const end = new Date(`${date}T${endTime}`);

            if (end <= start) {
                // Don't check availability for invalid times, but let form validation handle it later
                return;
            }

            const params = new URLSearchParams({
                resource_ids: selectedResources.join(','),
                starts_at: start.toISOString(),
                ends_at: end.toISOString()
            });

            const res = await fetch(`/api/staff/availability?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                if (!data.available) {
                    const conflictNames = data.conflicts.map((c: any) => c.resource_name).join(', ');
                    setConflictError(`Conflict detected for: ${conflictNames}`);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsChecking(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            const start = new Date(`${date}T${startTime}`);
            const end = new Date(`${date}T${endTime}`);

            if (end <= start) throw new Error('End time must be after start time');

            const token = localStorage.getItem('token');
            const res = await fetch('/api/staff/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    ministry_id: ministryId || null,
                    starts_at: start.toISOString(),
                    ends_at: end.toISOString(),
                    resource_ids: selectedResources
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to request event');
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleResource = (id: string) => {
        if (selectedResources.includes(id)) {
            setSelectedResources(selectedResources.filter(r => r !== id));
        } else {
            setSelectedResources([...selectedResources, id]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Request Event</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-church-gold focus:border-church-gold"
                            placeholder="e.g., Women's Bible Study"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ministry (Optional)</label>
                        <select
                            value={ministryId}
                            onChange={e => setMinistryId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-church-gold focus:border-church-gold"
                        >
                            <option value="">No Ministry / General</option>
                            {ministries.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-church-gold focus:border-church-gold"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="time"
                                    required
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-church-gold focus:border-church-gold"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="time"
                                    required
                                    value={endTime}
                                    onChange={e => setEndTime(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-church-gold focus:border-church-gold"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Required Resources</label>
                        <div className="flex flex-wrap gap-2">
                            {resources.map(r => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => toggleResource(r.id)}
                                    className={`
                                        px-3 py-1.5 rounded-full text-sm font-medium transition-colors border
                                        ${selectedResources.includes(r.id)
                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                                    `}
                                >
                                    {r.name}
                                </button>
                            ))}
                        </div>
                        {isChecking && <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><Loader className="w-3 h-3 animate-spin" /> Checking availability...</p>}
                        {conflictError && (
                            <div className="mt-2 text-xs text-red-600 flex items-center gap-1 bg-red-50 p-2 rounded">
                                <AlertCircle className="w-3 h-3" />
                                {conflictError}
                            </div>
                        )}
                        {!conflictError && !isChecking && selectedResources.length > 0 && (
                            <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Resources available
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-church-gold focus:border-church-gold"
                            placeholder="Additional details..."
                        />
                    </div>

                    <div className="pt-4 flex gap-2 justify-end border-t border-gray-100 mt-6">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !!conflictError} className="bg-church-gold hover:bg-amber-600 text-white">
                            {loading ? 'Submitting...' : 'Request Event'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
