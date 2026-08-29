import { useState, useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
    intervalMs: number;
    enabled?: boolean;
    onError?: (error: Error) => void;
}

interface UsePollingResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    isPolling: boolean;
}

export function usePolling<T>(
    queryFn: () => Promise<T>,
    options: UsePollingOptions
): UsePollingResult<T> {
    const { intervalMs, enabled = true, onError } = options;

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [currentInterval, setCurrentInterval] = useState(intervalMs);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const errorCountRef = useRef(0);

    // Execute query function
    const executeQuery = useCallback(async () => {
        try {
            setLoading(true);
            const result = await queryFn();
            setData(result);
            setError(null);

            // Reset error count and interval on success
            errorCountRef.current = 0;
            setCurrentInterval(intervalMs);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);

            // Increment error count and apply backoff
            errorCountRef.current += 1;
            const backoffInterval = Math.min(
                intervalMs * Math.pow(2, errorCountRef.current - 1),
                60000 // Max 60s
            );
            setCurrentInterval(backoffInterval);

            onError?.(error);
        } finally {
            setLoading(false);
        }
    }, [queryFn, intervalMs, onError]);

    // Check if polling should be active
    const shouldPoll = useCallback(() => {
        if (!enabled) return false;
        if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return false;
        if (typeof navigator !== 'undefined' && !navigator.onLine) return false;
        return true;
    }, [enabled]);

    // Start/stop polling based on conditions
    useEffect(() => {
        const startPolling = () => {
            if (!shouldPoll()) {
                setIsPolling(false);
                return;
            }

            setIsPolling(true);

            // Execute immediately
            executeQuery();

            // Set up interval
            intervalRef.current = setInterval(() => {
                if (shouldPoll()) {
                    executeQuery();
                }
            }, currentInterval);
        };

        const stopPolling = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setIsPolling(false);
        };

        // Handle visibility change
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                startPolling();
            } else {
                stopPolling();
            }
        };

        // Handle online/offline
        const handleOnline = () => startPolling();
        const handleOffline = () => stopPolling();

        // Initial start
        if (enabled) {
            startPolling();
        }

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup
        return () => {
            stopPolling();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [enabled, currentInterval, executeQuery, shouldPoll]);

    return { data, loading, error, isPolling };
}
