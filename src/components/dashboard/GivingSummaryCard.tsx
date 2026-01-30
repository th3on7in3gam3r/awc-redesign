import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, HandHeart, ArrowRight } from 'lucide-react';

interface GivingSummary {
    range: string;
    totalIntents: number;
    totalAmount: number;
    byOption: Array<{
        giving_option_id: string;
        title: string;
        category: string;
        intents: number;
        amount: number;
    }>;
    daily: Array<{
        date: string;
        intents: number;
        amount: number;
    }>;
}

export const GivingSummaryCard: React.FC = () => {
    const [summary, setSummary] = useState<GivingSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/giving/summary?range=7d', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setSummary(data);
        } catch (err) {
            console.error('Error fetching giving summary:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            </div>
        );
    }

    // Empty state
    if (!summary || summary.totalIntents === 0) {
        return (
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <HandHeart className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-1">Giving Summary</h3>
                        <p className="text-sm text-slate-500 mb-4">No giving activity yet</p>
                        <Link
                            to="/dashboard/giving"
                            className="inline-flex items-center gap-2 text-sm text-church-gold hover:text-church-gold/80 font-medium"
                        >
                            View Tithes & Offerings
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate max for sparkline
    const maxIntents = Math.max(...summary.daily.map(d => d.intents), 1);

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 mb-1">Giving Summary</h3>
                        <p className="text-xs text-slate-500">Last 7 days (Intent tracking)</p>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <HandHeart className="w-4 h-4 text-slate-400" />
                        <p className="text-xs font-medium text-slate-500">Total Intents</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{summary.totalIntents}</p>
                </div>
                {summary.totalAmount > 0 && (
                    <div className="bg-green-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <p className="text-xs font-medium text-green-700">Intent Amount</p>
                        </div>
                        <p className="text-2xl font-bold text-green-900">
                            ${summary.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                )}
            </div>

            {/* Top Funds */}
            <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-700 mb-3">Top Funds</h4>
                <div className="space-y-2">
                    {summary.byOption.slice(0, 3).map((option, index) => (
                        <div key={option.giving_option_id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-church-gold text-white' :
                                        index === 1 ? 'bg-slate-300 text-slate-700' :
                                            'bg-amber-200 text-amber-800'
                                    }`}>
                                    {index + 1}
                                </div>
                                <span className="text-sm font-medium text-slate-700 truncate">{option.title}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">{option.intents}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mini Sparkline */}
            {summary.daily.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-sm font-bold text-slate-700 mb-3">Daily Activity</h4>
                    <div className="flex items-end gap-1 h-16">
                        {summary.daily.map((day, index) => {
                            const height = (day.intents / maxIntents) * 100;
                            return (
                                <div
                                    key={index}
                                    className="flex-1 bg-church-gold/20 rounded-t hover:bg-church-gold/40 transition-colors relative group"
                                    style={{ height: `${Math.max(height, 5)}%` }}
                                >
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {day.intents}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-2">
                        <span className="text-xs text-slate-400">
                            {new Date(summary.daily[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-xs text-slate-400">Today</span>
                    </div>
                </div>
            )}

            {/* View Link */}
            <Link
                to="/dashboard/giving"
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-medium transition-colors"
            >
                View Tithes & Offerings
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
};
