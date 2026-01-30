import React from 'react';

interface LiveIndicatorProps {
    isLive: boolean;
    hasError?: boolean;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({ isLive, hasError }) => {
    const getStatus = () => {
        if (hasError) return { color: 'bg-red-500', label: 'Error' };
        if (isLive) return { color: 'bg-green-500', label: 'Live' };
        return { color: 'bg-slate-300', label: 'Paused' };
    };

    const status = getStatus();

    return (
        <div className="flex items-center gap-1.5" title={status.label}>
            <div className={`w-2 h-2 rounded-full ${status.color} ${isLive ? 'animate-pulse' : ''}`} />
            <span className="text-xs text-slate-500 hidden md:inline">{status.label}</span>
        </div>
    );
};
