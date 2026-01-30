import React, { useState, useEffect } from 'react';
import { CheckSquare, MessageCircle, Clock, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { AssignModal } from './AssignModal';

interface Task {
    id: string;
    text: string;
    completed: boolean;
    priority: 'High' | 'Normal';
    dueDate: string;
    assignee: string;
}

export const ActionCenter: React.FC = () => {
    // Persistent checklist state
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState('');
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [taskToAssign, setTaskToAssign] = useState<{ id: string, text: string } | null>(null);

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('dashboard_tasks');
        if (saved) {
            setTasks(JSON.parse(saved));
        } else {
            setTasks([
                { id: '1', text: 'Prepare Sunday Announcements', completed: false, priority: 'High', dueDate: 'Today', assignee: 'Pastor Mike' },
                { id: '2', text: 'Review new Volunteer applications', completed: false, priority: 'Normal', dueDate: 'Sun', assignee: 'Sarah (Worship)' },
            ]);
        }
    }, []);

    // Save on change
    useEffect(() => {
        localStorage.setItem('dashboard_tasks', JSON.stringify(tasks));
    }, [tasks]);

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        setTasks([...tasks, {
            id: Date.now().toString(),
            text: newTask,
            completed: false,
            priority: 'Normal',
            dueDate: 'Today',
            assignee: 'Unassigned'
        }]);
        setNewTask('');
    };

    const openAssignModal = (task: { id: string, text: string }) => {
        setTaskToAssign(task);
        setIsAssignModalOpen(true);
    };

    const handleAssign = (assignee: string, dueDate: string, priority: 'High' | 'Normal') => {
        if (!taskToAssign) return;
        setTasks(tasks.map(t =>
            t.id === taskToAssign.id
                ? { ...t, assignee, dueDate, priority }
                : t
        ));
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                        <CheckSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Action Center</h3>
                        <p className="text-xs text-slate-500">Tasks & pending items</p>
                    </div>
                </div>
                <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                    {tasks.filter(t => !t.completed).length} Pending
                </span>
            </div>

            <div className="p-5 space-y-6">
                {/* Pending Requests Section (Mocked for Demo visually, but could be real API) */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Review Needed</h4>

                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full shadow-sm text-indigo-600">
                                <UsersIcon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-indigo-900">New Guest Follow-up</p>
                                <p className="text-xs text-indigo-600">3 guests from Sunday</p>
                            </div>
                        </div>
                        <button className="text-xs bg-white text-indigo-700 px-3 py-1.5 rounded-lg font-semibold shadow-sm hover:bg-indigo-50">
                            Assign
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full shadow-sm text-amber-600">
                                <MessageCircle className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-amber-900">Ministry Requests</p>
                                <p className="text-xs text-amber-600">2 pending review</p>
                            </div>
                        </div>
                        <button className="text-xs bg-white text-amber-700 px-3 py-1.5 rounded-lg font-semibold shadow-sm hover:bg-amber-50">
                            View
                        </button>
                    </div>
                </div>

                {/* Checklist Section */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">My Checklist</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {tasks.map(task => (
                            <div key={task.id} className="group border border-slate-50 hover:border-slate-100 hover:bg-slate-50/50 p-3 rounded-xl transition-all">
                                <div className="flex items-start gap-3">
                                    <button
                                        onClick={() => toggleTask(task.id)}
                                        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-transparent hover:border-emerald-400'
                                            }`}
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <span className={`text-sm font-medium block ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                            {task.text}
                                        </span>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${task.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {task.priority}
                                            </span>
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Due: {task.dueDate}
                                            </span>
                                            <span className="text-[10px] text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded">
                                                @{task.assignee}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openAssignModal(task)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                            title="Assign"
                                        >
                                            <UserIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={addTask} className="mt-4 flex gap-2">
                        <input
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Add item..."
                            className="flex-1 text-sm border-none bg-slate-50 focus:ring-2 focus:ring-indigo-200 rounded-lg px-3 py-2"
                        />
                        <button type="submit" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600">
                            <Save className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>

            <AssignModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                onAssign={handleAssign}
                taskText={taskToAssign?.text || ''}
            />
        </div>
    );
};

// Icons for internal use
const UserIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

// Simple icon for internal use
const UsersIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);
