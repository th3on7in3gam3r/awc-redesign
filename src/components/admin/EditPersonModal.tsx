import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, AlertCircle, Home } from 'lucide-react';
import { Button } from '../ui/Button';

interface EditPersonModalProps {
    isOpen: boolean;
    onClose: () => void;
    personId: string | null;
    onUpdate: () => void;
}

export const EditPersonModal: React.FC<EditPersonModalProps> = ({ isOpen, onClose, personId, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [households, setHouseholds] = useState<{ id: string, household_name: string }[]>([]);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'member',
        person_type: 'adult',
        media_consent_status: 'unset',
        household_id: '',
        relationship: 'member'
    });

    const [isCreatingHousehold, setIsCreatingHousehold] = useState(false);
    const [newHouseholdName, setNewHouseholdName] = useState('');
    const [creatingHouseholdLoading, setCreatingHouseholdLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchHouseholds();
            setIsCreatingHousehold(false);
            setNewHouseholdName('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && personId) {
            fetchPersonDetails();
        } else {
            // Reset form
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                role: 'member',
                person_type: 'adult',
                media_consent_status: 'unset',
                household_id: '',
                relationship: 'member'
            });
            setError(null);
        }
    }, [isOpen, personId]);

    const fetchHouseholds = async () => {
        try {
            const token = localStorage.getItem('token');
            // Fetch top 100 households for now. Ideally use a search endpoint if lists get large.
            const res = await fetch('/api/staff/households?limit=100', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setHouseholds(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Failed to load households', err);
        }
    };

    const fetchPersonDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/staff/people/${personId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to load person');
            const data = await res.json();

            setFormData({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                email: data.email || '',
                phone: data.phone || '',
                role: data.role || 'member',
                person_type: data.person_type || 'adult',
                media_consent_status: data.media_consent_status || 'unset',
                household_id: data.household?.id || '',
                relationship: data.household?.relationship || (data.person_type === 'child' ? 'child' : 'member')
            });
        } catch (err) {
            console.error(err);
            setError('Could not load person details');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateHousehold = async () => {
        try {
            setCreatingHouseholdLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch('/api/staff/households', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ household_name: newHouseholdName })
            });

            if (!res.ok) throw new Error('Failed to create household');

            const newHousehold = await res.json();

            setHouseholds(prev => [...prev, newHousehold]);
            setFormData(prev => ({
                ...prev,
                household_id: newHousehold.id,
                relationship: prev.person_type === 'child' ? 'child' : 'head'
            }));

            setIsCreatingHousehold(false);
            setNewHouseholdName('');
        } catch (err) {
            console.error(err);
            setError('Failed to create household');
        } finally {
            setCreatingHouseholdLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Clean up household_id if it's empty string -> send null or don't verify strict type
            const payload = {
                ...formData,
                household_id: formData.household_id || null
            };

            const res = await fetch(`/api/staff/people/${personId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to update person');

            onUpdate();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Failed to update person');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this person? This cannot be undone.')) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/staff/people/${personId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to delete');
            }

            onUpdate();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to delete person');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Edit Person</h2>
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

                    {/* Basic Info Fields (First/Last, etc) - Keep as is, just collapsed for brevity in this replace call if possible? No, need to render full form. */}
                    {/* Re-rendering full form to be safe */}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                                type="text"
                                required
                                value={formData.first_name}
                                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-church-gold focus:border-church-gold"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                required
                                value={formData.last_name}
                                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-church-gold focus:border-church-gold"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-church-gold focus:border-church-gold"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-church-gold focus:border-church-gold"
                        />
                    </div>

                    {/* Household Section */}
                    <div className="bg-slate-50 p-4 rounded-lg space-y-3 border border-slate-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                                <Home className="w-4 h-4 text-indigo-500" />
                                Household Assignment
                            </div>
                            {!isCreatingHousehold ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsCreatingHousehold(true)}
                                    className="h-6 text-xs px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                >
                                    + Create New
                                </Button>
                            ) : null}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Household</label>
                                {isCreatingHousehold ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newHouseholdName}
                                            onChange={(e) => setNewHouseholdName(e.target.value)}
                                            placeholder="Household Name"
                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                            autoFocus
                                        />
                                        <div className="flex gap-1">
                                            <button
                                                type="button"
                                                onClick={handleCreateHousehold}
                                                disabled={!newHouseholdName.trim() || creatingHouseholdLoading}
                                                className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 disabled:opacity-50"
                                                title="Save Household"
                                            >
                                                <Save className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsCreatingHousehold(false);
                                                    setNewHouseholdName('');
                                                    setError(null);
                                                }}
                                                className="p-1.5 bg-gray-50 text-gray-500 rounded hover:bg-gray-100"
                                                title="Cancel"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <select
                                        value={formData.household_id}
                                        onChange={e => setFormData({ ...formData, household_id: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">No Household</option>
                                        {households.map(h => (
                                            <option key={h.id} value={h.id}>{h.household_name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Relationship</label>
                                <select
                                    value={formData.relationship}
                                    onChange={e => setFormData({ ...formData, relationship: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    disabled={!formData.household_id && !isCreatingHousehold} // Keep enabled if creating? No, need ID first. Actually if creating, we don't have ID yet but will momentarily.
                                >
                                    <option value="head">Head of Household</option>
                                    <option value="spouse">Spouse</option>
                                    <option value="child">Child</option>
                                    <option value="member">Member</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-church-gold focus:border-church-gold"
                            >
                                <option value="member">Member</option>
                                <option value="visitor">Visitor</option>
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                                <option value="pastor">Pastor</option>
                                <option value="ministry_leader">Ministry Leader</option>
                                <option value="finance">Finance Team</option>
                                <option value="checkin_team">Check-in Team</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={formData.person_type}
                                onChange={e => setFormData({ ...formData, person_type: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-church-gold focus:border-church-gold"
                            >
                                <option value="adult">Adult</option>
                                <option value="child">Child</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Media Consent</label>
                        <select
                            value={formData.media_consent_status}
                            onChange={e => setFormData({ ...formData, media_consent_status: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-church-gold focus:border-church-gold"
                        >
                            <option value="unset">Unset</option>
                            <option value="consent">Given Consent</option>
                            <option value="decline">Declined Consent</option>
                        </select>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-gray-100 mt-6">
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Person
                        </Button>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-church-gold hover:bg-amber-600 text-white">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
