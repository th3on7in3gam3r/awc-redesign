import React, { useState, useEffect } from 'react';
import { Baby, Users, UserCheck, ShieldCheck, Check, Search, Download, Printer, UserX, AlertTriangle, AlertCircle } from 'lucide-react';

type ProgramType = 'daycare' | 'youth' | 'teen';

interface CheckinRecord {
    id: string;
    child_name: string;
    parent_name: string;
    parent_phone: string;
    checked_in_at: string;
    picked_up_at: string | null;
    pickup_code: string | null;
    emergency_contact: string | null;
    emergency_phone: string | null;
    notes: string | null;
    allergies: string | null;
    age: number;
}

interface Session {
    id: string;
    program: string;
    status: 'active' | 'closed';
    opened_at: string;
    closed_at?: string;
    opened_by_name?: string;
}

export const ProgramsRoster: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ProgramType>('daycare');
    const [checkins, setCheckins] = useState<CheckinRecord[]>([]);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pickupCode, setPickupCode] = useState('');
    const [showPickupModal, setShowPickupModal] = useState(false);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        fetchSessionAndRoster();
    }, [activeTab]);

    const fetchSessionAndRoster = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const date = new Date().toISOString().split('T')[0];

            // 1. Get Active Sessions
            const sessionRes = await fetch('/api/programs/active-sessions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (sessionRes.ok) {
                const sessions = await sessionRes.json();
                setSession(sessions[activeTab]);
            }

            // 2. Get Roster
            const rosterRes = await fetch(`/api/staff/programs/roster?program=${activeTab}&date=${date}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (rosterRes.ok) {
                const data = await rosterRes.json();
                setCheckins(data);
            }

        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenSession = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/staff/programs/session/open', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ program: activeTab })
            });

            if (res.ok) {
                await fetchSessionAndRoster();
                alert(`${activeTab.toUpperCase()} check-in session opened!`);
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to open session');
            }
        } catch (err) {
            console.error(err);
            alert('Error starting session');
        }
    };

    const handleCloseSession = async () => {
        if (!confirm('Are you sure you want to CLOSE check-in? Parents will no longer be able to check in.')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/staff/programs/session/close', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ program: activeTab })
            });

            if (res.ok) {
                await fetchSessionAndRoster();
                alert('Session closed.');
            }
        } catch (err) {
            console.error(err);
            alert('Error closing session');
        }
    };

    const handleVerifyPickup = async () => {
        try {
            setVerifying(true);
            const token = localStorage.getItem('token');
            const res = await fetch('/api/staff/programs/pickup', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    program: activeTab,
                    pickup_code: pickupCode
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert(`✅ Pickup Verified: ${data.child_name}`);
                setPickupCode('');
                setShowPickupModal(false);
                fetchSessionAndRoster();
            } else {
                alert(`❌ Error: ${data.message}`);
            }
        } catch (err) {
            console.error(err);
            alert('Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    const filteredCheckins = checkins.filter(c =>
        (c.child_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.parent_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCount = filteredCheckins.filter(c => !c.picked_up_at).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Kids & Youth Roster</h1>
                    <p className="text-slate-600">Manage check-ins, pickup, and classroom safety</p>
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                        <Printer className="w-4 h-4" /> Print
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Program Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { id: 'daycare', label: 'Daycare (0-9)', icon: Baby, color: 'text-pink-600' },
                    { id: 'youth', label: 'Youth (10-15)', icon: Users, color: 'text-indigo-600' },
                    { id: 'teen', label: 'Teen (16-21)', icon: UserCheck, color: 'text-emerald-600' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ProgramType)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap border ${activeTab === tab.id
                            ? 'bg-white border-amber-500 shadow-md text-slate-800 ring-1 ring-amber-500'
                            : 'bg-slate-100 border-transparent text-slate-500 hover:bg-white hover:border-slate-300'
                            }`}
                    >
                        <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? tab.color : 'text-slate-400'}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Session Control Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${session ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    <div>
                        <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">Session Status</span>
                        <p className="text-sm text-slate-600">
                            {session
                                ? `Active • Started at ${new Date(session.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                : 'Closed'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    {!session ? (
                        <button
                            onClick={handleOpenSession}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                        >
                            Open Check-In
                        </button>
                    ) : (
                        <button
                            onClick={handleCloseSession}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-2 rounded-lg font-bold transition-colors border border-red-200"
                        >
                            Close Check-In
                        </button>
                    )}

                    {activeTab === 'daycare' && (
                        <button
                            onClick={() => setShowPickupModal(true)}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Verify Pickup
                        </button>
                    )}
                </div>
            </div>

            {/* Roster Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="font-bold text-slate-700 flex items-center gap-2">
                        Active Roster
                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">{activeCount} Present</span>
                    </h2>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search child or parent..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold border-b">Child</th>
                                <th className="p-4 font-bold border-b">Age</th>
                                <th className="p-4 font-bold border-b">Check-In Time</th>
                                <th className="p-4 font-bold border-b">Parent / Contact</th>
                                <th className="p-4 font-bold border-b">Safety Notes</th>
                                <th className="p-4 font-bold text-right border-b">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCheckins.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        No check-ins found for {activeTab} today.
                                    </td>
                                </tr>
                            ) : (
                                filteredCheckins.map(record => (
                                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-800">{record.child_name}</p>
                                            {record.pickup_code && activeTab === 'daycare' && (
                                                <p className="text-xs text-amber-600 font-mono mt-1">Code: {record.pickup_code}</p>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {record.age} yrs
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {new Date(record.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-medium text-slate-800">{record.parent_name}</p>
                                            <p className="text-xs text-slate-500">{record.parent_phone}</p>
                                            {record.emergency_contact && (
                                                <div className="mt-1 text-xs text-red-600">
                                                    <span className="font-bold">Emergency:</span> {record.emergency_contact}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {record.allergies && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 mb-1">
                                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                                    {record.allergies}
                                                </span>
                                            )}
                                            {record.notes && (
                                                <p className="text-xs text-slate-500 italic mt-1">"{record.notes}"</p>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {record.picked_up_at ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                    Picked Up
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                                                    Present
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pickup Modal */}
            {showPickupModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-slate-800">Verify Pickup Code</h3>
                            <button onClick={() => setShowPickupModal(false)}><UserX className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">Enter the 4-digit code provided by the parent.</p>

                        <input
                            type="text"
                            className="w-full text-center text-3xl font-bold tracking-widest border border-slate-300 rounded-xl py-3 mb-4 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                            placeholder="0000"
                            maxLength={4}
                            value={pickupCode}
                            onChange={(e) => setPickupCode(e.target.value.replace(/\D/g, ''))}
                        />

                        <button
                            disabled={pickupCode.length !== 4 || verifying}
                            onClick={handleVerifyPickup}
                            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
                        >
                            {verifying ? 'Verifying...' : 'Verify & Checkout'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
