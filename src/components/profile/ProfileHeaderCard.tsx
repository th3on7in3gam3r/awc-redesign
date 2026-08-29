import React from 'react';
import { Button } from '../ui/Button';

interface ProfileHeaderCardProps {
    user: any;
    completionPercentage: number;
    onEdit: () => void;
    onAvatarUpdate?: (base64: string) => void;
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({ user, completionPercentage, onEdit, onAvatarUpdate }) => {
    if (!user) return null;

    const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-church-gold/10 to-transparent rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none group-hover:from-church-gold/20 transition-all duration-700"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                {/* Avatar */}
                <div className="relative shrink-0 group cursor-pointer" onClick={() => onAvatarUpdate && document.getElementById('avatar-upload')?.click()}>
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400 border-4 border-white shadow-lg overflow-hidden relative">
                        {user.avatar ? (
                            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span>{initials}</span>
                        )}

                        {/* Upload Overlay */}
                        {onAvatarUpdate && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <i className="fa-solid fa-camera text-white text-2xl"></i>
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-sm" title="Active">
                        <i className="fa-solid fa-check text-white text-[10px]"></i>
                    </div>

                    <input
                        id="avatar-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && onAvatarUpdate) {
                                if (file.size > 5 * 1024 * 1024) {
                                    alert('Image must be less than 5MB');
                                    return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    onAvatarUpdate(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 justify-center md:justify-start">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{user.firstName} {user.lastName}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {user.role}
                        </span>
                    </div>

                    <p className="text-slate-500 text-sm">
                        <i className="fa-regular fa-calendar md:mr-2"></i> Member since {new Date(user.created_at).getFullYear()}
                    </p>

                    {/* Completion Meter */}
                    <div className="mt-4 max-w-sm mx-auto md:mx-0">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Profile Completion</span>
                            <span className="text-xs font-bold text-church-gold">{completionPercentage}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-church-gold rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${completionPercentage}%` }}
                            ></div>
                        </div>
                        {completionPercentage < 100 && (
                            <p className="text-[10px] text-slate-400 mt-1">Add missing details to unlock full access.</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 min-w-[140px]">
                    <Button onClick={onEdit} className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm">
                        Edit Profile
                    </Button>
                    <Button variant="ghost" className="w-full text-slate-400 hover:text-slate-600 text-xs">
                        Change Password
                    </Button>
                </div>
            </div>
        </div>
    );
};
