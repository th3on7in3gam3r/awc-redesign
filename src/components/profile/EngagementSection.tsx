
import React from 'react';
import { Calendar, Users, Heart, Gift } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface EngagementData {
    attendance: {
        count_30d: number;
        last_checkin: string | null;
    };
    ministries: { name: string; role: string }[];
    prayer: {
        active_count: number;
        last_request: string | null;
    };
    giving: {
        last_date: string | null;
        method: string | null;
    };
}

interface EngagementSectionProps {
    data: EngagementData | null;
}

export const EngagementSection: React.FC<EngagementSectionProps> = ({ data }) => {
    if (!data) return <div className="p-4 text-center text-slate-400">Loading engagement data...</div>;

    const formatDate = (date: string | null) => {
        if (!date) return 'None';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="space-y-8 mt-12 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-8 uppercase tracking-widest text-sm text-church-gold">
                Church Engagement
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Attendance */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800">Attendance</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                            <span className="text-slate-500">Service Streak (30d)</span>
                            <span className="font-bold text-slate-900 text-lg">{data.attendance.count_30d}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Last Check-in</span>
                            <span className="font-medium text-slate-900">{formatDate(data.attendance.last_checkin)}</span>
                        </div>
                    </div>
                </div>

                {/* Ministry */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
                            <Users className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800">My Ministries</h3>
                    </div>
                    {data.ministries.length > 0 ? (
                        <div className="space-y-3 mb-6">
                            {data.ministries.map((m, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                                    <span className="font-medium text-slate-700">{m.name}</span>
                                    <span className="text-xs font-bold uppercase tracking-wider bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">{m.role}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-400">Not serving yet.</div>
                    )}
                    <Button className="w-full bg-slate-100 text-slate-600 hover:bg-slate-200 border-none">Join a Team</Button>
                </div>

                {/* Prayer */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-red-50 text-red-600 rounded-full">
                            <Heart className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800">Prayer Life</h3>
                    </div>
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                            <span className="text-slate-500">Active Requests</span>
                            <span className="font-bold text-slate-900 text-lg">{data.prayer.active_count}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Last Submitted</span>
                            <span className="font-medium text-slate-900">{formatDate(data.prayer.last_request)}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Button className="bg-white border border-slate-200 text-slate-600">View All</Button>
                        <Button className="bg-church-gold text-white hover:bg-church-burgundy">New Prayer</Button>
                    </div>
                </div>

                {/* Giving */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-green-50 text-green-600 rounded-full">
                            <Gift className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800">Giving</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                            <span className="text-slate-500">Last Gift</span>
                            <span className="font-bold text-slate-900">{formatDate(data.giving.last_date)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Method</span>
                            <span className="font-medium text-slate-900">{data.giving.method || '-'}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
