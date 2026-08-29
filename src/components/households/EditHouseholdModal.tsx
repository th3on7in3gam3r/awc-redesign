import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface EditHouseholdModalProps {
    isOpen: boolean;
    onClose: () => void;
    household: {
        id: string;
        household_name: string;
        address_line1: string;
        address_line2: string;
        city: string;
        state: string;
        zip: string;
    };
    onSave: (data: any) => Promise<void>;
}

export const EditHouseholdModal: React.FC<EditHouseholdModalProps> = ({
    isOpen,
    onClose,
    household,
    onSave
}) => {
    const [formData, setFormData] = useState({
        household_name: household.household_name,
        address_line1: household.address_line1 || '',
        address_line2: household.address_line2 || '',
        city: household.city || '',
        state: household.state || '',
        zip: household.zip || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.household_name.trim()) {
            setError('Household name is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            setError('Failed to update household');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Edit Household</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Household Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Household Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.household_name}
                            onChange={(e) => setFormData({ ...formData, household_name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., Smith Family"
                            required
                        />
                    </div>

                    {/* Address Line 1 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address Line 1
                        </label>
                        <input
                            type="text"
                            value={formData.address_line1}
                            onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Street address"
                        />
                    </div>

                    {/* Address Line 2 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address Line 2
                        </label>
                        <input
                            type="text"
                            value={formData.address_line2}
                            onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Apt, suite, etc. (optional)"
                        />
                    </div>

                    {/* City, State, ZIP */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                City
                            </label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="City"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                State
                            </label>
                            <input
                                type="text"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="State"
                                maxLength={2}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ZIP Code
                            </label>
                            <input
                                type="text"
                                value={formData.zip}
                                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="ZIP"
                                maxLength={10}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
