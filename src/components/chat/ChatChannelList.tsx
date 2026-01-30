import React from 'react';
import { Hash, Lock, Users, Briefcase, Trash2 } from 'lucide-react';

interface Channel {
    id: string;
    name: string;
    type: string;
    last_message?: string;
    last_message_at?: string;
}

interface ChatChannelListProps {
    channels: Channel[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onDelete?: (id: string) => void;
    canDelete?: boolean;
}

export const ChatChannelList: React.FC<ChatChannelListProps> = ({ channels, selectedId, onSelect, onDelete, canDelete = false }) => {

    const getIcon = (type: string) => {
        switch (type) {
            case 'private': return Lock;
            case 'ministry': return Users;
            case 'department': return Briefcase;
            default: return Hash;
        }
    };

    // Grouping
    const general = channels.filter(c => c.type === 'general');
    const departments = channels.filter(c => c.type === 'department');
    const ministries = channels.filter(c => c.type === 'ministry');

    const renderGroup = (title: string, group: Channel[]) => {
        if (group.length === 0) return null;
        return (
            <div className="mb-4">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
                <div className="space-y-0.5">
                    {group.map(channel => {
                        const Icon = getIcon(channel.type);
                        const isSelected = selectedId === channel.id;
                        return (
                            <div key={channel.id} className="group relative flex items-center">
                                <button
                                    onClick={() => onSelect(channel.id)}
                                    className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${isSelected
                                        ? 'bg-church-gold/10 text-church-gold font-medium'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 mr-2 ${isSelected ? 'text-church-gold' : 'text-gray-400'}`} />
                                    <span className="truncate flex-1 text-left">{channel.name}</span>
                                </button>

                                {canDelete && onDelete && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`Are you sure you want to delete ${channel.name}?`)) {
                                                onDelete(channel.id);
                                            }
                                        }}
                                        className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 rounded"
                                        title="Delete Channel"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 overflow-y-auto py-2">
            {renderGroup('General', general)}
            {renderGroup('Departments', departments)}
            {renderGroup('Ministries', ministries)}
        </div>
    );
};
