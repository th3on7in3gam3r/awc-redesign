import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Check, X, Loader2 } from 'lucide-react';

export const UsernameSettings: React.FC = () => {
    const { user } = useAuth();
    const [username, setUsername] = useState(user?.username || '');
    const [checking, setChecking] = useState(false);
    const [available, setAvailable] = useState<boolean | null>(null);
    const [suggestedUsername, setSuggestedUsername] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Fetch suggested username if none set
        if (!user?.username) {
            fetchSuggestedUsername();
        }
    }, [user]);

    const fetchSuggestedUsername = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.suggested_username) {
                setSuggestedUsername(data.suggested_username);
            }
        } catch (err) {
            console.error('Error fetching suggested username:', err);
        }
    };

    const checkAvailability = async (value: string) => {
        if (value.length < 3) {
            setAvailable(null);
            return;
        }

        setChecking(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/username/check/${value}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setAvailable(data.available);
            if (!data.available && data.reason) {
                setError(data.reason);
            }
        } catch (err) {
            console.error('Error checking availability:', err);
        } finally {
            setChecking(false);
        }
    };

    const handleUsernameChange = (value: string) => {
        // Only allow lowercase, numbers, underscore
        const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setUsername(cleaned);
        setSuccess(false);

        if (cleaned.length >= 3) {
            checkAvailability(cleaned);
        } else {
            setAvailable(null);
        }
    };

    const handleSave = async () => {
        if (!available) return;

        setSaving(true);
        setError('');
        setSuccess(false);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/me/username', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ username })
            });

            if (res.ok) {
                setSuccess(true);
                // Update user context if needed
                window.location.reload();
            } else {
                const errorData = await res.json();
                setError(errorData.message || 'Failed to update username');
            }
        } catch (err) {
            console.error('Error saving username:', err);
            setError('Failed to update username');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Username</h3>
            <p className="text-sm text-gray-500 mb-4">
                Used for chat mentions like <span className="text-indigo-600 font-mono">@username</span>
            </p>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Username
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono">
                            @
                        </span>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => handleUsernameChange(e.target.value)}
                            className="w-full pl-8 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                            placeholder="username"
                            maxLength={20}
                            disabled={saving}
                        />
                        {checking && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-gray-400" />
                        )}
                        {!checking && available === true && (
                            <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                        )}
                        {!checking && available === false && (
                            <X className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
                        )}
                    </div>

                    <div className="mt-2 min-h-[20px]">
                        {checking && (
                            <p className="text-sm text-gray-500">Checking availability...</p>
                        )}
                        {!checking && available === true && (
                            <p className="text-sm text-green-600">✓ Available</p>
                        )}
                        {!checking && available === false && error && (
                            <p className="text-sm text-red-600">✗ {error}</p>
                        )}
                        {username.length > 0 && username.length < 3 && (
                            <p className="text-sm text-gray-500">Minimum 3 characters</p>
                        )}
                        {success && (
                            <p className="text-sm text-green-600">✓ Username updated successfully!</p>
                        )}
                    </div>
                </div>

                {suggestedUsername && !user?.username && (
                    <button
                        onClick={() => handleUsernameChange(suggestedUsername)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                        Use suggested: <span className="font-mono">@{suggestedUsername}</span>
                    </button>
                )}

                <Button
                    onClick={handleSave}
                    disabled={!available || saving}
                    className="w-full"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save Username'
                    )}
                </Button>

                <p className="text-xs text-gray-500">
                    3-20 characters • lowercase letters, numbers, and underscores only
                </p>
            </div>
        </div>
    );
};
