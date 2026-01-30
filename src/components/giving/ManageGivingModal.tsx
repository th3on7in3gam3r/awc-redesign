import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, GripVertical, Save, AlertCircle } from 'lucide-react';

interface GivingOption {
    id: string;
    title: string;
    category: string;
    url: string | null;
    handle: string | null;
    subtitle: string | null;
    provider: string;
    is_primary: boolean;
    is_active: boolean;
    sort_order: number;
}

interface GivingContent {
    why_we_give?: string;
    giving_help?: string;
}

interface ManageGivingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export const ManageGivingModal: React.FC<ManageGivingModalProps> = ({ isOpen, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'options' | 'content'>('options');
    const [givingOptions, setGivingOptions] = useState<GivingOption[]>([]);
    const [content, setContent] = useState<GivingContent>({});
    const [editingOption, setEditingOption] = useState<GivingOption | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        url: '',
        handle: '',
        subtitle: '',
        provider: 'vanco',
        is_primary: false,
        is_active: true,
        sort_order: 0
    });

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [optionsRes, contentRes] = await Promise.all([
                fetch('/api/admin/giving/options', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/giving/content', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const optionsData = await optionsRes.json();
            const contentData = await contentRes.json();

            setGivingOptions(optionsData.sort((a: GivingOption, b: GivingOption) => a.sort_order - b.sort_order));
            setContent(contentData);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load giving data');
        }
    };

    const handleAddNew = () => {
        setIsAddingNew(true);
        setEditingOption(null);
        setFormData({
            title: '',
            category: '',
            url: '',
            handle: '',
            subtitle: '',
            provider: 'vanco',
            is_primary: false,
            is_active: true,
            sort_order: givingOptions.length + 1
        });
    };

    const handleEdit = (option: GivingOption) => {
        setEditingOption(option);
        setIsAddingNew(false);
        setFormData({
            title: option.title,
            category: option.category,
            url: option.url || '',
            handle: option.handle || '',
            subtitle: option.subtitle || '',
            provider: option.provider,
            is_primary: option.is_primary,
            is_active: option.is_active,
            sort_order: option.sort_order
        });
    };

    const handleSaveOption = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const url = editingOption
                ? `/api/admin/giving/options/${editingOption.id}`
                : '/api/admin/giving/options';

            const method = editingOption ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    url: formData.url || null,
                    handle: formData.handle || null,
                    subtitle: formData.subtitle || null
                })
            });

            if (!res.ok) {
                throw new Error('Failed to save option');
            }

            // If setting as primary, call the dedicated endpoint
            if (formData.is_primary) {
                const savedOption = await res.json();
                await fetch(`/api/admin/giving/options/${savedOption.id}/primary`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }

            await fetchData();
            setIsAddingNew(false);
            setEditingOption(null);
            onUpdate();
        } catch (err) {
            setError('Failed to save giving option');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this giving option?')) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/giving/options/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to delete');

            await fetchData();
            onUpdate();
        } catch (err) {
            setError('Failed to delete giving option');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (option: GivingOption) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/admin/giving/options/${option.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ is_active: !option.is_active })
            });

            await fetchData();
            onUpdate();
        } catch (err) {
            setError('Failed to toggle status');
        }
    };

    const handleReorder = async (optionId: string, newOrder: number) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/admin/giving/options/${optionId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ sort_order: newOrder })
            });

            await fetchData();
            onUpdate();
        } catch (err) {
            setError('Failed to reorder options');
        }
    };

    const handleUpdateContent = async (key: string, value: string) => {
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/giving/content', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ key, value })
            });

            await fetchData();
            onUpdate();
        } catch (err) {
            setError('Failed to update content');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Manage Giving</h2>
                        <p className="text-sm text-slate-500 mt-1">Configure giving options and content</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 px-6">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('options')}
                            className={`px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === 'options'
                                ? 'border-church-gold text-church-gold'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Giving Options
                        </button>
                        <button
                            onClick={() => setActiveTab('content')}
                            className={`px-4 py-3 font-medium border-b-2 transition-colors ${activeTab === 'content'
                                ? 'border-church-gold text-church-gold'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Content Blocks
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-900">Error</p>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'options' ? (
                        <div className="space-y-6">
                            {/* Add New Button */}
                            {!isAddingNew && !editingOption && (
                                <button
                                    onClick={handleAddNew}
                                    className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-church-gold hover:bg-church-gold/5 transition-colors flex items-center justify-center gap-2 text-slate-600 hover:text-church-gold"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add New Giving Option
                                </button>
                            )}

                            {/* Add/Edit Form */}
                            {(isAddingNew || editingOption) && (
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                                    <h3 className="font-bold text-slate-900 mb-4">
                                        {editingOption ? 'Edit Giving Option' : 'Add New Giving Option'}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Title *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-church-gold focus:border-transparent"
                                                placeholder="e.g., Tithes & Offering"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Category *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-church-gold focus:border-transparent"
                                                placeholder="e.g., General Fund"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                URL (leave empty for "Coming Soon")
                                            </label>
                                            <input
                                                type="url"
                                                value={formData.url}
                                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-church-gold focus:border-transparent"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Provider *
                                            </label>
                                            <select
                                                value={formData.provider}
                                                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-church-gold focus:border-transparent"
                                            >
                                                <option value="vanco">Vanco</option>
                                                <option value="cashapp">Cash App</option>
                                                <option value="stripe">Stripe</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Cash App Handle (for Cash App provider)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.handle}
                                                onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-church-gold focus:border-transparent"
                                                placeholder="$YourCashAppHandle"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Subtitle (optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.subtitle}
                                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-church-gold focus:border-transparent"
                                                placeholder="e.g., Support our church ministry"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Sort Order
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.sort_order}
                                                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-church-gold focus:border-transparent"
                                            />
                                        </div>
                                        <div className="md:col-span-2 flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_primary}
                                                    onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                                                    className="w-4 h-4 text-church-gold rounded focus:ring-church-gold"
                                                />
                                                <span className="text-sm font-medium text-slate-700">Set as Primary</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_active}
                                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                    className="w-4 h-4 text-church-gold rounded focus:ring-church-gold"
                                                />
                                                <span className="text-sm font-medium text-slate-700">Active</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={handleSaveOption}
                                            disabled={loading || !formData.title || !formData.category}
                                            className="flex items-center gap-2 px-4 py-2 bg-church-gold text-white rounded-xl font-bold hover:bg-church-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Save className="w-4 h-4" />
                                            {loading ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsAddingNew(false);
                                                setEditingOption(null);
                                            }}
                                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Options List */}
                            <div className="space-y-3">
                                {givingOptions.map((option, index) => (
                                    <div
                                        key={option.id}
                                        className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-4"
                                    >
                                        <button
                                            className="cursor-move text-slate-400 hover:text-slate-600"
                                            title="Drag to reorder"
                                        >
                                            <GripVertical className="w-5 h-5" />
                                        </button>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-slate-900">{option.title}</h4>
                                                {option.is_primary && (
                                                    <span className="px-2 py-0.5 bg-church-gold text-white text-xs font-bold rounded-full">
                                                        PRIMARY
                                                    </span>
                                                )}
                                                {!option.is_active && (
                                                    <span className="px-2 py-0.5 bg-slate-300 text-slate-600 text-xs font-bold rounded-full">
                                                        INACTIVE
                                                    </span>
                                                )}
                                            </div>
                                            {option.subtitle && (
                                                <p className="text-sm text-slate-600 mb-1">{option.subtitle}</p>
                                            )}
                                            <p className="text-sm text-slate-500">{option.category} • {option.provider}</p>
                                            {option.url && (
                                                <p className="text-xs text-slate-400 mt-1 truncate">{option.url}</p>
                                            )}
                                            {option.handle && (
                                                <p className="text-xs text-slate-400 mt-1">Handle: {option.handle}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleActive(option)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${option.is_active
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {option.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(option)}
                                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4 text-slate-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(option.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Why We Give */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Why We Give
                                </label>
                                <textarea
                                    value={content.why_we_give || ''}
                                    onChange={(e) => setContent({ ...content, why_we_give: e.target.value })}
                                    rows={6}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-church-gold focus:border-transparent resize-none"
                                    placeholder="Enter the 'Why We Give' message..."
                                />
                                <button
                                    onClick={() => handleUpdateContent('why_we_give', content.why_we_give || '')}
                                    className="mt-2 flex items-center gap-2 px-4 py-2 bg-church-gold text-white rounded-xl font-bold hover:bg-church-gold/90 transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    Save
                                </button>
                            </div>

                            {/* Giving Help */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Need Help? Contact Info
                                </label>
                                <textarea
                                    value={content.giving_help || ''}
                                    onChange={(e) => setContent({ ...content, giving_help: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-church-gold focus:border-transparent resize-none"
                                    placeholder="Enter help contact information..."
                                />
                                <button
                                    onClick={() => handleUpdateContent('giving_help', content.giving_help || '')}
                                    className="mt-2 flex items-center gap-2 px-4 py-2 bg-church-gold text-white rounded-xl font-bold hover:bg-church-gold/90 transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    Save
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
