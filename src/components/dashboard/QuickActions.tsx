import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, LayoutGrid, CheckSquare, FileAudio, MessageCircle, Play } from 'lucide-react';

interface QuickActionProps {
    label: string;
    icon: any;
    onClick: () => void;
    color: string;
}

const QuickActionButton: React.FC<QuickActionProps> = ({ label, icon: Icon, onClick, color }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all group min-w-fit"
    >
        <div className={`p-1.5 rounded-lg ${color} text-white`}>
            <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{label}</span>
    </button>
);

interface QuickActionsProps {
    onStartCheckIn?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onStartCheckIn }) => {
    const navigate = useNavigate();

    const actions = [
        {
            label: 'Start Check-In',
            icon: Play,
            color: 'bg-indigo-600',
            onClick: () => {
                console.log('Start Check-In');
                if (onStartCheckIn) {
                    onStartCheckIn();
                } else {
                    navigate('/dashboard/checkin');
                }
            }
        },
        {
            label: 'View Check-In List',
            icon: CheckSquare,
            color: 'bg-indigo-400',
            onClick: () => navigate('/dashboard/checkin')
        },
        {
            label: 'Add Guest',
            icon: UserPlus,
            color: 'bg-emerald-500',
            onClick: () => navigate('/dashboard/members')
        },
        {
            label: 'Post Sermon',
            icon: FileAudio,
            color: 'bg-amber-600',
            onClick: () => navigate('/dashboard/sermons')
        },
        {
            label: 'Send Follow-Up',
            icon: MessageCircle,
            color: 'bg-rose-500',
            onClick: () => navigate('/dashboard/members')
        },
    ];

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1 scrollbar-hide">
            {actions.map((action) => (
                <QuickActionButton
                    key={action.label}
                    label={action.label}
                    icon={action.icon}
                    color={action.color}
                    onClick={action.onClick}
                />
            ))}
        </div>
    );
};
