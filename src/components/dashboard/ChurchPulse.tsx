import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Timeframe } from './TimeframeToggle';

interface StatCardProps {
    title: string;
    value: string | number;
    subtext: string;
    icon: any;
    trend?: 'up' | 'down' | 'neutral';
    color: string;
    actionLabel?: string;
    trendValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtext, icon: Icon, trend, color, actionLabel, trendValue = '+12%' }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                    {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{trendValue}</span>
                </div>
            )}
        </div>

        <div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-xs text-slate-400 mt-1">{subtext}</p>
        </div>

        {actionLabel && (
            <div className="mt-4 pt-4 border-t border-slate-50">
                <button className="text-xs font-semibold text-slate-600 hover:text-church-gold transition-colors flex items-center gap-1">
                    {actionLabel} →
                </button>
            </div>
        )}
    </div>
);

interface ChurchPulseProps {
    timeframe?: Timeframe;
    activeSession?: { type: string, code: string } | null;
}

interface PulseData {
    members: { total: number; change: number };
    attendance: { average: number; change: number };
    giving: { total: number; change: number };
    engagement: { score: number; change: number };
}

export const ChurchPulse: React.FC<ChurchPulseProps> = ({ timeframe = 'This Week', activeSession = null }) => {
    const [pulseData, setPulseData] = useState<PulseData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPulseData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const timeframeMap: Record<Timeframe, string> = {
                    'Today': 'week',
                    'This Week': 'week',
                    'This Month': 'month'
                };
                const tf = timeframeMap[timeframe as Timeframe] || 'week';

                const response = await fetch(`/api/stats/pulse?timeframe=${tf}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch pulse data');

                const data = await response.json();
                setPulseData(data);
            } catch (err) {
                console.error('Error fetching pulse data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPulseData();
    }, [timeframe]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-40 animate-pulse">
                        <div className="h-full flex flex-col justify-between">
                            <div className="bg-slate-200 h-12 w-12 rounded-xl"></div>
                            <div className="space-y-2">
                                <div className="bg-slate-200 h-8 w-20 rounded"></div>
                                <div className="bg-slate-200 h-4 w-32 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!pulseData) {
        return (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                <p className="text-slate-500">Unable to load church pulse data</p>
            </div>
        );
    }

    const getTrend = (change: number): 'up' | 'down' | 'neutral' => {
        if (change > 0) return 'up';
        if (change < 0) return 'down';
        return 'neutral';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard
                title="Worship Attendance"
                value={pulseData.attendance.average}
                subtext={`Average ${timeframe.toLowerCase()}`}
                icon={Users}
                trend={getTrend(pulseData.attendance.change)}
                trendValue={pulseData.attendance.change > 0 ? `+${pulseData.attendance.change}%` : `${pulseData.attendance.change}%`}
                color="bg-indigo-500"
                actionLabel="View Report"
            />
            <StatCard
                title="Total Members"
                value={pulseData.members.total}
                subtext="Active members"
                icon={UserPlus}
                trend={getTrend(pulseData.members.change)}
                trendValue={pulseData.members.change > 0 ? `+${pulseData.members.change}` : `${pulseData.members.change}`}
                color="bg-emerald-500"
                actionLabel="See Member List"
            />
            <StatCard
                title="Giving Total"
                value={`$${pulseData.giving.total.toLocaleString()}`}
                subtext={timeframe}
                icon={TrendingUp}
                trend={getTrend(pulseData.giving.change)}
                trendValue={pulseData.giving.change > 0 ? `+${pulseData.giving.change}%` : `${pulseData.giving.change}%`}
                color="bg-amber-500"
                actionLabel="View Giving"
            />
            <StatCard
                title={activeSession ? "Active Check-In" : "Engagement Score"}
                value={activeSession ? activeSession.type : `${pulseData.engagement.score}%`}
                subtext={activeSession ? `Access Code: ${activeSession.code}` : "Member participation"}
                icon={Calendar}
                trend={activeSession ? 'neutral' : getTrend(pulseData.engagement.change)}
                trendValue={activeSession ? "LIVE" : `${pulseData.engagement.change > 0 ? '+' : ''}${pulseData.engagement.change}%`}
                color={activeSession ? "bg-church-burgundy" : "bg-slate-400"}
                actionLabel={activeSession ? "View Live List" : "View Details"}
            />
        </div>
    );
};
