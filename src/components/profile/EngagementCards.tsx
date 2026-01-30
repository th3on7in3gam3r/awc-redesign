import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { PrayerModal } from './modals/PrayerModal';
import MinistriesCard from './MinistriesCard';

interface EngagementCardsProps {
    data: {
        attendance: {
            lastCheckIn: { service_date: string, service_type: string } | null;
            stats: { last30Days: number, last90Days: number };
        };
        ministries: Array<{ name: string, role: string }>;
        prayer: {
            summary: { activeCount: number, lastRequest: string | null };
        };
    };
    onRefresh: () => void;
}

export const EngagementCards: React.FC<EngagementCardsProps> = ({ data, onRefresh }) => {
    const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. Attendance Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <i className="fa-solid fa-clipboard-check"></i>
                        </div>
                        <h3 className="font-bold text-slate-800">Attendance</h3>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wide font-bold">Last Check-in</p>
                            {data.attendance?.lastCheckIn ? (
                                <p className="text-slate-700 font-medium">
                                    {new Date(data.attendance.lastCheckIn.service_date).toLocaleDateString()}
                                    <span className="text-slate-400 text-sm ml-1">• {data.attendance.lastCheckIn.service_type}</span>
                                </p>
                            ) : (
                                <p className="text-slate-400 italic text-sm">No recent check-ins</p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded-lg text-center">
                                <span className="block text-xl font-bold text-slate-800">{data.attendance?.stats?.last30Days || 0}</span>
                                <span className="text-[10px] text-slate-500 uppercase">30 Days</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg text-center">
                                <span className="block text-xl font-bold text-slate-800">{data.attendance?.stats?.last90Days || 0}</span>
                                <span className="text-[10px] text-slate-500 uppercase">90 Days</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                        <Button variant="ghost" className="w-full text-blue-600 hover:bg-blue-50 text-sm">
                            View History <i className="fa-solid fa-arrow-right ml-2 text-xs"></i>
                        </Button>
                    </div>
                </div>

                {/* 2. Ministry Card - Replaced with new component */}
                <MinistriesCard />

                {/* 3. Prayer Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                            <i className="fa-solid fa-hands-praying"></i>
                        </div>
                        <h3 className="font-bold text-slate-800">Prayer Requests</h3>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="bg-purple-50 rounded-xl p-4 flex items-center justify-between">
                            <span className="text-purple-900 font-medium text-sm">Active Requests</span>
                            <span className="text-2xl font-bold text-purple-700">{data.prayer?.summary?.activeCount || 0}</span>
                        </div>
                        {data.prayer?.summary?.lastRequest && (
                            <p className="text-xs text-slate-400 text-center">
                                Last submitted: {new Date(data.prayer.summary.lastRequest).toLocaleDateString()}
                            </p>
                        )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                        <Button onClick={() => setIsPrayerModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white text-sm">
                            Submit Prayer
                        </Button>
                        <Button variant="ghost" className="text-purple-600 hover:bg-purple-50 text-sm">
                            View All
                        </Button>
                    </div>
                </div>
            </div>

            <PrayerModal isOpen={isPrayerModalOpen} onClose={() => setIsPrayerModalOpen(false)} onSuccess={onRefresh} />
        </>
    );
};
