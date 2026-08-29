import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    QrCode, CheckCircle, XCircle, Users, UserPlus, Shield,
    Play, Square, Monitor, Search, Download, Printer,
    Filter, Clock, ChevronRight, MessageSquare
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StartCheckInModal } from '../../components/dashboard/StartCheckInModal';

export const CheckIn: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'member' | 'guest'>('member');

    // Session State
    const [activeSession, setActiveSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showStartModal, setShowStartModal] = useState(false);

    // Member Checkin State
    const [code, setCode] = useState(['', '', '', '']);
    const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
    const [checkinStatus, setCheckinStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    // Guest Form State
    const [guestForm, setGuestForm] = useState({
        fullName: '',
        phone: '',
        email: '',
        adults: 1,
        children: 0,
        firstTime: false,
        contactOk: true,
        prayerRequest: ''
    });

    // Admin Roster State
    const [roster, setRoster] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [rosterFilter, setRosterFilter] = useState<'all' | 'member' | 'guest' | 'first'>('all');

    const isAdmin = user?.role === 'admin' || user?.role === 'pastor';

    const fetchSession = async () => {
        try {
            const res = await fetch('/api/checkin/active');

            if (!res.ok) {
                console.error('Failed to fetch session:', res.status);
                setActiveSession(null);
                setLoading(false);
                return;
            }

            const data = await res.json();

            // Transform the response to include both event and session
            if (data && data.session) {
                setActiveSession({
                    ...data.session,
                    event: data.event
                });

                if (data.session.id && isAdmin) {
                    // Note: We'll need to update the roster endpoint to use event ID
                    fetchRoster(data.event.id);
                }
            } else {
                setActiveSession(null);
            }
        } catch (err) {
            console.error('Error fetching session:', err);
            setActiveSession(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoster = async (eventId: string) => {
        if (!eventId) {
            console.log('No event ID provided, skipping roster fetch');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/events/${eventId}/roster`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                console.error('Failed to fetch roster:', res.status);
                setRoster([]);
                return;
            }

            const data = await res.json();
            setRoster(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching roster:', err);
            setRoster([]);
        }
    };

    useEffect(() => {
        fetchSession();
        const sessionInterval = setInterval(fetchSession, 30000);
        let rosterInterval: any;

        if (isAdmin) {
            rosterInterval = setInterval(() => {
                if (activeSession) fetchRoster(activeSession.id);
            }, 10000);
        }

        return () => {
            clearInterval(sessionInterval);
            if (rosterInterval) clearInterval(rosterInterval);
        };
    }, [isAdmin, activeSession?.id]);

    // Member Code Logic
    const handleCodeChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value.slice(-1);
        setCode(newCode);

        if (value && index < 3) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const submitMemberCheckIn = async () => {
        const fullCode = code.join('');
        if (fullCode.length < 4) return;

        setCheckinStatus('loading');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/checkin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code: fullCode })
            });
            const data = await res.json();
            if (res.ok) {
                setCheckinStatus('success');
                setMessage('You’re checked in 🎉');
            } else {
                setCheckinStatus('error');
                // Display detailed error if available, otherwise fallback message
                const msg = data.error
                    ? `${data.message}: ${data.error}`
                    : (data.message || 'Check-in failed');
                setMessage(msg);
            }
        } catch (err) {
            setCheckinStatus('error');
            setMessage('Server error');
        }
    };

    // Guest Form Logic
    const handleGuestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCheckinStatus('loading');
        try {
            const res = await fetch('/api/guest-checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(guestForm)
            });
            if (res.ok) {
                setCheckinStatus('success');
                setMessage('Welcome! We’re glad you’re here.');
            } else {
                const data = await res.json();
                setCheckinStatus('error');
                setMessage(data.message || 'Check-in failed');
            }
        } catch (err) {
            setCheckinStatus('error');
            setMessage('Server error');
        }
    };

    // Admin Controls
    const stopSession = async () => {
        if (!window.confirm('Are you sure you want to end this check-in session?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/admin/sessions/stop', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setActiveSession(null);
            setRoster([]);
        } catch (err) {
            console.error('Error stopping session:', err);
        }
    };

    // Exports
    const exportCSV = () => {
        const headers = ["Time", "Name", "Type", "Adults", "Children", "First Time", "Contact"];
        const rows = roster.map(r => [
            new Date(r.created_at).toLocaleTimeString(),
            r.display_name,
            r.type,
            r.adults,
            r.children,
            r.first_time ? 'Yes' : 'No',
            r.guest_phone || r.member_phone || ''
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `roster_${activeSession?.service_type || 'checkin'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-church-gold rounded-full animate-spin"></div>
            </div>
        );
    }

    if (checkinStatus === 'success') {
        return (
            <div className="max-w-md mx-auto py-20 text-center animate-fade-in">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{message}</h1>
                <p className="text-slate-500 mb-10">
                    {activeSession?.service_type} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="space-y-3">
                    <Button onClick={() => setCheckinStatus('idle')} className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 border-none shadow-none py-4">
                        Check in another person
                    </Button>
                    <Button onClick={() => navigate('/dashboard')} className="w-full bg-church-gold py-4 text-white">
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    const filteredRoster = roster.filter(r => {
        const matchesSearch = r.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) || r.guest_phone?.includes(searchTerm);
        if (rosterFilter === 'all') return matchesSearch;
        if (rosterFilter === 'member') return matchesSearch && r.type === 'member';
        if (rosterFilter === 'guest') return matchesSearch && r.type === 'guest';
        if (rosterFilter === 'first') return matchesSearch && r.first_time;
        return matchesSearch;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest text-xs mb-1 font-sans">Attendance</h2>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        Event Check-In
                        {activeSession ? (
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full animate-pulse border border-emerald-200 uppercase tracking-wider">
                                Live: {activeSession.service_type}
                            </span>
                        ) : (
                            <span className="bg-slate-100 text-slate-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200 uppercase tracking-wider">
                                No Live Session
                            </span>
                        )}
                    </h1>
                </div>

                {isAdmin && !activeSession && (
                    <Button
                        onClick={() => setShowStartModal(true)}
                        className="bg-church-gold hover:bg-church-burgundy text-white shadow-lg shadow-amber-200"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Start Session
                    </Button>
                )}

                {isAdmin && activeSession && (
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => window.open('/dashboard/checkin/screen', '_blank')}
                            className="bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 shadow-sm"
                        >
                            <Monitor className="w-4 h-4 mr-2" />
                            Open Code Screen
                        </Button>
                        <Button
                            onClick={stopSession}
                            className="bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 shadow-none"
                        >
                            <Square className="w-4 h-4 mr-2 fill-current" />
                            Stop Session
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Main Action Area (Left/Center) */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-6">

                    {/* Event Info Banner */}
                    {activeSession?.event && (
                        <div className="bg-gradient-to-r from-church-gold/10 to-church-burgundy/10 rounded-2xl border border-church-gold/20 p-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Checking in for:</p>
                            <h2 className="text-xl font-bold text-slate-900">{activeSession.event.title}</h2>
                            {activeSession.event.location && (
                                <p className="text-sm text-slate-600 mt-1">{activeSession.event.location}</p>
                            )}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                        <button
                            onClick={() => setActiveTab('member')}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'member' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <QrCode className="w-4 h-4" />
                            Member Check-In
                        </button>
                        <button
                            onClick={() => setActiveTab('guest')}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'guest' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <UserPlus className="w-4 h-4" />
                            Guest Check-In
                        </button>
                    </div>

                    {/* Member Form */}
                    {activeTab === 'member' && (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 lg:p-12 text-center">
                            {!activeSession ? (
                                <div className="py-10">
                                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Clock className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Check-in is currently closed</h3>
                                    <p className="text-slate-500 mt-2 max-w-xs mx-auto">Please wait for the service session to begin.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-church-gold/10 text-church-gold rounded-full flex items-center justify-center mx-auto mb-6">
                                        <QrCode className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-1">Enter Code</h3>
                                    <p className="text-slate-500 mb-10 text-sm">Find the 4-digit code on the main screen</p>

                                    <div className="flex justify-center gap-3 mb-10">
                                        {code.map((digit, i) => (
                                            <input
                                                key={i}
                                                ref={inputRefs[i]}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleCodeChange(i, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(i, e)}
                                                className="w-14 h-20 text-center text-4xl font-black bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-church-gold focus:ring-0 transition-all text-slate-900"
                                            />
                                        ))}
                                    </div>

                                    {checkinStatus === 'error' && (
                                        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3 mb-8 justify-center animate-shake">
                                            <XCircle className="w-5 h-5" />
                                            <span className="text-sm font-bold">{message}</span>
                                        </div>
                                    )}

                                    <Button
                                        onClick={submitMemberCheckIn}
                                        disabled={code.some(d => !d) || checkinStatus === 'loading'}
                                        className="w-full py-5 text-lg bg-church-gold hover:bg-church-burgundy shadow-lg shadow-amber-200"
                                    >
                                        {checkinStatus === 'loading' ? 'Checking in...' : 'Check In Now'}
                                    </Button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Guest Form */}
                    {activeTab === 'guest' && (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 lg:p-10">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <UserPlus className="w-6 h-6 text-church-gold" />
                                New Guest Registration
                            </h3>

                            <form onSubmit={handleGuestSubmit} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name *</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="First & Last Name"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-church-gold/20 focus:border-church-gold outline-none transition-all"
                                        value={guestForm.fullName}
                                        onChange={e => setGuestForm({ ...guestForm, fullName: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Phone *</label>
                                        <input
                                            required
                                            type="tel"
                                            placeholder="(555) 000-0000"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-church-gold/20 focus:border-church-gold outline-none transition-all"
                                            value={guestForm.phone}
                                            onChange={e => setGuestForm({ ...guestForm, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
                                        <input
                                            type="email"
                                            placeholder="email@example.com"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-church-gold/20 focus:border-church-gold outline-none transition-all"
                                            value={guestForm.email}
                                            onChange={e => setGuestForm({ ...guestForm, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Adults</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                            value={guestForm.adults}
                                            onChange={e => setGuestForm({ ...guestForm, adults: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Children</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                            value={guestForm.children}
                                            onChange={e => setGuestForm({ ...guestForm, children: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 py-2">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-slate-300 text-church-gold focus:ring-church-gold"
                                            checked={guestForm.firstTime}
                                            onChange={e => setGuestForm({ ...guestForm, firstTime: e.target.checked })}
                                        />
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">First time visiting?</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-slate-300 text-church-gold focus:ring-church-gold"
                                            checked={guestForm.contactOk}
                                            onChange={e => setGuestForm({ ...guestForm, contactOk: e.target.checked })}
                                        />
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Contact me after service</span>
                                    </label>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Prayer Request (Optional)</label>
                                    <textarea
                                        rows={2}
                                        placeholder="How can we pray for you today?"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-church-gold/20 focus:border-church-gold outline-none transition-all resize-none"
                                        value={guestForm.prayerRequest}
                                        onChange={e => setGuestForm({ ...guestForm, prayerRequest: e.target.value })}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={checkinStatus === 'loading'}
                                    className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl shadow-xl shadow-slate-200"
                                >
                                    {checkinStatus === 'loading' ? 'Saving...' : 'Submit Guest Check-In'}
                                </Button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Roster & Stats (Admin Only) */}
                {isAdmin && (
                    <div className="lg:col-span-12 xl:col-span-7 space-y-6">

                        {/* Stats Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                                <h4 className="text-2xl font-black text-slate-900">{roster.length}</h4>
                            </div>
                            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Members</p>
                                <h4 className="text-2xl font-black text-slate-900">{roster.filter(r => r.type === 'member').length}</h4>
                            </div>
                            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Guests</p>
                                <h4 className="text-2xl font-black text-slate-900">{roster.filter(r => r.type === 'guest').length}</h4>
                            </div>
                            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Kids</p>
                                <h4 className="text-2xl font-black text-slate-900">
                                    {roster.reduce((sum, r) => sum + (r.children || 0), 0)}
                                </h4>
                            </div>
                        </div>

                        {/* Roster Table */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[600px]">
                            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or phone..."
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-church-gold outline-none"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                    <select
                                        className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none"
                                        value={rosterFilter}
                                        onChange={e => setRosterFilter(e.target.value as any)}
                                    >
                                        <option value="all">All People</option>
                                        <option value="member">Members Only</option>
                                        <option value="guest">Guests Only</option>
                                        <option value="first">First-Timers</option>
                                    </select>
                                    <button
                                        onClick={exportCSV}
                                        className="p-2 border border-slate-200 rounded-xl hover:bg-white text-slate-500 hover:text-slate-900 transition-colors bg-white shadow-sm"
                                        title="Export CSV"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => window.print()}
                                        className="p-2 border border-slate-200 rounded-xl hover:bg-white text-slate-500 hover:text-slate-900 transition-colors bg-white shadow-sm"
                                        title="Print Roster"
                                    >
                                        <Printer className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-white shadow-sm z-10">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Person</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Type</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Count</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredRoster.length > 0 ? (
                                            filteredRoster.map((row) => (
                                                <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${row.type === 'member' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                                                                }`}>
                                                                {row.display_name?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800">{row.display_name}</p>
                                                                <p className="text-[10px] font-medium text-slate-400">{row.guest_phone || row.member_phone || 'No phone'}</p>
                                                            </div>
                                                            {row.first_time && (
                                                                <span className="bg-rose-100 text-rose-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">First</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter border ${row.type === 'member'
                                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                            }`}>
                                                            {row.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                                            <Users className="w-3 h-3 text-slate-400" />
                                                            {row.adults}A {row.children}C
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-[10px] font-bold text-slate-400">{new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-20 text-center">
                                                    <div className="w-12 h-12 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Search className="w-6 h-6" />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-400">No check-ins found</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] font-bold text-slate-400 flex justify-between items-center">
                                <span>POLLING LIVE UPDATES...</span>
                                <div className="flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></div>
                                    SECURE CONNECTION
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Start Session Modal */}
            <StartCheckInModal
                isOpen={showStartModal}
                onClose={() => setShowStartModal(false)}
                onStart={(session) => {
                    setActiveSession(session);
                    fetchSession();
                }}
            />
        </div>
    );
};
