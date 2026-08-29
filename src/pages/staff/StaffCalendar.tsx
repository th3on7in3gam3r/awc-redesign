import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar as CalendarIcon, Filter, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { EventRequestModal } from '../../components/calendar/EventRequestModal';
import { EventDetailsDrawer } from '../../components/calendar/EventDetailsDrawer';

// Types
interface Resource {
    id: string;
    name: string;
    capacity: number;
}

interface Event {
    id: string;
    title: string;
    starts_at: string;
    ends_at: string;
    status: 'requested' | 'approved' | 'booked' | 'canceled' | 'completed';
    bookings: { resource_id: string; resource_name: string }[];
    description?: string;
    ministry_label?: string;
    requested_by_name?: string;
}

export const StaffCalendar: React.FC = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week'>('month');
    const [events, setEvents] = useState<Event[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals & Drawers
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    // Filters
    const [selectedResource, setSelectedResource] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchResources();
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [currentDate, view, selectedResource, statusFilter]);

    const fetchResources = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/staff/resources', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setResources(data);
            }
        } catch (err) {
            console.error('Failed to load resources', err);
        }
    };

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Calculate start/end of view
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();

            // For month view: strict month boundaries or padded?
            // Let's do padded to cover full calendar grid
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);

            // Adjust to find Sunday/Saturday of the grid
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - startDate.getDay()); // Go back to Sunday

            const endDate = new Date(lastDay);
            endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // Go fwd to Saturday

            const params = new URLSearchParams({
                from: startDate.toISOString(),
                to: endDate.toISOString()
            });

            if (selectedResource) params.append('resource_id', selectedResource);
            if (statusFilter) params.append('status', statusFilter);

            const res = await fetch(`/api/staff/events?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (err) {
            console.error('Failed to load events', err);
        } finally {
            setLoading(false);
        }
    };

    // Refresh single event (for drawer update)
    const fetchEventDetails = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/staff/events/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedEvent(data);
                // Also refresh list to update color/status in grid
                fetchEvents();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // Helper to get days for month grid
    const getCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];
        const start = new Date(firstDay);
        start.setDate(start.getDate() - start.getDay());

        const end = new Date(lastDay);
        end.setDate(end.getDate() + (6 - end.getDay()));

        let current = new Date(start);
        while (current <= end) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return days;
    };

    const days = getCalendarDays();

    // Helper to filter events for a specific day
    const getEventsForDay = (day: Date) => {
        return events.filter(e => {
            const eventDate = new Date(e.starts_at);
            return eventDate.getDate() === day.getDate() &&
                eventDate.getMonth() === day.getMonth() &&
                eventDate.getFullYear() === day.getFullYear();
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
                    <p className="text-gray-500 mt-1">Manage events and resource bookings.</p>
                </div>
                <div className="flex gap-2">
                    {user?.role === 'admin' && (
                        <Link to="/staff/resources"> {/* Future page */}
                            <Button variant="outline">
                                Manage Resources
                            </Button>
                        </Link>
                    )}
                    <Button
                        onClick={() => setIsRequestModalOpen(true)}
                        className="bg-church-gold hover:bg-amber-600 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Request Event
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-gray-900 w-32 text-center">
                        {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <select
                            value={selectedResource}
                            onChange={(e) => setSelectedResource(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-church-gold cursor-pointer bg-white"
                        >
                            <option value="">All Resources</option>
                            {resources.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                        <Filter className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-church-gold cursor-pointer bg-white"
                    >
                        <option value="">All Statuses</option>
                        <option value="requested">Requested</option>
                        <option value="approved">Approved</option>
                        <option value="booked">Booked</option>
                        <option value="canceled">Canceled</option>
                    </select>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-gray-200">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 min-h-[600px] auto-rows-fr">
                    {days.map((day, idx) => {
                        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                        const dailyEvents = getEventsForDay(day);
                        const isToday = day.toDateString() === new Date().toDateString();

                        return (
                            <div
                                key={idx}
                                className={`
                                    min-h-[100px] p-2 border-b border-r border-gray-100 last:border-r-0 
                                    ${!isCurrentMonth ? 'bg-gray-50/50' : 'bg-white'}
                                `}
                            >
                                <div className={`
                                    text-xs mb-1 font-medium w-6 h-6 flex items-center justify-center rounded-full
                                    ${isToday ? 'bg-church-gold text-white' : !isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
                                `}>
                                    {day.getDate()}
                                </div>

                                <div className="space-y-1">
                                    {dailyEvents.map(event => (
                                        <button
                                            key={event.id}
                                            onClick={() => fetchEventDetails(event.id)}
                                            className={`
                                                w-full text-left text-xs px-2 py-1 rounded truncate flex items-center gap-1
                                                ${event.status === 'requested' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : ''}
                                                ${['approved', 'booked'].includes(event.status) ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : ''}
                                                ${event.status === 'canceled' ? 'bg-gray-100 text-gray-500 line-through' : ''}
                                                hover:opacity-80 transition-opacity
                                            `}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 
                                                ${event.status === 'requested' ? 'bg-yellow-500' : ''}
                                                ${['approved', 'booked'].includes(event.status) ? 'bg-indigo-500' : ''}
                                                ${event.status === 'canceled' ? 'bg-gray-400' : ''}
                                            `} />
                                            <span className="truncate">{event.title}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modals */}
            <EventRequestModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                onSuccess={() => {
                    fetchEvents();
                    setIsRequestModalOpen(false);
                }}
                resources={resources}
            />

            <EventDetailsDrawer
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onUpdate={() => {
                    if (selectedEvent) fetchEventDetails(selectedEvent.id);
                }}
            />
        </div>
    );
};
