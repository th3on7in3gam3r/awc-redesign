
import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { EngagementSection } from '../../components/profile/EngagementSection';
import { MediaConsentCard } from '../../components/profile/MediaConsentCard';
import { MediaConsentModal } from '../../components/profile/MediaConsentModal';
import { UsernameSettings } from '../../components/profile/UsernameSettings';

export const UserProfile = () => {
    const { user: contextUser } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        bio: '',
        avatar: undefined,
        joinedAt: undefined,
        lastLogin: undefined
    });

    // Explicitly type this if possible, or use any for now to avoid build errors
    const [engagementData, setEngagementData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showConsentModal, setShowConsentModal] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setFormData({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    bio: data.bio || '',
                    avatar: data.avatar,
                    joinedAt: data.created_at,
                    lastLogin: data.last_login
                });
                setEngagementData(data.engagement);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarUpdate = (base64: string) => {
        setFormData((prev: any) => ({ ...prev, avatar: base64 }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            } else {
                setMessage({ type: 'error', text: 'Failed to update profile.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred.' });
        }
    };

    if (loading) return <div>Loading...</div>;

    const displayUser = contextUser ? {
        ...contextUser,
        name: `${formData.firstName} ${formData.lastName}`.trim() || contextUser.name,
        email: formData.email || contextUser.email,
        avatar: formData.avatar,
        joinedAt: formData.joinedAt || contextUser.joinedAt,
        lastLogin: formData.lastLogin || contextUser.lastLogin
    } : null;

    // Calculate Completion
    const fieldsToCheck = [
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'avatar', label: 'Profile Photo' },
        { key: 'phone', label: 'Phone Number' },
        { key: 'address', label: 'Address' },
        { key: 'bio', label: 'Bio' }
    ];
    // @ts-ignore
    const missingFields = fieldsToCheck.filter(f => !formData[f.key] || formData[f.key].length === 0);

    // Add Engagement Checks to Calculation (Optional but High Value)
    let extraPoints = 0;
    const engagementChecks = [];
    if (engagementData) {
        if (engagementData.ministries && engagementData.ministries.length > 0) extraPoints += 1;
        else engagementChecks.push('Join a Ministry');

        if (engagementData.prayer && engagementData.prayer.active_count > 0) extraPoints += 1;
        // Don't penalty for no prayer requests, but maybe bonus? keeping simple for now.
    }

    const totalPointsPossible = fieldsToCheck.length; // + 2 for engagement if strict
    const completedCount = (fieldsToCheck.length - missingFields.length);
    const completionPercentage = Math.round((completedCount / totalPointsPossible) * 100);

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <ProfileHeader
                user={displayUser}
                onAvatarUpdate={handleAvatarUpdate}
                completionPercentage={completionPercentage}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: Edit Profile Form */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Completion Nudge */}
                    {completionPercentage < 100 && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 animate-fade-in relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="p-3 bg-white text-blue-600 rounded-full shrink-0 shadow-sm">
                                    <i className="fa-solid fa-list-check"></i>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-blue-900 mb-1">Finish your profile!</h3>
                                    <p className="text-blue-700 mb-4 text-sm">
                                        You are {completionPercentage}% there. Complete your profile to stay fully connected.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {missingFields.map(f => (
                                            <span key={f.key} className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">
                                                <i className="fa-solid fa-plus text-[10px]"></i> {f.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <i className="fa-solid fa-user-pen text-church-gold text-xl"></i>
                            <h2 className="text-xl font-bold text-slate-800">Edit Details</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-church-gold/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-church-gold/50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-church-gold/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="(555) 123-4567"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-church-gold/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Home Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="123 Faith St, Heaven City, GC"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-church-gold/50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Bio / About Me</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Tell us a little about your journey..."
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-church-gold/50 resize-y"
                                />
                            </div>

                            {message.text && (
                                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <Button type="submit" className="bg-church-gold hover:bg-church-burgundy text-white px-8 py-3 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Church Engagement Section (Now Full Width on Mobile, Left Col on Desktop) */}
                    <EngagementSection data={engagementData} />
                </div>


                {/* RIGHT COLUMN: Actions & Tools */}
                <div className="space-y-8">

                    {/* Quick Actions Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <div className="w-1 h-6 bg-church-gold rounded-full"></div>
                            Quick Actions
                        </h3>
                        <div className="space-y-3">
                            <Button className="w-full justify-start bg-white hover:bg-slate-50 text-slate-600 border border-slate-200" variant="outline" onClick={() => alert('Password Change: Mock Function')}>
                                <i className="fa-solid fa-key w-6 text-center text-slate-400"></i>
                                Change Password
                            </Button>
                            <Button className="w-full justify-start bg-white hover:bg-slate-50 text-slate-600 border border-slate-200" variant="outline" onClick={() => alert('Sermon Notes: Coming Soon')}>
                                <i className="fa-solid fa-book-open w-6 text-center text-slate-400"></i>
                                My Sermon Notes
                            </Button>
                            <Button className="w-full justify-start bg-white hover:bg-slate-50 text-slate-600 border border-slate-200" variant="outline" onClick={() => alert('Preferences: Mock Function')}>
                                <i className="fa-solid fa-envelope w-6 text-center text-slate-400"></i>
                                Preferences
                            </Button>
                            <Button className="w-full justify-start bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 mt-4" variant="ghost" onClick={() => {
                                // Simple logout mock or need to import logout function
                                localStorage.removeItem('token');
                                window.location.reload();
                            }}>
                                <i className="fa-solid fa-right-from-bracket w-6 text-center"></i>
                                Sign Out
                            </Button>
                        </div>
                    </div>

                    {/* Media Consent Card */}
                    <MediaConsentCard onUpdate={() => setShowConsentModal(true)} />

                    {/* Username Settings */}
                    <UsernameSettings />

                    {/* Admin Panel (Role Based) */}
                    {contextUser?.role === 'admin' && (
                        <div className="bg-slate-800 text-white rounded-xl shadow-lg border border-slate-700 p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-church-gold/20 rounded-full -mr-10 -mt-10 blur-xl group-hover:bg-church-gold/30 transition-all"></div>

                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                                <i className="fa-solid fa-user-shield text-church-gold"></i>
                                Admin Console
                            </h3>
                            <p className="text-slate-400 text-xs mb-6 relative z-10">Restricted access for Leadership only.</p>

                            <div className="space-y-3 relative z-10">
                                <a href="/dashboard/members" className="block w-full">
                                    <Button className="w-full justify-between bg-slate-700 hover:bg-slate-600 text-white border-none">
                                        <span className="flex items-center gap-2">
                                            <i className="fa-solid fa-address-book text-slate-400"></i>
                                            Member Directory
                                        </span>
                                        <i className="fa-solid fa-chevron-right text-xs opacity-50"></i>
                                    </Button>
                                </a>
                                <a href="/dashboard/events" className="block w-full">
                                    <Button className="w-full justify-between bg-slate-700 hover:bg-slate-600 text-white border-none">
                                        <span className="flex items-center gap-2">
                                            <i className="fa-solid fa-chart-line text-slate-400"></i>
                                            Attendance Analytics
                                        </span>
                                        <i className="fa-solid fa-chevron-right text-xs opacity-50"></i>
                                    </Button>
                                </a>
                                <Button className="w-full justify-between bg-slate-700 hover:bg-slate-600 text-white border-none" onClick={() => alert('Report Export: Mock Function')}>
                                    <span className="flex items-center gap-2">
                                        <i className="fa-solid fa-file-export text-slate-400"></i>
                                        Export Reports
                                    </span>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Media Consent Modal */}
            <MediaConsentModal
                isOpen={showConsentModal}
                onClose={() => setShowConsentModal(false)}
                onSave={() => {
                    setShowConsentModal(false);
                    setMessage({ type: 'success', text: 'Consent preferences saved successfully!' });
                    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                }}
            />
        </div>
    );
};
