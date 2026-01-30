import React, { useEffect, useRef } from 'react';
import { User, FileText, Download } from 'lucide-react';

interface Message {
    id: string;
    message_text: string;
    sender_person_id: string;
    first_name: string;
    last_name: string;
    avatar?: string;
    created_at: string;
    attachment_url?: string;
    attachment_type?: string;
}

interface ChatMessageListProps {
    messages: Message[];
    currentUserId: string;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages, currentUserId }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll to bottom when messages change
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <p>No messages yet. Start the conversation!</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => {
                const isMe = msg.sender_person_id === currentUserId;
                const showHeader = index === 0 || messages[index - 1].sender_person_id !== msg.sender_person_id || (new Date(msg.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000); // 5 min gap

                return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {showHeader && (
                            <div className={`flex items-baseline space-x-2 mb-1 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                <span className="text-sm font-semibold text-gray-900">{isMe ? 'You' : `${msg.first_name} ${msg.last_name}`}</span>
                                <span className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        )}
                        <div className={`px-4 py-2 rounded-2xl max-w-lg break-words shadow-sm ${isMe
                            ? 'bg-amber-600 text-white rounded-br-none'
                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                            }`}>

                            {/* Attachment Rendering */}
                            {msg.attachment_url && (
                                <div className="mb-2">
                                    {msg.attachment_type?.startsWith('image/') ? (
                                        <div className="rounded-lg overflow-hidden my-1">
                                            <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={msg.attachment_url}
                                                    alt="attachment"
                                                    className="max-w-full max-h-60 object-cover hover:opacity-90 transition-opacity"
                                                />
                                            </a>
                                            <a
                                                href={msg.attachment_url}
                                                download
                                                className={`flex items-center gap-1 justify-center mt-1 px-2 py-1 rounded text-xs transition-colors ${isMe ? 'bg-amber-700/50 hover:bg-amber-700' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                    }`}
                                            >
                                                <Download className="w-3 h-3" />
                                                Download Image
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <a
                                                href={msg.attachment_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${isMe ? 'bg-amber-700/50 hover:bg-amber-700' : 'bg-gray-100 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <div className="p-1 bg-white/20 rounded">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="text-sm flex-1">
                                                    <p className="font-medium">Attachment</p>
                                                    <p className="text-xs opacity-80">Click to view</p>
                                                </div>
                                            </a>
                                            <a
                                                href={msg.attachment_url}
                                                download
                                                className={`flex items-center gap-1 justify-center px-2 py-1 rounded text-xs transition-colors ${isMe ? 'bg-amber-700/50 hover:bg-amber-700' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                    }`}
                                            >
                                                <Download className="w-3 h-3" />
                                                Download File
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}

                            {msg.message_text && <p>{msg.message_text}</p>}
                        </div>
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
};
