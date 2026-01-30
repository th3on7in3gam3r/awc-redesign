import React from 'react';

export type Timeframe = 'Today' | 'This Week' | 'This Month';

interface TimeframeToggleProps {
    value: Timeframe;
    onChange: (value: Timeframe) => void;
}

export const TimeframeToggle: React.FC<TimeframeToggleProps> = ({ value, onChange }) => {
    const options: Timeframe[] = ['Today', 'This Week', 'This Month'];

    return (
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
            {options.map((option) => (
                <button
                    key={option}
                    onClick={() => onChange(option)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${value === option
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    {option}
                </button>
            ))}
        </div>
    );
};
