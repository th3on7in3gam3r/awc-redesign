import React, { useState, useEffect } from 'react';
import { Shield, Lock, Monitor, Clock, MapPin, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { PasswordChangeModal } from './PasswordChangeModal';

interface Session {
    id: string;
    device_info: any;
    ip_address: string;
    location: string;
    last_active_at: string;
    is_current: boolean;
}

interface LoginHistoryItem {
    id: string;
    success: boolean;
    ip_address: string;
    location: string;
    user_agent: string;
    created_at: string;
}

export const SecuritySettings: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [revoking, setRevoking] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [sessionsRes, historyRes] = await Promise.all([
                fetch('/api/me/sessions', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch('/api/me/login-history?limit=10', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (sessionsRes.ok) {
                const sessionsData = await sessionsRes.json();
                setSessions(sessionsData);
            }

            if (historyRes.ok) {
                const historyData = await historyRes.json();
                setLoginHistory(historyData);
            }
        } catch (err) {
            console.error('Error fetching security data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeSession = async (sessionId: string) => {
        if (!confirm('Are you sure you want to revoke this session?')) return;

        setRevoking(sessionId);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/me/sessions/${sessionId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setSessions(sessions.filter(s => s.id !== sessionId));
            }
        } catch (err) {
            console.error('Error revoking session:', err);
        } finally {
            setRevoking(null);
        }
    };

    const handleRevokeAllOthers = async () => {
        if (!confirm('This will sign you out of all other devices. Continue?')) return;

        setRevoking('all');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/me/sessions/others', {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                alert(`Revoked ${data.revokedCount} session(s)`);
                fetchData();
            }
        } catch (err) {
            console.error('Error revoking sessions:', err);
        } finally {
            setRevoking(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
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

    const getDeviceIcon = (deviceInfo: any) => {
        const userAgent = deviceInfo?.userAgent || '';
        if (/mobile/i.test(userAgent)) return '📱';
        if (/tablet/i.test(userAgent)) return '📱';
        return '💻';
    };

    if (loading) {
        return <div className="p-8">Loading security settings...</div>;
    }

    return (
        <>
            <PasswordChangeModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />

            <div className="space-y-6">
                {/* Change Password */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <Lock className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Password</h3>
                                <p className="text-sm text-gray-500">Change your account password</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowPasswordModal(true)}
                            variant="outline"
                            className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                        >
                            Change Password
                        </Button>
                    </div>
                </div>

                {/* Active Sessions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <Monitor className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Active Sessions</h3>
                                <p className="text-sm text-gray-500">{sessions.length} active session(s)</p>
                            </div>
                        </div>
                        {sessions.length > 1 && (
                            <Button
                                onClick={handleRevokeAllOthers}
                                variant="outline"
                                className="border-red-600 text-red-600 hover:bg-red-50"
                                disabled={revoking === 'all'}
                            >
                                Revoke All Others
                            </Button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className={`p-4 rounded-lg border ${session.is_current ? 'border-green-200 bg-green-50' : 'border-gray-200'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{getDeviceIcon(session.device_info)}</span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-gray-900">
                                                    {session.device_info?.browser || 'Unknown Browser'}
                                                </p>
                                                {session.is_current && (
                                                    <span className="text-xs px-2 py-0.5 bg-green-600 text-white rounded-full">
                                                        Current
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600 space-y-1 mt-1">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    <span>{session.ip_address}</span>
                                                    {session.location && <span>• {session.location}</span>}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>Last active {formatDate(session.last_active_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {!session.is_current && (
                                        <button
                                            onClick={() => handleRevokeSession(session.id)}
                                            disabled={revoking === session.id}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Login History */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Login History</h3>
                            <p className="text-sm text-gray-500">Recent login attempts</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {loginHistory.map((item) => (
                            <div
                                key={item.id}
                                className={`p-3 rounded-lg border ${item.success ? 'border-gray-200' : 'border-red-200 bg-red-50'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-2">
                                        {item.success ? (
                                            <Shield className="w-4 h-4 text-green-600 mt-0.5" />
                                        ) : (
                                            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                                        )}
                                        <div>
                                            <p className={`text-sm font-medium ${item.success ? 'text-gray-900' : 'text-red-900'}`}>
                                                {item.success ? 'Successful login' : 'Failed login attempt'}
                                            </p>
                                            <div className="text-xs text-gray-600 mt-1">
                                                <span>{item.ip_address}</span>
                                                {item.location && <span> • {item.location}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {formatDate(item.created_at)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};
