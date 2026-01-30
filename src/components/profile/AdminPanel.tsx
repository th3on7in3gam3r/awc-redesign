import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

interface AdminPanelProps {
    targetUserId: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ targetUserId }) => {
    const { user } = useAuth();
    const [notes, setNotes] = useState<any[]>([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(false);

    // Only Admin/Pastor can see/manage notes
    const canManageNotes = user?.role === 'admin' || user?.role === 'pastor';

    useEffect(() => {
        if (canManageNotes) {
            fetchNotes();
        }
    }, [targetUserId, canManageNotes]);

    const fetchNotes = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/admin/notes/${targetUserId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setNotes(await res.json());
        }
    };

    const addNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        setLoading(true);
        const token = localStorage.getItem('token');
        await fetch(`/api/admin/notes/${targetUserId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ note: newNote })
        });
        setNewNote('');
        fetchNotes();
        setLoading(false);
    };

    return (
        <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-6 md:p-8 text-slate-300">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-church-gold">
                    <i className="fa-solid fa-lock"></i>
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg">Staff / Leadership Console</h3>
                    <p className="text-xs text-slate-500">Authorized Personnel Only</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Tools */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Quick Tools</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <Link to="/staff/members" className="block">
                            <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white border-none justify-start h-auto py-3">
                                <div className="text-left">
                                    <div className="text-sm font-bold">Directory</div>
                                    <div className="text-[10px] text-slate-500">View All Members</div>
                                </div>
                            </Button>
                        </Link>
                        <Link to="/staff/finance" className="block">
                            <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white border-none justify-start h-auto py-3">
                                <div className="text-left">
                                    <div className="text-sm font-bold">Finance</div>
                                    <div className="text-[10px] text-slate-500">Ledgers & Giving</div>
                                </div>
                            </Button>
                        </Link>
                        <Link to="/staff/chat" className="block">
                            <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white border-none justify-start h-auto py-3">
                                <div className="text-left">
                                    <div className="text-sm font-bold">Team Chat</div>
                                    <div className="text-[10px] text-slate-500">Internal Comms</div>
                                </div>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Notes (Conditional) */}
                {canManageNotes ? (
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Pastoral Notes</h4>
                        <div className="bg-slate-950 rounded-xl p-4 h-48 overflow-y-auto mb-4 border border-slate-800 space-y-3">
                            {notes.length === 0 && <p className="text-slate-600 text-sm text-center py-4">No notes recorded.</p>}
                            {notes.map(n => (
                                <div key={n.id} className="text-sm border-b border-slate-800 pb-2 last:border-0">
                                    <p className="text-slate-300 mb-1">{n.note}</p>
                                    <p className="text-[10px] text-slate-600">{new Date(n.created_at).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={addNote} className="flex gap-2">
                            <input
                                value={newNote}
                                onChange={e => setNewNote(e.target.value)}
                                placeholder="Add private note..."
                                className="flex-1 bg-slate-800 border-none rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-slate-600"
                            />
                            <Button type="submit" disabled={loading} size="sm" className="bg-church-gold text-slate-900 border-none">
                                Add
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="flex items-center justify-center border border-slate-800 rounded-xl bg-slate-900/50 p-8">
                        <div className="text-center opacity-50">
                            <i className="fa-solid fa-lock text-3xl mb-3"></i>
                            <p className="text-sm">Administrative notes are restricted to Pastors and Admins.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
