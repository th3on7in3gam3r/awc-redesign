import React, { useState } from 'react';
import { Users, Plus, Trash2, Baby, User } from 'lucide-react';
import { Button } from '../ui/Button';

interface Member {
    id: string;
    first_name: string;
    last_name: string;
    relationship: string;
    person_type: string;
    date_of_birth?: string;
    notes?: string; // allergies
}

interface HouseholdCardProps {
    data: {
        household: any;
        members: Member[];
    } | null;
    onRefresh: () => void;
}

export const HouseholdCard: React.FC<HouseholdCardProps> = ({ data, onRefresh }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);

    // New Member Form State
    const [newMember, setNewMember] = useState({
        firstName: '',
        lastName: '',
        dob: '',
        relationship: 'child', // default
        allergies: ''
    });

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/me/household/members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newMember)
            });

            if (res.ok) {
                onRefresh();
                setIsAdding(false);
                setNewMember({ firstName: '', lastName: '', dob: '', relationship: 'child', allergies: '' });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name} from your household?`)) return;

        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/me/household/members/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            onRefresh();
        } catch (err) {
            console.error(err);
        }
    };

    if (!data || !data.household) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">My Household</h2>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Household
                    </Button>
                </div>
                <p className="text-slate-500 text-sm">
                    You haven't set up a household yet. Add family members to get started!
                </p>
                {isAdding && (
                    <div className="mt-4 border-t pt-4">
                        {/* Reusing form logic below would be cleaner, but for MVP separate handling or just auto-create on first member add */}
                        <p className="text-xs text-slate-400 mb-2">Adding a member will automatically create your household.</p>
                        <form onSubmit={handleAddMember} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    placeholder="First Name"
                                    value={newMember.firstName}
                                    onChange={e => setNewMember({ ...newMember, firstName: e.target.value })}
                                    className="px-3 py-2 border rounded-lg text-sm"
                                    required
                                />
                                <input
                                    placeholder="Last Name"
                                    value={newMember.lastName}
                                    onChange={e => setNewMember({ ...newMember, lastName: e.target.value })}
                                    className="px-3 py-2 border rounded-lg text-sm"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                                <Button type="submit" disabled={loading}>Create & Add</Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{data.household.household_name}</h2>
                        <p className="text-xs text-slate-400">Manage your family members</p>
                    </div>
                </div>
                {!isAdding && (
                    <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Member
                    </Button>
                )}
            </div>

            <div className="space-y-3">
                {data.members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${member.relationship === 'child' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                                }`}>
                                {member.relationship === 'child' ? <Baby className="w-5 h-5" /> : <User className="w-5 h-5" />}
                            </div>
                            <div>
                                <div className="font-bold text-slate-800">
                                    {member.first_name} {member.last_name}
                                    <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-white border rounded-full text-slate-500 capitalize">
                                        {member.relationship}
                                    </span>
                                </div>
                                {(member.date_of_birth || member.notes) && (
                                    <div className="text-xs text-slate-500 flex gap-2">
                                        {member.date_of_birth && <span>Born: {new Date(member.date_of_birth).toLocaleDateString()}</span>}
                                        {member.notes && <span className="text-amber-600">• {member.notes}</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                        {member.relationship !== 'head' && (
                            <button
                                onClick={() => handleDelete(member.id, member.first_name)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {isAdding && (
                <div className="mt-6 p-4 border border-indigo-100 bg-indigo-50/30 rounded-xl animate-fade-in">
                    <h3 className="font-bold text-slate-800 mb-4 text-sm">Add Family Member</h3>
                    <form onSubmit={handleAddMember} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">First Name</label>
                                <input
                                    value={newMember.firstName}
                                    onChange={e => setNewMember({ ...newMember, firstName: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Last Name</label>
                                <input
                                    value={newMember.lastName}
                                    onChange={e => setNewMember({ ...newMember, lastName: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Relationship</label>
                                <select
                                    value={newMember.relationship}
                                    onChange={e => setNewMember({ ...newMember, relationship: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                                >
                                    <option value="child">Child</option>
                                    <option value="spouse">Spouse</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    value={newMember.dob}
                                    onChange={e => setNewMember({ ...newMember, dob: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-slate-600 mb-1">Allergies / Notes</label>
                                <input
                                    value={newMember.allergies}
                                    onChange={e => setNewMember({ ...newMember, allergies: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                                    placeholder="e.g. Peanut allergy"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                            <Button type="submit" disabled={loading}>Add Member</Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
