import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Plus, Play, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EventSummaryCards } from '../../components/events/EventSummaryCards';
import { EventTable } from '../../components/events/EventTable';
import { ExportMenu } from '../../components/events/ExportMenu';
import { ConfirmDialog } from '../../components/events/ConfirmDialog';
import { EventTemplates } from '../../components/events/EventTemplates';
import { PastEventsSection } from '../../components/events/PastEventsSection';
import { StartCheckInModal } from '../../components/dashboard/StartCheckInModal';

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

interface CheckInSession {
    id: string;
    service_type: string;
    code: string;
    status: 'active' | 'ended';
}

export const AdminEvents: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'admin' || user?.role === 'pastor';

    // State
    const [events, setEvents] = useState<Event[]>([]);
    const [activeCheckIn, setActiveCheckIn] = useState<CheckInSession | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showStartCheckIn, setShowStartCheckIn] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedEventForDelete, setSelectedEventForDelete] = useState<string | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        description: ''
    });

    useEffect(() => {
        fetchEvents();
        fetchActiveCheckIn();
    }, []);

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/events', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Transform backend data to match our interface
                const transformedEvents = data.map((e: any) => ({
                    id: e.id,
                    title: e.title,
                    date: e.starts_at,
                    time: e.starts_at ? new Date(e.starts_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : undefined,
                    location: e.location,
                    status: e.status,
                    checkin_code: e.active_session?.code,
                    attendance: e.total_checkins || 0
                }));
                setEvents(transformedEvents);
            } else {
                setEvents(getMockEvents());
            }
        } catch (err) {
            console.error('Failed to load events:', err);
            setEvents(getMockEvents());
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveCheckIn = async () => {
        try {
            const res = await fetch('/api/checkin/active');
            if (res.ok) {
                const data = await res.json();
                if (data && data.session) {
                    setActiveCheckIn({
                        id: data.session.id,
                        service_type: data.event.title,
                        code: data.session.code,
                        status: 'active'
                    });
                } else {
                    setActiveCheckIn(null);
                }
            }
        } catch (err) {
            console.error('Failed to fetch active check-in');
        }
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');

            // Combine date and time into starts_at timestamp
            const starts_at = formData.time
                ? `${formData.date}T${formData.time}:00`
                : `${formData.date}T00:00:00`;

            const response = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    location: formData.location,
                    starts_at
                })
            });

            if (response.ok) {
                setShowCreateModal(false);
                setFormData({ title: '', date: '', time: '', location: '', description: '' });
                fetchEvents();
            } else {
                alert('Failed to create event');
            }
        } catch (err) {
            alert('Error creating event');
        }
    };

    const handleTemplateSelect = (template: any) => {
        setFormData({
            title: template.title,
            date: '',
            time: template.defaultTime,
            location: template.location,
            description: template.description
        });
        setShowCreateModal(true);
    };

    const handleDeleteEvent = async (id: string) => {
        setSelectedEventForDelete(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!selectedEventForDelete) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/events/${selectedEventForDelete}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                fetchEvents();
            }
        } catch (err) {
            console.error('Failed to delete event');
        } finally {
            setShowDeleteConfirm(false);
            setSelectedEventForDelete(null);
        }
    };

    const handleStartCheckIn = async (eventId: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/events/${eventId}/session/start`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                fetchEvents();
                fetchActiveCheckIn();
            } else {
                const error = await res.json();
                alert(error.message || 'Failed to start session');
            }
        } catch (err) {
            console.error('Error starting session:', err);
            alert('Error starting check-in session');
        }
    };

    const handleStopCheckIn = async (eventId: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/events/${eventId}/session/stop`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                fetchEvents();
                fetchActiveCheckIn();
            } else {
                alert('Failed to stop session');
            }
        } catch (err) {
            console.error('Error stopping session:', err);
            alert('Error stopping check-in session');
        }
    };

    const handleExportCSV = () => {
        console.log('Exporting CSV...');
        alert('CSV export coming soon!');
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportRoster = (eventId: string) => {
        console.log('Exporting roster for event:', eventId);
        alert('Roster export coming soon!');
    };

    // Calculate stats
    const upcomingEvents = events.filter(e => e.status === 'scheduled' || e.status === 'live');
    const pastEvents = events.filter(e => e.status === 'completed').slice(0, 10);
    const nextEvent = upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] || null;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthStats = {
        events: events.filter(e => {
            const eventDate = new Date(e.date);
            return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
        }).length,
        attendance: events.filter(e => {
            const eventDate = new Date(e.date);
            return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
        }).reduce((sum, e) => sum + (e.attendance || 0), 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Event Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Create events and generate check-in codes</p>
                </div>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-church-gold hover:bg-church-burgundy flex-1 md:flex-initial"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Event
                    </Button>
                    {isAdmin && (
                        <>
                            <Button
                                onClick={() => setShowStartCheckIn(true)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 md:flex-initial"
                            >
                                <Play className="w-4 h-4 mr-2" />
                                Start Check-In
                            </Button>
                            <ExportMenu onExportCSV={handleExportCSV} onPrint={handlePrint} />
                        </>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <EventSummaryCards
                nextEvent={nextEvent}
                activeCheckIn={activeCheckIn}
                monthStats={monthStats}
                onOpenEvent={(id) => navigate(`/dashboard/events/${id}`)}
                onOpenCodeScreen={() => window.open('/dashboard/checkin/screen', '_blank')}
            />

            {/* Main Content */}
            {upcomingEvents.length > 0 ? (
                <>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Upcoming Events</h2>
                        <EventTable
                            events={upcomingEvents}
                            onOpen={(id) => navigate(`/dashboard/events/${id}`)}
                            onStartCheckIn={(event) => handleStartCheckIn(event.id)}
                            onStopCheckIn={(event) => handleStopCheckIn(event.id)}
                            onCopyCode={(code) => {
                                navigator.clipboard.writeText(code);
                            }}
                            onEdit={(event) => {
                                setFormData({
                                    title: event.title,
                                    date: event.date,
                                    time: event.time || '',
                                    location: event.location || '',
                                    description: ''
                                });
                                setShowCreateModal(true);
                            }}
                            onDelete={handleDeleteEvent}
                            isAdmin={isAdmin}
                        />
                    </div>

                    {/* Past Events */}
                    {pastEvents.length > 0 && (
                        <PastEventsSection
                            events={pastEvents}
                            onExportRoster={handleExportRoster}
                        />
                    )}
                </>
            ) : (
                <EventTemplates onSelectTemplate={handleTemplateSelect} />
            )}

            {/* Create/Edit Event Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">Create Event</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Event Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-church-gold outline-none"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-church-gold outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-church-gold outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-church-gold outline-none"
                                    placeholder="Main Sanctuary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-church-gold outline-none resize-none"
                                    rows={3}
                                    placeholder="Event details..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-none"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-church-gold hover:bg-church-burgundy"
                                >
                                    Create Event
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Start Check-In Modal */}
            <StartCheckInModal
                isOpen={showStartCheckIn}
                onClose={() => setShowStartCheckIn(false)}
                onStart={(session) => {
                    setActiveCheckIn(session);
                    fetchActiveCheckIn();
                }}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Event?"
                message="Are you sure you want to delete this event? This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setShowDeleteConfirm(false);
                    setSelectedEventForDelete(null);
                }}
                variant="danger"
            />
        </div>
    );
};

// Mock data for development
function getMockEvents(): Event[] {
    return [
        {
            id: '1',
            title: 'Sunday Morning Worship',
            date: '2026-01-19',
            time: '10:00',
            location: 'Main Sanctuary',
            status: 'scheduled',
            checkin_code: '4521',
            attendance: 0
        },
        {
            id: '2',
            title: 'Wednesday Bible Study',
            date: '2026-01-22',
            time: '19:00',
            location: 'Fellowship Hall',
            status: 'scheduled',
            checkin_code: '7832',
            attendance: 0
        },
        {
            id: '3',
            title: 'Prayer Night',
            date: '2026-01-24',
            time: '18:30',
            location: 'Prayer Room',
            status: 'scheduled',
            checkin_code: '9156',
            attendance: 0
        },
        {
            id: '4',
            title: 'Youth Service',
            date: '2026-01-10',
            time: '17:00',
            location: 'Youth Center',
            status: 'completed',
            attendance: 45
        },
        {
            id: '5',
            title: 'New Year Service',
            date: '2026-01-01',
            time: '10:00',
            location: 'Main Sanctuary',
            status: 'completed',
            attendance: 120
        }
    ];
}
