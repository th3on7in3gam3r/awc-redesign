import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, ShieldCheck, Mail, Calendar, Check, X, ArrowLeft, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

interface Member {
    id: string; // This is the linkage id
    person_id: string; // The user profile id
    first_name: string;
    last_name: string;
    avatar: string | null;
    email: string;
    role: 'leader' | 'assistant' | 'member';
    status: 'active' | 'inactive';
}

interface Request {
    id: string;
    person_id: string;
    first_name: string;
    last_name: string;
    avatar: string | null;
    message: string | null;
    created_at: string;
}

export const MinistryDetailPage = () => {
    const { id } = useParams();
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [ministry, setMinistry] = useState<any>(null);
    const [requests, setRequests] = useState<Request[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'requests'>('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id && token) {
            fetchMinistry();
            fetchRequests();
        } else if (token === null) {
            setLoading(false);
        }
    }, [id, token]);

    const fetchMinistry = async () => {
        try {
            const res = await fetch(`/api/staff/ministries/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setMinistry(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await fetch(`/api/staff/ministries/${id}/requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setRequests(await res.json());
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleApproveRequest = async (requestId: string) => {
        try {
            const res = await fetch(`/api/staff/requests/${requestId}/approve`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchRequests();
                fetchMinistry(); // Refresh roster
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDenyRequest = async (requestId: string) => {
        try {
            const res = await fetch(`/api/staff/requests/${requestId}/deny`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchRequests();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!ministry) return <div>Ministry not found</div>;

    const leaders = ministry.members?.filter((m: Member) => m.role === 'leader' || m.role === 'assistant') || [];
    const members = ministry.members?.filter((m: Member) => m.role === 'member') || [];

    return (
        <div className="space-y-6">
            <Button variant="ghost" className="mb-4 pl-0" onClick={() => navigate('/staff/ministries')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Ministries
            </Button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{ministry.name}</h1>
                        <p className="text-gray-500 max-w-2xl">{ministry.description || 'No description set.'}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Event
                        </Button>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Member
                        </Button>
                    </div>
                </div>

                <div className="flex gap-6 mt-8 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-4 px-2 text-sm font-medium transition-colors ${activeTab === 'overview' ? 'border-b-2 border-amber-600 text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`pb-4 px-2 text-sm font-medium transition-colors ${activeTab === 'members' ? 'border-b-2 border-amber-600 text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Members ({ministry.members?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`pb-4 px-2 text-sm font-medium transition-colors ${activeTab === 'requests' ? 'border-b-2 border-amber-600 text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Requests ({requests.length})
                    </button>
                </div>

                <div className="mt-8">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Leadership</h3>
                                <div className="space-y-4">
                                    {leaders.length > 0 ? leaders.map((leader: Member) => (
                                        <div key={leader.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-slate-50">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                                {leader.first_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{leader.first_name} {leader.last_name}</p>
                                                <div className="flex items-center gap-1 text-xs text-amber-600 capitalize">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    {leader.role}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-gray-500 italic">No leaders assigned.</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Ministry Stats</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                        <p className="text-sm text-amber-600 font-medium">Total Members</p>
                                        <p className="text-2xl font-bold text-amber-900">{ministry.members?.length || 0}</p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <p className="text-sm text-blue-600 font-medium">Pending Requests</p>
                                        <p className="text-2xl font-bold text-blue-900">{requests.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'members' && (
                        <div>
                            <table className="w-full text-left text-sm text-gray-500">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                    <tr>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Role</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {ministry.members?.map((member: Member) => (
                                        <tr key={member.id} className="bg-white hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                                    {member.first_name.charAt(0)}
                                                </div>
                                                {member.first_name} {member.last_name}
                                            </td>
                                            <td className="px-6 py-4 capitalize">{member.role}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs ${member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">Remove</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div>
                            {requests.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-gray-300">
                                    <Mail className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500">No pending join requests</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {requests.map(req => (
                                        <div key={req.id} className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4">
                                            <div className="flex items-center gap-4 w-full">
                                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                                                    {req.first_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{req.first_name} {req.last_name}</p>
                                                    <p className="text-sm text-gray-500">{new Date(req.created_at).toLocaleDateString()}</p>
                                                    {req.message && (
                                                        <p className="text-sm text-gray-600 mt-1 italic">"{req.message}"</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 w-full md:w-auto">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
                                                    onClick={() => handleApproveRequest(req.id)}
                                                >
                                                    <Check className="w-4 h-4 mr-2" /> Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-200 text-red-600 hover:bg-red-50 w-full md:w-auto"
                                                    onClick={() => handleDenyRequest(req.id)}
                                                >
                                                    <X className="w-4 h-4 mr-2" /> Deny
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
