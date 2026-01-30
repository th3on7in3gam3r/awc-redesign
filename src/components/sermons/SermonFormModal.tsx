import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

interface SermonFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (sermon: any) => void;
    sermon?: any;
}

export const SermonFormModal: React.FC<SermonFormModalProps> = ({ isOpen, onClose, onSave, sermon }) => {
    const [formData, setFormData] = useState({
        title: sermon?.title || '',
        speaker: sermon?.speaker || '',
        preached_at: sermon?.preached_at || '',
        type: sermon?.type || 'Sunday',
        series: sermon?.series || '',
        scripture: sermon?.scripture || '',
        summary: sermon?.summary || '',
        video_url: sermon?.video_url || '',
        audio_url: sermon?.audio_url || '',
        notes_url: sermon?.notes_url || '',
        is_published: sermon?.is_published ?? true
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {sermon ? 'Edit Sermon' : 'Add Sermon'}
                        </h2>
                        <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-church-gold outline-none"
                                placeholder="Walking in Faith"
                            />
                        </div>

                        {/* Speaker & Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Speaker <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="speaker"
                                    value={formData.speaker}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-church-gold outline-none"
                                    placeholder="Pastor John Smith"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="preached_at"
                                    value={formData.preached_at}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-church-gold outline-none"
                                />
                            </div>
                        </div>

                        {/* Type & Series */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-church-gold outline-none bg-white"
                                >
                                    <option value="Sunday">Sunday</option>
                                    <option value="Bible Study">Bible Study</option>
                                    <option value="Prayer">Prayer</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Series</label>
                                <input
                                    type="text"
                                    name="series"
                                    value={formData.series}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-church-gold outline-none"
                                    placeholder="Faith Series"
                                />
                            </div>
                        </div>

                        {/* Scripture */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Scripture</label>
                            <input
                                type="text"
                                name="scripture"
                                value={formData.scripture}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-church-gold outline-none"
                                placeholder="Hebrews 11:1-6"
                            />
                        </div>

                        {/* Summary */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Summary</label>
                            <textarea
                                name="summary"
                                value={formData.summary}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-church-gold outline-none resize-none"
                                placeholder="Brief description of the sermon..."
                            />
                        </div>

                        {/* URLs */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Video URL</label>
                                <input
                                    type="url"
                                    name="video_url"
                                    value={formData.video_url}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-church-gold outline-none"
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Audio URL</label>
                                <input
                                    type="url"
                                    name="audio_url"
                                    value={formData.audio_url}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-church-gold outline-none"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Notes URL</label>
                                <input
                                    type="url"
                                    name="notes_url"
                                    value={formData.notes_url}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-church-gold outline-none"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        {/* Published Toggle */}
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                            <input
                                type="checkbox"
                                name="is_published"
                                checked={formData.is_published}
                                onChange={handleChange}
                                className="w-4 h-4 text-church-gold focus:ring-church-gold rounded"
                            />
                            <label className="text-sm font-medium text-slate-700">
                                Publish immediately (uncheck to save as draft)
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        <Button type="submit" className="flex-1 bg-church-gold hover:bg-church-burgundy">
                            {sermon ? 'Update Sermon' : 'Add Sermon'}
                        </Button>
                        <Button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200">
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
