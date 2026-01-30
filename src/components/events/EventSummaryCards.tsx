import React from 'react';
import { Calendar, Activity, TrendingUp, ExternalLink, Monitor } from 'lucide-react';
import { Button } from '../ui/Button';

interface Event {
    id: string;
    title: string;
    date: string;
    time?: string;
    location?: string;
    status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';
}

interface CheckInSession {
    id: string;
    service_type: string;
    code: string;
    status: 'active' | 'ended';
}

interface EventSummaryCardsProps {
    nextEvent: Event | null;
    activeCheckIn: CheckInSession | null;
    monthStats: { events: number; attendance: number };
    onOpenEvent?: (id: string) => void;
    onOpenCodeScreen?: () => void;
}

export const EventSummaryCards: React.FC<EventSummaryCardsProps> = ({
    nextEvent,
    activeCheckIn,
    monthStats,
    onOpenEvent,
    onOpenCodeScreen
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'live': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'draft': return 'bg-slate-100 text-slate-600 border-slate-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Next Event Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Event</p>
                        </div>
                    </div>
                </div>

                {nextEvent ? (
                    <>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{nextEvent.title}</h3>
                        <div className="space-y-2 mb-4">
                            <p className="text-sm text-slate-600 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                {formatDate(nextEvent.date)} {nextEvent.time && `• ${nextEvent.time}`}
                            </p>
                            {nextEvent.location && (
                                <p className="text-sm text-slate-600">{nextEvent.location}</p>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider border ${getStatusColor(nextEvent.status)}`}>
                                {nextEvent.status}
                            </span>
                            {onOpenEvent && (
                                <Button
                                    onClick={() => onOpenEvent(nextEvent.id)}
                                    className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none shadow-none text-xs py-2 px-3"
                                >
                                    Open <ExternalLink className="w-3 h-3 ml-1" />
                                </Button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="py-8 text-center">
                        <p className="text-sm text-slate-400">No upcoming events</p>
                    </div>
                )}
            </div>

            {/* Active Check-In Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                            <Activity className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Check-In</p>
                        </div>
                    </div>
                </div>

                {activeCheckIn ? (
                    <>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-bold text-emerald-600">Live Session</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{activeCheckIn.service_type}</p>
                        <div className="bg-slate-50 rounded-xl p-4 mb-4 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Code</p>
                            <p className="text-3xl font-black text-church-burgundy tracking-wider font-mono">
                                {activeCheckIn.code}
                            </p>
                        </div>
                        {onOpenCodeScreen && (
                            <Button
                                onClick={onOpenCodeScreen}
                                className="w-full bg-slate-900 hover:bg-black text-white text-xs py-2"
                            >
                                <Monitor className="w-4 h-4 mr-2" />
                                Open Code Screen
                            </Button>
                        )}
                    </>
                ) : (
                    <div className="py-8 text-center">
                        <p className="text-sm text-slate-400 mb-2">No active session</p>
                        <p className="text-xs text-slate-300">Start a check-in to display code</p>
                    </div>
                )}
            </div>

            {/* This Month Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-church-gold/10 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-church-gold" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">This Month</p>
                        </div>
                    </div>
                </div>

                <h3 className="text-sm font-bold text-slate-600 mb-4">{currentMonth}</h3>

                <div className="space-y-4">
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Total Events</p>
                        <p className="text-3xl font-black text-slate-900">{monthStats.events}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Total Attendance</p>
                        <p className="text-2xl font-bold text-slate-700">{monthStats.attendance}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
