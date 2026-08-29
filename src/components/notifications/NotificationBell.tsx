import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { LiveIndicator } from '../ui/LiveIndicator';

interface Notification {
    id: string;
    type: string;
    title: string;
    body: string;
    href: string | null;
    is_read: boolean;
    created_at: string;
}

export const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const {
        notifications,
        unreadCount,
        isPolling,
        error,
        markAsRead,
        markAllAsRead
    } = useNotifications();
    const [loading, setLoading] = useState(false);

    const handleNotificationClick = async (notification: any) => {
        if (!notification.is_read) {
            await markAsRead([notification.id]);
        }

        if (notification.href) {
            window.location.href = notification.href;
        }

        setIsOpen(false);
    };

    const handleMarkAllAsRead = async () => {
        setLoading(true);
        try {
            await markAllAsRead();
        } catch (err) {
            console.error('Error marking all as read:', err);
        } finally {
            setLoading(false);
        }
    };

    const getNotificationIcon = (type: string) => {
        // Return emoji based on notification type
        switch (type) {
            case 'CHAT_MESSAGE': return '💬';
            case 'CHAT_MENTION': return '💬';
            case 'CHAT_DM': return '✉️';
            case 'EVENT_APPROVED': return '✅';
            case 'EVENT_DECLINED': return '❌';
            case 'MINISTRY_REQUEST': return '🙏';
            case 'CONSENT_UPDATED': return '📸';
            case 'CHECKIN_OPENED': return '🚪';
            case 'SYSTEM': return '🔔';
            default: return '📬';
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <LiveIndicator isLive={isPolling} hasError={!!error} />

            {/* Bell Icon */}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Dropdown */}
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Notifications Panel */}
                        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        disabled={loading}
                                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            {/* Notifications List */}
                            <div className="overflow-y-auto flex-1">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500">
                                        <Bell className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                                        <p>No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map(notification => (
                                        <button
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`w-full p-4 text-left border-b border-slate-100 hover:bg-slate-50 transition-colors ${!notification.is_read ? 'bg-indigo-50/50' : ''
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-slate-900 text-sm truncate">
                                                            {notification.title}
                                                        </p>
                                                        {!notification.is_read && (
                                                            <span className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0" />
                                                        )}
                                                    </div>
                                                    {notification.body && (
                                                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                                            {notification.body}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {formatTime(notification.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
