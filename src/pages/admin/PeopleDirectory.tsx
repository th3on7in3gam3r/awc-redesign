import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Shield, User, Search, UserCheck, CheckCircle, XCircle, AlertCircle, Camera, Edit2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EditPersonModal } from '../../components/admin/EditPersonModal';

interface Member {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: string;
    person_type: 'adult' | 'child';
    household_name?: string;
    media_consent_status: 'consent' | 'decline' | 'unset';
    media_consent_updated_at: string | null;
    media_consent_source: string | null;
    created_at: string;
}

export const PeopleDirectory: React.FC = () => {
    const { user } = useAuth();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [consentFilter, setConsentFilter] = useState<'all' | 'consent' | 'decline' | 'unset'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'adult' | 'child'>('all');
    const [error, setError] = useState('');

    // Edit Modal State
    const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, [consentFilter, typeFilter]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Build query params
            const params = new URLSearchParams();
            if (consentFilter !== 'all') {
                params.append('consent', consentFilter);
            }
            if (typeFilter !== 'all') {
                params.append('type', typeFilter);
            }
            if (searchTerm) {
                params.append('search', searchTerm);
            }

            const url = `/api/staff/people${params.toString() ? '?' + params.toString() : ''}`;

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch members');
            const data = await response.json();
            setMembers(data);
        } catch (err) {
            setError('Could not load member directory');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchMembers();
    };

    const handleEditClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedPersonId(id);
        setIsEditModalOpen(true);
    };

    const handleRowClick = (id: string) => {
        setSelectedPersonId(id);
        setIsEditModalOpen(true);
    };

    const getConsentBadge = (status: 'consent' | 'decline' | 'unset') => {
        if (status === 'consent') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3" />
                    Consent
                </span>
            );
        }

        if (status === 'decline') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                    <XCircle className="w-3 h-3" />
                    Declined
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                <AlertCircle className="w-3 h-3" />
                Not Set
            </span>
        );
    };

    const filteredMembers = members; // Backend handles filtering now

    if (loading) return <div className="p-8">Loading directory...</div>;

    return (
        <div className="space-y-6">
            <EditPersonModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                personId={selectedPersonId}
                onUpdate={fetchMembers}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">People Directory</h1>
                    <p className="text-gray-500 mt-1">Manage members, children, and households.</p>
                </div>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-col gap-4">
                {/* Search Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-church-gold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700">
                        Search
                    </Button>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    {/* Person Type Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-600">Type:</span>
                        <div className="flex rounded-lg overflow-hidden border border-slate-200">
                            {(['all', 'adult', 'child'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setTypeFilter(type)}
                                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${typeFilter === type
                                        ? 'bg-slate-800 text-white'
                                        : 'bg-white text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Media Consent Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-600">Consent:</span>
                        <div className="flex rounded-lg overflow-hidden border border-slate-200">
                            <button
                                onClick={() => setConsentFilter('all')}
                                className={`px-3 py-1.5 text-sm font-medium transition-colors ${consentFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setConsentFilter('consent')}
                                className={`px-3 py-1.5 text-sm font-medium transition-colors ${consentFilter === 'consent' ? 'bg-green-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                Consent
                            </button>
                            <button
                                onClick={() => setConsentFilter('decline')}
                                className={`px-3 py-1.5 text-sm font-medium transition-colors ${consentFilter === 'decline' ? 'bg-amber-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                Declined
                            </button>
                            <button
                                onClick={() => setConsentFilter('unset')}
                                className={`px-3 py-1.5 text-sm font-medium transition-colors ${consentFilter === 'unset' ? 'bg-slate-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                Unset
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Type</th>
                                <th className="px-6 py-4 font-semibold">Household</th>
                                <th className="px-6 py-4 font-semibold">
                                    <div className="flex items-center gap-2">
                                        <Camera className="w-4 h-4" />
                                        Media Consent
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredMembers.map((member, index) => (
                                <tr
                                    key={`${member.id}-${index}`}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => handleRowClick(member.id)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                                                {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {member.first_name} {member.last_name}
                                                </p>
                                                <p className="text-sm text-gray-500">{member.email || 'No email'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${member.person_type === 'child' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                                            {member.person_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {member.household_name ? (
                                            <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                                                <User className="w-3 h-3 text-gray-400" />
                                                {member.household_name}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">No household</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {getConsentBadge(member.media_consent_status)}
                                            {member.media_consent_updated_at && (
                                                <p className="text-xs text-slate-500">
                                                    Updated: {new Date(member.media_consent_updated_at).toLocaleDateString()}
                                                </p>
                                            )}
                                            {member.media_consent_source && (
                                                <p className="text-xs text-slate-500">
                                                    Source: {member.media_consent_source}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={(e) => handleEditClick(member.id, e)}
                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredMembers.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No members found matching your search.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
