import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Download, Calendar, Users } from 'lucide-react';
import { Button } from '../ui/Button';

interface Event {
    id: string;
    title: string;
    date: string;
    attendance?: number;
}

interface PastEventsSectionProps {
    events: Event[];
    onExportRoster?: (eventId: string) => void;
}

export const PastEventsSection: React.FC<PastEventsSectionProps> = ({ events, onExportRoster }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (events.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-lg font-bold text-slate-900">Past Events</h3>
                        <p className="text-xs text-slate-500">{events.length} completed events</p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
            </button>

            {/* Content */}
            {
                isExpanded && (
                    <div className="border-t border-slate-100">
                        <div className="divide-y divide-slate-50">
                            {events.map(event => (
                                <div key={event.id} className="px-6 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900 mb-1">{event.title}</p>
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(event.date)}
                                            </span>
                                            {event.attendance !== undefined && (
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {event.attendance} attended
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {onExportRoster && (
                                        <Button
                                            onClick={() => onExportRoster(event.id)}
                                            className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none shadow-none text-xs py-2 px-3"
                                        >
                                            <Download className="w-3 h-3 mr-1" />
                                            Export
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }
        </div >
    );
};
