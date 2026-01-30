import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, User, Plus, Star, X, Edit2, Loader2, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EditHouseholdModal } from '../../components/households/EditHouseholdModal';
import { AddMemberModal } from '../../components/households/AddMemberModal';

interface HouseholdMember {
    id: string; // user_profiles id
    membership_id: string; // household_members id
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    person_type: 'adult' | 'child';
    relationship: string;
    is_primary_contact: boolean;
}

interface HouseholdDetail {
    id: string;
    household_name: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    zip: string;
    members: HouseholdMember[];
}

export const HouseholdDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [household, setHousehold] = useState<HouseholdDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [addMemberType, setAddMemberType] = useState<'adult' | 'child' | null>(null);

    useEffect(() => {
        if (id && id !== 'new') {
            fetchHouseholdDetail();
        } else if (id === 'new') {
            // Initialize empty household for creation
            setHousehold({
                id: '',
                household_name: 'New Household',
                address_line1: '',
                address_line2: '',
                city: '',
                state: '',
                zip: '',
                members: []
            });
            setLoading(false);
        }
    }, [id]);

    const fetchHouseholdDetail = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/staff/households/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to load household');
            const data = await response.json();
            setHousehold(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load household details');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveHousehold = async (data: any) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/staff/households/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to update household');

            // Refresh household data
            await fetchHouseholdDetail();
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const handleDeleteHousehold = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/staff/households/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete household');

            // Navigate back to households list
            navigate('/staff/households');
        } catch (err) {
            console.error(err);
            setError('Failed to delete household');
        }
    };

    if (loading) return <div className="p-8 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-church-gold" /></div>;
    // Don't show "not found" if we are in new mode and state is initializing
    if (!household && id !== 'new') return <div className="p-8">Household not found</div>;
    if (!household && id === 'new') return <div className="p-8 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-church-gold" /></div>; // Safety fallback


    const adults = household.members.filter(m => m.person_type === 'adult');
    const children = household.members.filter(m => m.person_type === 'child');

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <button onClick={() => navigate('/staff/households')} className="flex items-center text-slate-500 hover:text-slate-800 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Households
            </button>

            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-4 bg-indigo-50 rounded-xl text-indigo-600">
                            <Home className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{household.household_name}</h1>
                            <div className="text-gray-500 mt-1 space-y-1">
                                <p>{household.address_line1}</p>
                                {household.address_line2 && <p>{household.address_line2}</p>}
                                <p>{household.city}, {household.state} {household.zip}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </Button>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => setIsEditModalOpen(true)}
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit Details
                        </Button>
                    </div>
                </div>
            </div>

            {/* Members Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Adults Column */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-500" />
                            Adults
                        </h2>
                        <Button
                            size="sm"
                            variant="secondary"
                            className="text-xs"
                            onClick={() => setAddMemberType('adult')}
                        >
                            <Plus className="w-3 h-3 mr-1" /> Add Adult
                        </Button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                        {adults.map(member => (
                            <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                                        {member.first_name[0]}{member.last_name[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-gray-900">{member.first_name} {member.last_name}</p>
                                            {member.is_primary_contact && (
                                                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                                    <Star className="w-3 h-3 fill-current" /> PRIMARY
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 capitalize">{member.relationship} • {member.email || 'No email'}</p>
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {adults.length === 0 && <div className="p-4 text-center text-gray-400 text-sm italic">No adults listed</div>}
                    </div>
                </div>

                {/* Children Column */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="text-xl">👶</span>
                            Children
                        </h2>
                        <Button
                            size="sm"
                            variant="secondary"
                            className="text-xs"
                            onClick={() => setAddMemberType('child')}
                        >
                            <Plus className="w-3 h-3 mr-1" /> Add Child
                        </Button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                        {children.map(member => (
                            <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                                        {member.first_name[0]}{member.last_name[0]}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{member.first_name} {member.last_name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{member.relationship}</p>
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {children.length === 0 && <div className="p-4 text-center text-gray-400 text-sm italic">No children listed</div>}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {household && (
                <EditHouseholdModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    household={household}
                    onSave={handleSaveHousehold}
                />
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Household?</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this household? This action cannot be undone.
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    handleDeleteHousehold();
                                }}
                            >
                                Delete Household
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {addMemberType && household && (
                <AddMemberModal
                    isOpen={true}
                    onClose={() => setAddMemberType(null)}
                    householdId={household.id}
                    memberType={addMemberType}
                    onMemberAdded={() => {
                        setAddMemberType(null);
                        fetchHouseholdDetail();
                    }}
                />
            )}
        </div>
    );
};
