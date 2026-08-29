import React, { useState, useEffect } from 'react';
import { DollarSign, Download, Filter, Plus, TrendingUp, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { FinanceEntryModal } from '../../components/finance/FinanceEntryModal';

interface FinanceSummary {
    range: string;
    total_amount: number;
    by_fund: { fund_id: string; fund_name: string; amount: string }[];
    by_source: { source_id: string; source_name: string; amount: string }[];
    daily: { date: string; amount: string }[];
}

interface FinanceEntry {
    id: string;
    entry_date: string;
    amount: string;
    memo: string;
    fund_name: string;
    source_name: string;
    created_by_name: string;
}

const FinancePage = () => {
    const { user, token } = useAuth();
    const [range, setRange] = useState('30d');
    const [summary, setSummary] = useState<FinanceSummary | null>(null);
    const [entries, setEntries] = useState<FinanceEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

    // Filters
    const [funds, setFunds] = useState<{ id: string, name: string }[]>([]);
    const [sources, setSources] = useState<{ id: string, name: string }[]>([]);
    const [filterFund, setFilterFund] = useState('');
    const [filterSource, setFilterSource] = useState('');

    const isAuthorized = ['admin', 'pastor', 'finance'].includes(user?.role || '');

    useEffect(() => {
        if (token && isAuthorized) {
            fetchData();
            fetchOptions();
        } else if (token === null || (user && !isAuthorized)) {
            setLoading(false);
        }
    }, [token, range, filterFund, filterSource, isAuthorized]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ range });
            if (filterFund) params.append('fund_id', filterFund);
            if (filterSource) params.append('source_id', filterSource);

            const [summaryRes, entriesRes] = await Promise.all([
                fetch(`/api/staff/finance/summary?${params}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/staff/finance/entries?${params}`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (summaryRes.ok) setSummary(await summaryRes.json());
            if (entriesRes.ok) setEntries(await entriesRes.json());

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = async () => {
        try {
            const [fundsRes, sourcesRes] = await Promise.all([
                fetch('/api/staff/finance/funds', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/staff/finance/sources', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (fundsRes.ok) setFunds(await fundsRes.json());
            if (sourcesRes.ok) setSources(await sourcesRes.json());
        } catch (err) {
            console.error(err);
        }
    };

    const handleExport = async () => {
        try {
            const params = new URLSearchParams({ range });
            if (filterFund) params.append('fund_id', filterFund);
            if (filterSource) params.append('source_id', filterSource);

            const res = await fetch(`/api/staff/finance/export.csv?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `finance_export_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        } catch (err) {
            console.error('Export failed:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this entry? This action is audited.')) return;
        try {
            const res = await fetch(`/api/staff/finance/entries/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    if (!isAuthorized && !loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-500 max-w-md">
                    You do not have permission to access the Finance module. Please contact an administrator if you believe this is an error.
                </p>
            </div>
        );
    }

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Finance & Giving</h1>
                    <p className="text-gray-500">Track donations, funds, and weekly totals</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button onClick={() => setIsEntryModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Entry
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Giving ({range})</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {summary ? formatCurrency(summary.total_amount) : '...'}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Top Fund</p>
                            <h3 className="text-lg font-bold text-gray-900 truncate">
                                {summary?.by_fund?.[0]?.fund_name || 'None'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {summary?.by_fund?.[0] ? formatCurrency(summary.by_fund[0].amount) : '-'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Top Source</p>
                            <h3 className="text-lg font-bold text-gray-900 truncate">
                                {summary?.by_source?.[0]?.source_name || 'None'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {summary?.by_source?.[0] ? formatCurrency(summary.by_source[0].amount) : '-'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-gray-500 mr-2">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filters:</span>
                </div>

                <select
                    value={range}
                    onChange={e => setRange(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
                >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="all">All Time</option>
                </select>

                <select
                    value={filterFund}
                    onChange={e => setFilterFund(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
                >
                    <option value="">All Funds</option>
                    {funds.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>

                <select
                    value={filterSource}
                    onChange={e => setFilterSource(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
                >
                    <option value="">All Sources</option>
                    {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>

            {/* Entries Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Fund</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Memo</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading entries...</td></tr>
                            ) : entries.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No finance entries found for this period.</td></tr>
                            ) : (
                                entries.map(entry => (
                                    <tr key={entry.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-900">{new Date(entry.entry_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-gray-700">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                {entry.fund_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{entry.source_name}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(entry.amount)}</td>
                                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={entry.memo}>{entry.memo || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(entry.id)}
                                                className="text-red-600 hover:text-red-900 text-xs font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <FinanceEntryModal
                isOpen={isEntryModalOpen}
                onClose={() => setIsEntryModalOpen(false)}
                onSuccess={fetchData}
                token={token}
            />
        </div>
    );
};

export default FinancePage;
