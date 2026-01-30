import React, { useRef } from 'react';
// Profile Header Component
import { User } from '../../types';
import { Camera } from 'lucide-react';

interface ProfileHeaderProps {
    user: User | null;
    onAvatarUpdate?: (base64: string) => void;
    completionPercentage?: number;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onAvatarUpdate, completionPercentage = 0 }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!user) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image must be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                if (onAvatarUpdate) {
                    onAvatarUpdate(base64);
                }
            };
            reader.readAsDataURL(file);
        }
    };


    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Unknown';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const formatLastLogin = (dateString?: string) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

    // Get initials
    const initials = user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-church-gold/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                {/* Avatar */}
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-full bg-church-burgundy text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg overflow-hidden relative">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span>{initials}</span>
                        )}
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                    />
                </div>

                {/* User Info */}
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                            }`}>
                            {user.role}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-100 text-green-700">
                            Active Member
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm text-gray-500 mb-6">
                        <div className="flex items-center gap-2">
                            <i className="fa-regular fa-calendar"></i>
                            Member since: <span className="text-gray-900 font-medium">{formatDate(user.joinedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="fa-regular fa-clock"></i>
                            Last login: <span className="text-gray-900 font-medium">{formatLastLogin(user.lastLogin)}</span>
                        </div>
                    </div>

                    {/* Completion Bar */}
                    <div className="max-w-md">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                            <span>Profile Completion</span>
                            <span className="text-church-gold">{completionPercentage}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-church-gold rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${completionPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
