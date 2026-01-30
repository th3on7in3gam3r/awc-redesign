import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Search } from 'lucide-react';
import { Button } from '../ui/Button';

interface Person {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    person_type: 'adult' | 'child';
}

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    householdId: string;
    memberType: 'adult' | 'child';
    onMemberAdded: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
    isOpen,
    onClose,
    householdId,
    memberType,
    onMemberAdded
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [people, setPeople] = useState<Person[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [relationship, setRelationship] = useState(memberType === 'child' ? 'child' : 'member');
    const [isPrimaryContact, setIsPrimaryContact] = useState(false);

    useEffect(() => {
        if (isOpen) {
            searchPeople();
        }
    }, [isOpen, memberType]);

    const searchPeople = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            params.append('person_type', memberType);

            const response = await fetch(`/api/staff/people?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch people');
            const data = await response.json();
            setPeople(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load people');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (personId: string) => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/staff/households/${householdId}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    person_id: personId,
                    relationship,
                    is_primary_contact: isPrimaryContact
                })
            });

            if (!response.ok) throw new Error('Failed to add member');

            onMemberAdded();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Failed to add member to household');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        Add {memberType === 'adult' ? 'Adult' : 'Child'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-6 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder={`Search for ${memberType === 'adult' ? 'adults' : 'children'}...`}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && searchPeople()}
                        />
                    </div>

                    {/* Relationship & Primary Contact */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Relationship
                            </label>
                            <select
                                value={relationship}
                                onChange={(e) => setRelationship(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {memberType === 'adult' ? (
                                    <>
                                        <option value="member">Member</option>
                                        <option value="spouse">Spouse</option>
                                        <option value="parent">Parent</option>
                                        <option value="guardian">Guardian</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="child">Child</option>
                                        <option value="dependent">Dependent</option>
                                    </>
                                )}
                            </select>
                        </div>
                        {memberType === 'adult' && (
                            <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isPrimaryContact}
                                        onChange={(e) => setIsPrimaryContact(e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-700">Primary Contact</span>
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    ) : people.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No {memberType === 'adult' ? 'adults' : 'children'} found</p>
                            <p className="text-sm mt-1">Try searching by name</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {people.map((person, index) => (
                                <div
                                    key={`${person.id}-${index}`}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                            {person.first_name[0]}{person.last_name[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {person.first_name} {person.last_name}
                                            </p>
                                            <p className="text-sm text-gray-500">{person.email || 'No email'}</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleAddMember(person.id)}
                                        disabled={loading}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        Add
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
