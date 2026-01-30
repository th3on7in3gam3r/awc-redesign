import React, { useState, useEffect } from 'react';
import { X, Search, Check, Hash, Briefcase, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CreateChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: { name: string; type: string; description: string; initialMembers: string[] }) => void;
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({ isOpen, onClose, onCreate }) => {
    const { token } = useAuth();
    const [name, setName] = useState('');
    const [type, setType] = useState('general');
    const [description, setDescription] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [error, setError] = useState('');

    // Member selection state
    const [staff, setStaff] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingStaff, setLoadingStaff] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchStaff();
            // Reset state on open
            setName('');
            setType('general');
            setDescription('');
            setSelectedMembers([]);
            setError('');
        }
    }, [isOpen]);

    const fetchStaff = async () => {
        setLoadingStaff(true);
        try {
            const res = await fetch('http://localhost:5001/api/staff/directory', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStaff(data);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoadingStaff(false);
        }
    };

    const toggleMember = (personId: string) => {
        setSelectedMembers(prev =>
            prev.includes(personId)
                ? prev.filter(id => id !== personId)
                : [...prev, personId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Channel name is required');
            return;
        }

        const formattedName = name.trim().startsWith('#') ? name.trim() : `#${name.trim()}`;

        if (!/^#[a-z0-9-]+$/i.test(formattedName)) {
            setError('Channel name can only contain letters, numbers, and hyphens');
            return;
        }

        setIsSubmitting(true);
        try {
            await onCreate({
                name: formattedName,
                type,
                description,
                initialMembers: selectedMembers
            });
            onClose();
        } catch (err) {
            setError('Failed to create channel');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredStaff = staff.filter(s =>
        (s.first_name + ' ' + s.last_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">Create New Channel</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="create-channel-form" onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Channel Name
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-400 font-bold">#</span>
                                <input
                                    type="text"
                                    value={name.replace(/^#/, '')}
                                    onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow"
                                    placeholder="new-channel"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Lowercase, numbers, and hyphens only</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow"
                                placeholder="What's this channel for?"
                            />
                        </div>

                        {/* Channel Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Channel Type
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                                <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${type === 'general' ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="general"
                                        checked={type === 'general'}
                                        onChange={(e) => setType(e.target.value)}
                                        className="hidden"
                                    />
                                    <div className={`p-2 rounded-full mr-3 ${type === 'general' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                                        <Hash className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">General</div>
                                        <div className="text-xs text-gray-500">Visible to all staff</div>
                                    </div>
                                </label>

                                <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${type === 'private' ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="private"
                                        checked={type === 'private'}
                                        onChange={(e) => setType(e.target.value)}
                                        className="hidden"
                                    />
                                    <div className={`p-2 rounded-full mr-3 ${type === 'private' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">Private</div>
                                        <div className="text-xs text-gray-500">Invite-only channel</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Member Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Add Members (Optional)</label>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="p-2 bg-gray-50 border-b border-gray-200">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search staff..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                </div>
                                <div className="max-h-48 overflow-y-auto bg-white">
                                    {loadingStaff ? (
                                        <div className="p-4 text-center text-gray-500 text-sm">Loading staff directory...</div>
                                    ) : filteredStaff.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 text-sm">No staff members found</div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {filteredStaff.map((person) => {
                                                const isSelected = selectedMembers.includes(person.id);
                                                return (
                                                    <div
                                                        key={person.id}
                                                        onClick={() => toggleMember(person.id)}
                                                        className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-amber-50' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs ring-2 ring-white">
                                                                {person.first_name[0]}{person.last_name[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{person.first_name} {person.last_name}</p>
                                                                <p className="text-xs text-gray-500 capitalize">{person.role?.replace('_', ' ') || 'Staff'}</p>
                                                            </div>
                                                        </div>
                                                        {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-right font-medium">
                                    {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="create-channel-form"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-church-gold text-church-burgundy rounded-lg text-sm font-bold hover:brightness-110 transition-all shadow-sm disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Channel'}
                    </button>
                </div>
            </div>
        </div>
    );
};
