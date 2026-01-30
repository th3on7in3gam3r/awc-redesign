import React, { useState, useEffect } from 'react';
import { Bell, Heart, Users, Calendar, CheckCircle, MessageSquare, TrendingUp, CheckSquare, DollarSign } from 'lucide-react';
import { ActivityFilters, ActivityType } from './ActivityFilters';

interface Activity {
    type: string;
    user: string;
    description: string;
    timestamp: string;
    icon: string;
}

const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
        CheckSquare,
        DollarSign,
        Heart,
        Users,
        Calendar,
        CheckCircle,
        MessageSquare,
        TrendingUp
    };
    return icons[iconName] || Bell;
};

const getIconColor = (type: string) => {
    const colors: Record<string, string> = {
        checkin: 'bg-blue-100 text-blue-600',
        giving: 'bg-emerald-100 text-emerald-600',
        prayer: 'bg-rose-100 text-rose-600',
        People: 'bg-blue-100 text-blue-600',
        Ministries: 'bg-rose-100 text-rose-600',
        Events: 'bg-purple-100 text-purple-600',
        Prayer: 'bg-indigo-100 text-indigo-600',
        Attendance: 'bg-emerald-100 text-emerald-600'
    };
    return colors[type] || 'bg-slate-100 text-slate-600';
};

const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
};

export const ActivityFeed: React.FC = () => {
    const [filter, setFilter] = useState<ActivityType>('All');
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch('/api/activity?limit=20', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch activities');

                const data = await response.json();
                setActivities(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching activities:', err);
                setError('Failed to load activities');
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    const filteredActivity = filter === 'All'
        ? activities
        : activities.filter(item => item.type === filter.toLowerCase());

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-slate-400" />
                    Recent Activity
                </h3>
                <button
                    onClick={() => console.log('Navigating to /dashboard/activity')}
                    className="text-xs text-church-gold hover:text-amber-700 font-bold bg-amber-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    View all
                </button>
            </div>

            <div className="px-5">
                <ActivityFilters activeFilter={filter} onFilterChange={setFilter} />
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-gold"></div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <div className="bg-red-50 p-4 rounded-full mb-4">
                            <Bell className="w-8 h-8 text-red-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-800">{error}</p>
                        <p className="text-xs text-slate-400 mt-1">Please try again later.</p>
                    </div>
                ) : filteredActivity.length > 0 ? (
                    filteredActivity.map((item, idx) => {
                        const IconComponent = getIconComponent(item.icon);
                        return (
                            <div
                                key={idx}
                                className={`flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors animate-fade-in ${idx !== filteredActivity.length - 1 ? 'border-b border-slate-50' : ''}`}
                            >
                                <div className={`p-2.5 rounded-xl flex-shrink-0 ${getIconColor(item.type)} shadow-sm`}>
                                    <IconComponent className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="text-sm font-semibold text-slate-800 leading-tight">{item.description}</p>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
                                            {formatTimeAgo(item.timestamp)}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                                        {item.user}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <div className="bg-slate-50 p-4 rounded-full mb-4">
                            <Bell className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-800">No activity found</p>
                        <p className="text-xs text-slate-400 mt-1">Try switching filters to see more updates.</p>
                    </div>
                )}
            </div>

            {!loading && !error && activities.length > 0 && (
                <button className="w-full py-4 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-b-2xl border-t border-slate-100 transition-all flex items-center justify-center gap-2">
                    Refresh activity
                </button>
            )}
        </div>
    );
};
