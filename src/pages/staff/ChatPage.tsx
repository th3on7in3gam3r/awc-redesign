import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChatChannelList } from '../../components/chat/ChatChannelList';
import { ChatMessageList } from '../../components/chat/ChatMessageList';
import { ChatComposer } from '../../components/chat/ChatComposer';
import { CreateChannelModal } from '../../components/chat/CreateChannelModal';
import { ManageChannelMembersModal } from '../../components/chat/ManageChannelMembersModal';
import { Hash, Search, PlusCircle, Users } from 'lucide-react';

export const ChatPage = () => {
    const { user, token } = useAuth();
    const [channels, setChannels] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

    // Polling refs
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch channels on mount
    useEffect(() => {
        if (token) fetchChannels();
    }, [token]);

    // Fetch messages when channel selected
    useEffect(() => {
        if (selectedChannelId && token) {
            fetchMessages(selectedChannelId);
            startPolling(selectedChannelId);
        } else {
            stopPolling();
            setMessages([]);
        }
        return () => stopPolling();
    }, [selectedChannelId, token]);

    const fetchChannels = async () => {
        try {
            const res = await fetch('/api/staff/chat/channels', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setChannels(data);
                // Auto select first channel if none selected
                if (data.length > 0 && !selectedChannelId) {
                    setSelectedChannelId(data[0].id);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (channelId: string) => {
        setLoadingMessages(true);
        try {
            const res = await fetch(`/api/staff/chat/channels/${channelId}/messages?limit=50`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setMessages(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMessages(false);
        }
    };

    const startPolling = (channelId: string) => {
        stopPolling();
        pollIntervalRef.current = setInterval(async () => {
            try {
                const res = await fetch(`/api/staff/chat/channels/${channelId}/messages?limit=50`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const newMessages = await res.json();
                    setMessages(newMessages);
                }
            } catch (err) {
                console.error('Poll failed', err);
            }
        }, 3000); // 3 seconds
    };

    const stopPolling = () => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    };

    const handleSendMessage = async (text: string, file?: { url: string; type: string }) => {
        if (!selectedChannelId) return;

        // Optimistic update
        const tempId = 'temp-' + Date.now();
        const optimisticMsg = {
            id: tempId,
            message_text: text,
            sender_person_id: user?.id,
            first_name: user?.name?.split(' ')[0] || 'Me',
            last_name: user?.name?.split(' ')[1] || '',
            created_at: new Date().toISOString(),
            attachment_url: file?.url,
            attachment_type: file?.type
        };

        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const res = await fetch(`/api/staff/chat/channels/${selectedChannelId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: text,
                    attachmentUrl: file?.url,
                    attachmentType: file?.type
                })
            });

            if (res.ok) {
                const sentMsg = await res.json();
                // Replace optimistic message
                setMessages(prev => prev.map(m => m.id === tempId ? sentMsg : m));
            } else {
                // Remove optimistic message on error
                setMessages(prev => prev.filter(m => m.id !== tempId));
                alert('Failed to send message');
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => prev.filter(m => m.id !== tempId));
            alert('Failed to send message');
        }
    };

    const handleCreateChannel = async (data: { name: string; type: string; description: string; initialMembers: string[] }) => {
        try {
            const res = await fetch('http://localhost:5001/api/staff/chat/channels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                const newChannel = await res.json();
                setChannels(prev => [...prev, newChannel]); // Optimistic-ish, or just append
                setSelectedChannelId(newChannel.id);
                fetchChannels(); // Refresh to get proper order/sort
            } else {
                throw new Error('Failed to create');
            }
        } catch (err) {
            console.error(err);
            throw err; // Modal handles error state
        }
    };

    const handleDeleteChannel = async (id: string) => {
        try {
            const res = await fetch(`/api/staff/chat/channels/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setChannels(prev => prev.filter(c => c.id !== id));
                if (selectedChannelId === id) {
                    setSelectedChannelId(null);
                    setMessages([]);
                }
            } else {
                alert('Failed to delete channel');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting channel');
        }
    };

    const selectedChannel = channels.find(c => c.id === selectedChannelId);
    const isAdminOrPastor = ['admin', 'pastor'].includes(user?.role || '');

    return (
        <div className="flex h-[calc(100vh-theme(spacing.24))] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Hash className="w-5 h-5 text-church-gold" />
                        Team Chat
                    </h2>
                </div>
                <div className="p-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find channel..."
                            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-church-gold focus:border-church-gold"
                        />
                    </div>
                </div>

                <ChatChannelList
                    channels={channels}
                    selectedId={selectedChannelId}
                    onSelect={setSelectedChannelId}
                    onDelete={handleDeleteChannel}
                    canDelete={isAdminOrPastor}
                />

                {isAdminOrPastor && (
                    <div className="p-3 border-t border-gray-200">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center justify-center w-full py-2 text-sm font-medium text-church-burgundy bg-church-gold/10 hover:bg-church-gold/20 rounded-lg transition-colors"
                        >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            New Channel
                        </button>
                    </div>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50">
                {selectedChannel ? (
                    <>
                        <div className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-10 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                    <Hash className="w-5 h-5 text-gray-400 mr-2" />
                                    {selectedChannel.name}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {selectedChannel.type === 'general' ? 'Visible to all staff' : `${selectedChannel.type} channel`}
                                </p>
                            </div>
                            {isAdminOrPastor && (
                                <button
                                    onClick={() => setIsMembersModalOpen(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <Users className="w-4 h-4" />
                                    Manage Members
                                </button>
                            )}
                        </div>

                        <ChatMessageList
                            messages={messages}
                            currentUserId={user?.id || ''}
                        />

                        <ChatComposer onSend={handleSendMessage} />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <Hash className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>Select a channel to start chatting</p>
                        </div>
                    </div>
                )}
            </div>

            <CreateChannelModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateChannel}
            />

            {selectedChannelId && selectedChannel && (
                <ManageChannelMembersModal
                    isOpen={isMembersModalOpen}
                    onClose={() => setIsMembersModalOpen(false)}
                    channelId={selectedChannelId}
                    channelName={selectedChannel.name}
                />
            )}
        </div>
    );
};

export default ChatPage;
