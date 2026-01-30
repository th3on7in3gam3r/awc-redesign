import React, { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Crown, Users } from 'lucide-react';
import { Button } from '../ui/Button';

interface ChannelMember {
    person_id: string;
    first_name: string;
    last_name: string;
    role: string;
}

interface StaffUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
}

interface ManageChannelMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    channelId: string;
    channelName: string;
}

export const ManageChannelMembersModal: React.FC<ManageChannelMembersModalProps> = ({
    isOpen,
    onClose,
    channelId,
    channelName
}) => {
    const [members, setMembers] = useState<ChannelMember[]>([]);
    const [availableStaff, setAvailableStaff] = useState<StaffUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
            fetchAvailableStaff();
        }
    }, [isOpen, channelId]);

    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/staff/chat/channels/${channelId}/members`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMembers(data);
            }
        } catch (err) {
            console.error('Error fetching members:', err);
        }
    };

    const fetchAvailableStaff = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/staff/people?role=staff', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAvailableStaff(data);
            }
        } catch (err) {
            console.error('Error fetching staff:', err);
        }
    };

    const handleAddMember = async () => {
        if (!selectedStaff) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/staff/chat/channels/${channelId}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ person_id: selectedStaff })
            });

            if (res.ok) {
                setSelectedStaff('');
                fetchMembers();
                fetchAvailableStaff();
            }
        } catch (err) {
            console.error('Error adding member:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (personId: string) => {
        if (!confirm('Remove this member from the channel?')) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/staff/chat/channels/${channelId}/members/${personId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                fetchMembers();
                fetchAvailableStaff();
            }
        } catch (err) {
            console.error('Error removing member:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Filter out staff who are already members
    const nonMembers = availableStaff.filter(
        staff => !members.some(m => m.person_id === staff.id)
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Manage Members</h2>
                            <p className="text-sm text-gray-500">{channelName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                    {/* Add Member Section */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Staff Member</h3>
                        <div className="flex gap-2">
                            <select
                                value={selectedStaff}
                                onChange={(e) => setSelectedStaff(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                disabled={loading}
                            >
                                <option value="">Select a staff member...</option>
                                {nonMembers.map(staff => (
                                    <option key={staff.id} value={staff.id}>
                                        {staff.first_name} {staff.last_name} ({staff.role})
                                    </option>
                                ))}
                            </select>
                            <Button
                                onClick={handleAddMember}
                                disabled={!selectedStaff || loading}
                                className="bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add
                            </Button>
                        </div>
                    </div>

                    {/* Current Members */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            Current Members ({members.length})
                        </h3>
                        <div className="space-y-2">
                            {members.map(member => (
                                <div
                                    key={member.person_id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                                            {member.first_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {member.first_name} {member.last_name}
                                            </p>
                                            {member.role === 'owner' && (
                                                <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                                                    <Crown className="w-3 h-3" />
                                                    Channel Owner
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {member.role !== 'owner' && (
                                        <button
                                            onClick={() => handleRemoveMember(member.person_id)}
                                            disabled={loading}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {members.length === 0 && (
                                <p className="text-center text-gray-500 py-8">No members yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <Button onClick={onClose} variant="outline">
                        Done
                    </Button>
                </div>
            </div>
        </div>
    );
};
