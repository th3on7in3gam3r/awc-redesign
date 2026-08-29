import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Home, Users, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';

interface Household {
    id: string;
    household_name: string;
    member_count: string;
    child_count: string;
    adult_count: string;
    primary_email: string;
    primary_phone: string;
}

export const HouseholdsPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [households, setHouseholds] = useState<Household[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchHouseholds();
    }, []);

    const fetchHouseholds = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);

            const response = await fetch(`/api/staff/households?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch households');
            const data = await response.json();
            setHouseholds(data);
        } catch (err) {
            console.error('Error fetching households:', err);
            setError('Failed to load households');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchHouseholds();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Households</h1>
                    <p className="text-gray-500 mt-1">Manage family units and household memberships.</p>
                </div>
                <Button onClick={() => navigate('/staff/households/new')} className="bg-church-gold hover:bg-amber-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Household
                </Button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by household name..."
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

            {loading ? (
                <div className="p-8 text-center text-gray-500">Loading households...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {households.map((household) => (
                        <div key={household.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Home className="w-6 h-6" />
                                </div>
                                <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                    {parseInt(household.member_count)} Members
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1">{household.household_name}</h3>
                            <div className="text-sm text-gray-500 mb-4 flex-1">
                                {household.primary_email && <p>{household.primary_email}</p>}
                                {household.primary_phone && <p>{household.primary_phone}</p>}
                            </div>

                            <div className="flex items-center gap-3 text-sm text-gray-600 mb-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{parseInt(household.adult_count || '0')} Adults</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-gray-300" />
                                <div>
                                    <span>{parseInt(household.child_count || '0')} Children</span>
                                </div>
                            </div>

                            <Link
                                to={`/staff/households/${household.id}`}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                View Details
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ))}

                    {households.length === 0 && (
                        <div className="col-span-full p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                            <Home className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium">No households found</p>
                            <p className="text-sm mt-1">Try searching or create a new one</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
