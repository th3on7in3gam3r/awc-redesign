import React from 'react';

export type ActivityType = 'All' | 'People' | 'Attendance' | 'Ministries' | 'Events' | 'Prayer';

interface ActivityFiltersProps {
    activeFilter: ActivityType;
    onFilterChange: (filter: ActivityType) => void;
}

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({ activeFilter, onFilterChange }) => {
    const filters: ActivityType[] = ['All', 'People', 'Attendance', 'Ministries', 'Events', 'Prayer'];

    return (
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
            {filters.map((filter) => (
                <button
                    key={filter}
                    onClick={() => onFilterChange(filter)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeFilter === filter
                            ? 'bg-slate-900 text-white shadow-md shadow-slate-200'
                            : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700'
                        }`}
                >
                    {filter}
                </button>
            ))}
        </div>
    );
};
