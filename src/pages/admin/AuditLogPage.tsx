import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Filter, Calendar, User, FileText } from 'lucide-react';

interface AuditEntry {
    id: string;
    actor_profile_id: string;
    actor_role: string;
    action: string;
    entity_type: string;
    entity_id: string;
    summary: string;
    diff: any;
    created_at: string;
    first_name: string;
    last_name: string;
}

export const AuditLogPage: React.FC = () => {
    const { user } = useAuth();
    const [entries, setEntries] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        entity_type: '',
        actor: '',
        limit: 100
    });
    const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

    useEffect(() => {
        fetchAuditLog();
    }, [filters]);

    const fetchAuditLog = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (filters.entity_type) params.append('entity_type', filters.entity_type);
            if (filters.actor) params.append('actor', filters.actor);
            params.append('limit', filters.limit.toString());

            const res = await fetch(`/api/staff/audit?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setEntries(data);
            }
        } catch (err) {
            console.error('Error fetching audit log:', err);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        if (action.includes('CREATE')) return 'text-green-600 bg-green-50';
        if (action.includes('UPDATE') || action.includes('EDIT')) return 'text-blue-600 bg-blue-50';
        if (action.includes('DELETE') || action.includes('DECLINE')) return 'text-red-600 bg-red-50';
        if (action.includes('APPROVE')) return 'text-emerald-600 bg-emerald-50';
        return 'text-slate-600 bg-slate-50';
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Audit Log</h1>
                <p className="text-slate-500 mt-1">Track all system actions and changes</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Entity Type
                        </label>
                        <select
                            value={filters.entity_type}
                            onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">All Types</option>
                            <option value="profile">Profile</option>
                            <option value="event">Event</option>
                            <option value="household">Household</option>
                            <option value="consent">Consent</option>
                            <option value="hold">Hold</option>
                            <option value="checkin_session">Check-in Session</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Limit
                        </label>
                        <select
                            value={filters.limit}
                            onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="50">50 entries</option>
                            <option value="100">100 entries</option>
                            <option value="200">200 entries</option>
                            <option value="500">500 entries</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={fetchAuditLog}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Filter className="w-4 h-4 inline mr-2" />
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Audit Entries Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                        <p className="text-slate-500 mt-2">Loading audit log...</p>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                        <p>No audit entries found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Timestamp
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Actor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Action
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Entity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Summary
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {entries.map((entry) => (
                                    <tr
                                        key={entry.id}
                                        onClick={() => setSelectedEntry(entry)}
                                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {formatTimestamp(entry.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-xs">
                                                    {entry.first_name?.[0]}{entry.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {entry.first_name} {entry.last_name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 capitalize">{entry.actor_role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(entry.action)}`}>
                                                {entry.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 capitalize">
                                            {entry.entity_type || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {entry.summary}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedEntry && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="text-xl font-bold text-slate-900">Audit Entry Details</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-600">Action</label>
                                <p className="text-slate-900 mt-1">{selectedEntry.action}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-600">Actor</label>
                                <p className="text-slate-900 mt-1">
                                    {selectedEntry.first_name} {selectedEntry.last_name} ({selectedEntry.actor_role})
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-600">Summary</label>
                                <p className="text-slate-900 mt-1">{selectedEntry.summary}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-600">Timestamp</label>
                                <p className="text-slate-900 mt-1">{formatTimestamp(selectedEntry.created_at)}</p>
                            </div>
                            {selectedEntry.diff && Object.keys(selectedEntry.diff).length > 0 && (
                                <div>
                                    <label className="text-sm font-semibold text-slate-600">Changes (JSON)</label>
                                    <pre className="mt-2 p-4 bg-slate-50 rounded-lg text-xs overflow-x-auto">
                                        {JSON.stringify(selectedEntry.diff, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-200 flex justify-end">
                            <button
                                onClick={() => setSelectedEntry(null)}
                                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
