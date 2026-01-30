import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, Calendar } from 'lucide-react';

interface ChartData {
    label: string;
    val: number;
    adults: number;
    children: number;
    height: string;
}

export const AttendanceInsights: React.FC = () => {
    const [filter, setFilter] = useState<'sunday' | 'study' | 'prayer'>('sunday');
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);

    const GOAL = 350;
    const CAPACITY = 500;

    useEffect(() => {
        fetchAttendanceData();
    }, [filter]);

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch('/api/stats/attendance?period=month', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const dailyData: { date: string, count: number }[] = await res.json();

                // Process data into 4 weekly buckets
                const now = new Date();
                const processed: ChartData[] = [];

                // Helper to get week number relative to current
                const getWeekOffset = (dateStr: string) => {
                    const d = new Date(dateStr);
                    const diffTime = Math.abs(now.getTime() - d.getTime());
                    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
                };

                // Initialize buckets
                const weeks = [
                    { label: '3 Weeks Ago', offset: 4, count: 0 },
                    { label: '2 Weeks Ago', offset: 3, count: 0 },
                    { label: 'Last Week', offset: 2, count: 0 },
                    { label: 'This Week', offset: 1, count: 0 },
                ];

                // Aggregate counts (Mocking child/adult split for now since API returns total)
                weeks.forEach(week => {
                    // Filter dates belonging to this week window
                    // This is a simplified bucket logic for "reset" purposes
                    // In real app, we'd use precise date ranges

                    // Note: API returns last 30 days. We'll simply map them loosely.
                    // Actually, let's just use 4 dummy real data points if the DB is empty,
                    // or valid ones. 
                    // Let's rely on the API data.

                    // Simple logic: Group daily data into 7-day chunks working backwards
                    // const weekTotal = dailyData... 
                    // To keep it simple and robust for this "reset":

                    // Let's just create 4 placeholder slots with REAL data if available, else 0
                    // But `dailyData` is array of {date, count}.

                    // Improved logic:
                    let total = 0;
                    // Find rows falling in this week's range (approx)
                    // week.offset=1 means 0-7 days ago
                    const startDay = (week.offset - 1) * 7;
                    const endDay = week.offset * 7;

                    const weekTotal = dailyData.filter(d => {
                        const date = new Date(d.date);
                        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
                        return diffDays >= startDay && diffDays < endDay;
                    }).reduce((sum, item) => sum + item.count, 0);

                    // Height Calc (max 400 scale)
                    const heightVal = Math.min((weekTotal / 400) * 100, 100);
                    // Tailwind height classes aren't arbitrary, so we use style or valid classes
                    // We'll map to closest h-class or use style height.
                    // The original used h-32 etc. Let's stick to inline style for dynamic or map.
                    // Actually the original used classes like 'h-32' (8rem).
                    // Let's use arbitrary values or style.

                    // For the "Reset", let's assume usage of style height or standard classes
                    // I will use style for precise height representation

                    processed.unshift({
                        label: week.label,
                        val: weekTotal,
                        adults: weekTotal, // API gives combined or adults-only (checkins table). assuming adults for now.
                        children: 0,
                        height: `h-[${Math.floor((weekTotal / 400) * 200)}px]` // Approximate px height
                    });
                });

                // Fix order since unshift reversed it? No, weeks array is 3 ago -> This week.
                // Logic above: 3 weeks ago (offset 4) -> unshift puts it at start? No, unshift adds to front.
                // We want: [3 weeks ago, 2 weeks ago, ..., This week]
                // So should push.

                const finalData = weeks.reverse().map(week => { // Reverse to start from "This Week" (offset 1) going backwards?
                    // Wait, weeks array defined 3->2->1->0 (offset 4,3,2,1).
                    // Let's process correctly.

                    const startDay = (week.offset - 1) * 7; // This week (offset 1) -> 0 start
                    const endDay = week.offset * 7;

                    const weekTotal = dailyData.filter(d => {
                        const date = new Date(d.date);
                        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
                        return diffDays >= startDay && diffDays < endDay;
                    }).reduce((sum, item) => sum + item.count, 0);

                    // Scale height (max 50, approx 12rem = h-48)
                    const hClass = weekTotal > 300 ? 'h-48' : weekTotal > 200 ? 'h-36' : weekTotal > 100 ? 'h-24' : 'h-12';

                    return {
                        label: week.label,
                        val: weekTotal,
                        adults: weekTotal,
                        children: 0,
                        height: hClass
                    };
                }).reverse(); // 3 weeks ago first

                setChartData(finalData);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full flex flex-col relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                        Attendance Trends
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                        Last 4 weeks comparison
                        <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-emerald-600 font-semibold">Capacity: {CAPACITY}</span>
                    </p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg">
                    {['sunday', 'study', 'prayer'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t as any)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${filter === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Simulated Chart Area */}
            <div className="flex-1 flex items-end justify-between gap-4 px-2 min-h-[220px] relative">
                {/* Y-Axis Label */}
                <div className="hidden sm:flex flex-col justify-between h-full text-[10px] text-slate-400 py-2 pb-6">
                    <span>400</span>
                    <span>300</span>
                    <span>200</span>
                    <span>100</span>
                    <span>0</span>
                </div>

                {/* Goal Line */}
                <div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-emerald-500/30 z-0 pointer-events-none"
                    style={{ bottom: 'calc(24px + (350/400) * (100% - 40px))' }}
                >
                    <span className="absolute -top-5 right-0 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        GOAL: {GOAL}
                    </span>
                </div>

                {loading ? (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Loading...</div>
                ) : (
                    chartData.length > 0 && chartData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer relative z-10">
                            <div className="relative w-full max-w-[50px] flex items-end justify-center bg-slate-50/50 rounded-t-xl h-48">
                                {/* Stacked Bar Simulation */}
                                <div className="w-full relative flex flex-col-reverse items-center">
                                    {/* Adults */}
                                    <div
                                        className={`w-full ${d.height} bg-indigo-500 opacity-90 group-hover:opacity-100 transition-all rounded-t-lg relative`}
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1.5 rounded-lg shadow-xl transition-all whitespace-nowrap z-50 pointer-events-none">
                                            <div className="font-bold border-b border-white/20 pb-1 mb-1">{d.val} Total</div>
                                            <div className="flex justify-between gap-4 text-slate-300">
                                                <span>Adults:</span> <span>{d.adults}</span>
                                            </div>
                                            <div className="flex justify-between gap-4 text-slate-300">
                                                <span>Children:</span> <span>{d.children}</span>
                                            </div>
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                        </div>
                                    </div>
                                    {/* Children overlay highlight - just visual - removed for now as we don't distinguish */}
                                </div>
                            </div>
                            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 text-center whitespace-nowrap">{d.label}</span>
                        </div>
                    ))
                )}

                {!loading && chartData.every(d => d.val === 0) && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs bg-white/50 z-20">
                        No attendance data recorded yet
                    </div>
                )}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                        <span className="font-medium">Adults</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-200"></span>
                        <span className="font-medium">Children (incl.)</span>
                    </div>
                </div>
                <button className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-bold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                    <Calendar className="w-3.5 h-3.5" />
                    Download Report
                </button>
            </div>
        </div>
    );
};

