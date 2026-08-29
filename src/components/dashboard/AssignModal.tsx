import React, { useState } from 'react';
import { X, User, Calendar, Flag } from 'lucide-react';

interface AssignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (assignee: string, dueDate: string, priority: 'High' | 'Normal') => void;
    taskText: string;
}

export const AssignModal: React.FC<AssignModalProps> = ({ isOpen, onClose, onAssign, taskText }) => {
    const [assignee, setAssignee] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState<'High' | 'Normal'>('Normal');

    if (!isOpen) return null;

    const teamMembers = ['Pastor Mike', 'Sarah (Worship)', 'Alex (Youth)', 'Admin Team'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAssign(assignee || 'Unassigned', dueDate || 'Sun', priority);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 animate-scale-in">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Assign Task</h3>
                        <p className="text-sm text-slate-500 mt-1">{taskText}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <User className="w-3.5 h-3.5" />
                            Assign To
                        </label>
                        <select
                            value={assignee}
                            onChange={(e) => setAssignee(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Select team member...</option>
                            {teamMembers.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            Due Date
                        </label>
                        <select
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="Today">Today</option>
                            <option value="Tomorrow">Tomorrow</option>
                            <option value="Sun">This Sunday</option>
                            <option value="Next Week">Next Week</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Flag className="w-3.5 h-3.5" />
                            Priority
                        </label>
                        <div className="flex gap-3">
                            {(['Normal', 'High'] as const).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPriority(p)}
                                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${priority === p
                                            ? (p === 'High' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-indigo-500 text-white shadow-lg shadow-indigo-200')
                                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                        >
                            Confirm Assignment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
