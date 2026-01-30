import React, { useState, useEffect, useRef } from 'react';
import { AtSign } from 'lucide-react';

interface MentionUser {
    username: string;
    first_name: string;
    last_name: string;
    role: string;
}

interface MentionAutocompleteProps {
    query: string;
    onSelect: (username: string) => void;
    onClose: () => void;
}

export const MentionAutocomplete: React.FC<MentionAutocompleteProps> = ({
    query,
    onSelect,
    onClose
}) => {
    const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.length < 1) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/staff/chat/mentions?q=${encodeURIComponent(query)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setSuggestions(data);
                setSelectedIndex(0);
            } catch (err) {
                console.error('Error fetching mentions:', err);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchSuggestions, 200);
        return () => clearTimeout(debounce);
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (suggestions.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % suggestions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                if (suggestions[selectedIndex]) {
                    onSelect(suggestions[selectedIndex].username);
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [suggestions, selectedIndex, onSelect, onClose]);

    if (suggestions.length === 0 && !loading) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50 min-w-[300px]"
        >
            {loading ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                    Loading...
                </div>
            ) : (
                <>
                    {suggestions.map((user, index) => (
                        <button
                            key={user.username}
                            onClick={() => onSelect(user.username)}
                            className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${index === selectedIndex
                                    ? 'bg-indigo-50 border-l-2 border-indigo-600'
                                    : 'hover:bg-gray-50'
                                }`}
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <AtSign className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-medium text-gray-900">
                                        @{user.username}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize">
                                        {user.role}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                    {user.first_name} {user.last_name}
                                </p>
                            </div>
                        </button>
                    ))}
                </>
            )}
        </div>
    );
};
