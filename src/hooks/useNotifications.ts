import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePolling } from './usePolling';

interface Notification {
    id: string;
    type: string;
    title: string;
    body: string;
    href: string | null;
    is_read: boolean;
    created_at: string;
}

interface NotificationsResponse {
    notifications: Notification[];
    unread_count: number;
    server_time: string;
}

import { isStaffRole } from '../utils/permissions';

export function useNotifications() {
    const { user } = useAuth();
    const isStaff = isStaffRole(user?.role);

    // Staff: 20s, Member: 45s
    const intervalMs = isStaff ? 20000 : 45000;

    const fetchNotifications = useCallback(async (): Promise<NotificationsResponse> => {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/notifications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch notifications');
        }

        return res.json();
    }, []);

    const { data, loading, error, isPolling } = usePolling(fetchNotifications, {
        intervalMs,
        enabled: !!user
    });

    const markAsRead = useCallback(async (ids: string[]) => {
        const token = localStorage.getItem('token');
        await fetch('/api/notifications/read', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ids })
        });
    }, []);

    const markAllAsRead = useCallback(async () => {
        const token = localStorage.getItem('token');
        await fetch('/api/notifications/read-all', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }, []);

    // Type assertion for the data
    const typedData = data as NotificationsResponse | null;

    return {
        notifications: typedData?.notifications ?? [],
        unreadCount: typedData?.unread_count ?? 0,
        serverTime: typedData?.server_time,
        loading,
        error,
        isPolling,
        markAsRead,
        markAllAsRead
    };
}
