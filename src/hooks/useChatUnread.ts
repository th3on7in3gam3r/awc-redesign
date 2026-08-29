import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePolling } from './usePolling';

interface ChatThread {
    id: string;
    name: string;
    unread_count: number;
}

interface ChatThreadsResponse {
    threads: ChatThread[];
    total_unread: number;
    server_time: string;
}

import { isStaffRole } from '../utils/permissions';

export function useChatUnread() {
    const { user } = useAuth();
    const isStaff = isStaffRole(user?.role);

    const fetchChatThreads = useCallback(async (): Promise<ChatThreadsResponse> => {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/staff/chat/threads?includeUnread=1', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch chat threads');
        }

        return res.json();
    }, []);

    const { data, loading, error, isPolling } = usePolling(fetchChatThreads, {
        intervalMs: 15000, // 15s for staff
        enabled: !!user && isStaff
    });

    const markChannelRead = useCallback(async (channelId: string) => {
        const token = localStorage.getItem('token');
        await fetch(`/api/staff/chat/channels/${channelId}/read`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }, []);

    // Type assertion for the data
    const typedData = data as ChatThreadsResponse | null;

    return {
        threads: typedData?.threads ?? [],
        totalUnread: typedData?.total_unread ?? 0,
        serverTime: typedData?.server_time,
        loading,
        error,
        isPolling,
        markChannelRead
    };
}
