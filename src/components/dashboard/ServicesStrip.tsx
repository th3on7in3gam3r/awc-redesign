import React from 'react';
import { Clock, Users, UserPlus, Play } from 'lucide-react';

interface ServicesStripProps {
    onStartClick: () => void;
}

export const ServicesStrip: React.FC<ServicesStripProps> = ({ onStartClick }) => {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3 px-5 flex flex-wrap lg:flex-nowrap items-center gap-6 lg:gap-12 w-full">
            {/* Next Service */}
            <div className="flex items-center gap-3 min-w-fit">
                <div className="bg-slate-100 p-2 rounded-lg">
                    <Clock className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Service</p>
                    <p className="text-sm font-bold text-slate-800">Sunday @ 10:00 AM</p>
                </div>
            </div>

            {/* divider hidden on small screens */}
            <div className="hidden lg:block h-8 w-px bg-slate-100"></div>

            {/* Check-ins Today */}
            <div className="flex items-center gap-3 min-w-fit">
                <div className="bg-indigo-50 p-2 rounded-lg">
                    <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Check-ins Today</p>
                    <p className="text-sm font-bold text-slate-800">0 Total</p>
                </div>
            </div>

            {/* Guests Today */}
            <div className="flex items-center gap-3 min-w-fit">
                <div className="bg-emerald-50 p-2 rounded-lg">
                    <UserPlus className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guests Today</p>
                    <p className="text-sm font-bold text-slate-800">0 New</p>
                </div>
            </div>

            <div className="flex-1 lg:flex justify-end hidden sm:flex">
                <button
                    onClick={onStartClick}
                    className="flex items-center gap-2 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-slate-200 group"
                >
                    <Play className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" />
                    Start Check-In
                </button>
            </div>

            {/* Mobile button */}
            <div className="w-full sm:hidden">
                <button
                    onClick={onStartClick}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white text-xs font-bold rounded-xl"
                >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start Check-In
                </button>
            </div>
        </div>
    );
};
