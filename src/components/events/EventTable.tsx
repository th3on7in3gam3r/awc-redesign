import React, { useState } from 'react';
import { Search, MoreVertical, ExternalLink, Play, StopCircle, Copy, Edit2, Trash2, CheckCircle } from 'lucide-react';

interface Event {
    id: string;
    title: string;
    date: string;
    time?: string;
    location?: string;
    status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';
    checkin_code?: string;
    attendance?: number;
}

interface EventTableProps {
    events: Event[];
    onOpen?: (id: string) => void;
    onStartCheckIn?: (event: Event) => void;
    onStopCheckIn?: (event: Event) => void;
    onCopyCode?: (code: string) => void;
    onEdit?: (event: Event) => void;
    onDelete?: (id: string) => void;
    isAdmin?: boolean;
}

export const EventTable: React.FC<EventTableProps> = ({
    events,
    onOpen,
    onStartCheckIn,
    onStopCheckIn,
    onCopyCode,
    onEdit,
    onDelete,
    isAdmin = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const filters = [
        { label: 'All', value: 'all' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Live', value: 'live' },
        { label: 'Completed', value: 'completed' },
        { label: 'Draft', value: 'draft' }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'live': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'draft': return 'bg-slate-100 text-slate-600 border-slate-200';
            case 'completed': return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'cancelled': return 'bg-rose-100 text-rose-600 border-rose-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    const formatDate = (dateStr: string, timeStr?: string) => {
        const date = new Date(dateStr);
        const dateFormatted = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        return timeStr ? `${dateFormatted} • ${timeStr}` : dateFormatted;
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
        if (onCopyCode) onCopyCode(code);
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.location?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = statusFilter === 'all' || event.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header with Search and Filters */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    {/* Search */}
                    <div className="relative flex-1 w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-church-gold outline-none"
                        />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
                        {filters.map(filter => (
                            <button
                                key={filter.value}
                                onClick={() => setStatusFilter(filter.value)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${statusFilter === filter.value
                                    ? 'bg-church-gold text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Event</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Time</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Location</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Code</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredEvents.length > 0 ? (
                            filteredEvents.map(event => (
                                <tr key={event.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-900">{event.title}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600">{formatDate(event.date, event.time)}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600">{event.location || '—'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider border ${getStatusColor(event.status)}`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {event.checkin_code ? (
                                            <button
                                                onClick={() => handleCopyCode(event.checkin_code!)}
                                                className="flex items-center gap-2 text-xs font-mono bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors"
                                            >
                                                {copiedCode === event.checkin_code ? (
                                                    <>
                                                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                                                        <span className="text-emerald-600">Copied!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        {event.checkin_code}
                                                        <Copy className="w-3 h-3 text-slate-400" />
                                                    </>
                                                )}
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {onOpen && (
                                                <button
                                                    onClick={() => onOpen(event.id)}
                                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
                                                    title="Open event"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            )}
                                            {isAdmin && onStartCheckIn && event.status === 'scheduled' && (
                                                <button
                                                    onClick={() => onStartCheckIn(event)}
                                                    className="p-2 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-600"
                                                    title="Start check-in"
                                                >
                                                    <Play className="w-4 h-4" />
                                                </button>
                                            )}
                                            {isAdmin && onStopCheckIn && event.status === 'live' && (
                                                <button
                                                    onClick={() => onStopCheckIn(event)}
                                                    className="p-2 hover:bg-rose-50 rounded-lg transition-colors text-rose-600"
                                                    title="Stop check-in"
                                                >
                                                    <StopCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(event)}
                                                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                                                    title="Edit event"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            {isAdmin && onDelete && (
                                                <button
                                                    onClick={() => onDelete(event.id)}
                                                    className="p-2 hover:bg-rose-50 rounded-lg transition-colors text-rose-600"
                                                    title="Delete event"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center">
                                    <div className="w-12 h-12 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-400">No events found</p>
                                    <p className="text-xs text-slate-300 mt-1">Try adjusting your search or filters</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
