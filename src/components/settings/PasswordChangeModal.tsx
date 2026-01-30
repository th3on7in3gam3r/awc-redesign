import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Eye, EyeOff, Lock, Check, X, Loader2 } from 'lucide-react';

interface PasswordChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const getPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        return strength;
    };

    const strength = getPasswordStrength(formData.newPassword);
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

    const validateForm = () => {
        if (!formData.currentPassword) {
            setError('Current password is required');
            return false;
        }
        if (formData.newPassword.length < 8) {
            setError('New password must be at least 8 characters');
            return false;
        }
        if (!/[A-Z]/.test(formData.newPassword)) {
            setError('Password must contain at least one uppercase letter');
            return false;
        }
        if (!/[a-z]/.test(formData.newPassword)) {
            setError('Password must contain at least one lowercase letter');
            return false;
        }
        if (!/[0-9]/.test(formData.newPassword)) {
            setError('Password must contain at least one number');
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/me/password', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setSuccess(false);
                }, 2000);
            } else {
                setError(data.message || 'Failed to change password');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <Lock className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                            <Check className="w-5 h-5" />
                            <span className="font-medium">Password changed successfully!</span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                            <X className="w-5 h-5" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {formData.newPassword && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-1 flex-1 rounded-full ${level <= strength ? strengthColors[strength - 1] : 'bg-gray-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        Strength: <span className="font-medium">{strengthLabels[strength - 1] || 'Very Weak'}</span>
                                    </p>
                                </div>
                            )}

                            {/* Requirements */}
                            <div className="mt-2 space-y-1">
                                <div className={`text-xs flex items-center gap-1 ${formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                                    {formData.newPassword.length >= 8 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                    At least 8 characters
                                </div>
                                <div className={`text-xs flex items-center gap-1 ${/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                                    {/[A-Z]/.test(formData.newPassword) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                    One uppercase letter
                                </div>
                                <div className={`text-xs flex items-center gap-1 ${/[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                                    {/[a-z]/.test(formData.newPassword) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                    One lowercase letter
                                </div>
                                <div className={`text-xs flex items-center gap-1 ${/[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                                    {/[0-9]/.test(formData.newPassword) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                    One number
                                </div>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {formData.confirmPassword && (
                                <p className={`text-xs mt-1 ${formData.newPassword === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                                    {formData.newPassword === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                </p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                onClick={onClose}
                                variant="outline"
                                className="flex-1"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Changing...
                                    </>
                                ) : (
                                    'Change Password'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};
