import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

interface Ministry {
    id: string;
    name: string;
    description: string;
    member_count: number;
    leaders: {
        id: string;
        first_name: string;
        last_name: string;
        avatar: string | null;
    }[] | null;
}

export const MinistriesPage = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [ministries, setMinistries] = useState<Ministry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (token) {
            fetchMinistries();
        } else if (token === null) {
            // Token has been checked and is null (not logged in or auth failed)
            setLoading(false);
        }
        // If token is undefined, auth is still initializing, keep loading true
    }, [token]);

    const fetchMinistries = async () => {
        try {
            const res = await fetch('/api/staff/ministries', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setMinistries(data);
            }
        } catch (err) {
            console.error('Error fetching ministries:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredMinistries = ministries.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isAdmin = ['admin', 'pastor'].includes(user?.role || '');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ministries</h1>
                    <p className="text-gray-500">Manage church ministries and leadership</p>
                </div>
                {isAdmin && (
                    <Button onClick={() => alert('Create Ministry Modal To Be Implemented')}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Ministry
                    </Button>
                )}
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search ministries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading ministries...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMinistries.map(ministry => (
                        <div key={ministry.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-lg">
                                        {ministry.name.charAt(0)}
                                    </div>
                                    <div className="px-2 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {ministry.member_count} Members
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{ministry.name}</h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                    {ministry.description || 'No description available.'}
                                </p>

                                <div className="mb-6">
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Leadership</p>
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {ministry.leaders && ministry.leaders.length > 0 ? (
                                            ministry.leaders.map(leader => (
                                                <div key={leader.id} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600" title={`${leader.first_name} ${leader.last_name}`}>
                                                    {leader.avatar ? (
                                                        <img src={leader.avatar} alt={leader.first_name} className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        leader.first_name.charAt(0)
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">No leaders assigned</span>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => navigate(`/staff/ministries/${ministry.id}`)}
                                >
                                    Manage Ministry
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
