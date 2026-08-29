import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProfileHeaderCard } from '../components/profile/ProfileHeaderCard';
import { EngagementCards } from '../components/profile/EngagementCards';
import { HouseholdCard } from '../components/profile/HouseholdCard';
import { SettingsCard } from '../components/profile/SettingsCard';
import { AdminPanel } from '../components/profile/AdminPanel';
import { isStaffRole } from '../utils/permissions';

export const ProfileHub: React.FC = () => {
    const { user: authUser, logout } = useAuth(); // Local state fallback
    const [profile, setProfile] = useState<any>(null);
    const [engagement, setEngagement] = useState<any>(null);
    const [householdData, setHouseholdData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchAllData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // 1. Get Profile
            const profileRes = await fetch('/api/me', { headers });

            if (profileRes.status === 401) {
                logout();
                window.location.href = '/login';
                return;
            }

            if (!profileRes.ok) {
                const errorText = await profileRes.text();
                throw new Error(`Profile fetch failed: ${profileRes.status} ${errorText}`);
            }

            const profileData = await profileRes.json();
            setProfile(profileData);

            // 2. Get Engagement (Attendance, Ministries, Prayers) & Household
            const [attRes, minRes, prayRes, hhRes] = await Promise.all([
                fetch('/api/me/attendance-summary', { headers }),
                fetch('/api/me/ministries', { headers }),
                fetch('/api/me/prayers', { headers }),
                fetch('/api/me/household', { headers })
            ]);

            setEngagement({
                attendance: attRes.ok ? await attRes.json() : { lastCheckIn: null, stats: { last30Days: 0, last90Days: 0 } },
                ministries: minRes.ok ? await minRes.json() : [],
                prayer: prayRes.ok ? await prayRes.json() : { requests: [], summary: { activeCount: 0, lastRequest: null } }
            });

            if (hhRes.ok) {
                setHouseholdData(await hhRes.json());
            }

        } catch (error) {
            console.error('Error loading hub:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleUpdateProfile = async (data: any) => {
        const token = localStorage.getItem('token');
        await fetch('/api/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        await fetchAllData(); // Refresh to see changes
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-church-gold rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) return <div>Error loading profile.</div>;

    // Calculate Completion
    const fields = ['first_name', 'last_name', 'phone', 'preferred_contact', 'avatar', 'bio'];
    const filled = fields.filter(f => profile[f] && profile[f].length > 0).length;
    // Bonus for engagement
    let engagementPoints = 0;
    if (engagement.ministries.length > 0) engagementPoints++;
    if (engagement.attendance.lastCheckIn) engagementPoints++;

    const totalPoints = fields.length + 2;
    const currentPoints = filled + engagementPoints;
    const completionPercentage = Math.round((currentPoints / totalPoints) * 100);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest text-xs mb-1">My Dashboard</h2>
                    <h1 className="text-3xl font-bold text-church-burgundy">My Church Hub</h1>
                </div>
            </div>

            {/* Profile Header Card */}
            <ProfileHeaderCard
                user={{
                    ...profile,
                    firstName: profile.first_name,
                    lastName: profile.last_name,
                    created_at: profile.joined_date || profile.created_at
                }}
                completionPercentage={completionPercentage}
                onEdit={() => {
                    document.getElementById('settings-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                onAvatarUpdate={(base64) => handleUpdateProfile({ avatar: base64 })}
            />

            {/* Household Management */}
            <HouseholdCard
                data={householdData}
                onRefresh={fetchAllData}
            />

            {/* Engagement Cards */}
            {engagement && (
                <EngagementCards data={engagement} onRefresh={fetchAllData} />
            )}

            {/* Staff Console Access */}
            {isStaffRole(profile.role) && (
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-church-burgundy to-slate-900 rounded-xl p-6 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-church-gold flex items-center justify-center text-church-burgundy text-xl font-bold shadow-lg">
                                    <i className="fa-solid fa-shield-halved"></i>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-church-gold">Staff Console Access</h3>
                                    <p className="text-white/80 text-sm">Manage {profile.role === 'finance' ? 'Finance & Ledger' : 'your department'} and View Reports</p>
                                </div>
                            </div>
                            <Link
                                to="/staff/dashboard"
                                className="bg-church-gold text-church-burgundy hover:bg-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
                            >
                                Enter Console <i className="fa-solid fa-arrow-right"></i>
                            </Link>
                        </div>
                    </div>

                    {/* Admin Panel (also visible to staff for now, contains tools) */}
                    <AdminPanel targetUserId={profile.id} />
                </div>
            )}

            {!isStaffRole(profile.role) && (profile.role === 'admin' || profile.role === 'pastor') && (
                <AdminPanel targetUserId={profile.id} />
            )}

            {/* Settings / Edit */}
            <div id="settings-section">
                <SettingsCard
                    user={{
                        ...profile,
                        firstName: profile.first_name,
                        lastName: profile.last_name
                    }}
                    onUpdate={handleUpdateProfile}
                />
            </div>
        </div>
    );
};
