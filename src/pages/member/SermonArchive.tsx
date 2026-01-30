import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, BookOpen, Video, Headphones, FileText, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { SermonHeroCard } from '../../components/sermons/SermonHeroCard';
import { SermonCard } from '../../components/sermons/SermonCard';
import { SermonFormModal } from '../../components/sermons/SermonFormModal';

interface Sermon {
    id: string;
    title: string;
    speaker: string;
    preached_at: string;
    type: string;
    series?: string;
    scripture?: string;
    summary?: string;
    key_points?: string[];
    small_group_questions?: string[];
    video_url?: string;
    audio_url?: string;
    notes_url?: string;
    is_published: boolean;
}

export const SermonArchive: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin' || user?.role === 'pastor';

    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [seriesFilter, setSeriesFilter] = useState('all');
    const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
    const [deletingSermonId, setDeletingSermonId] = useState<string | null>(null);

    useEffect(() => {
        fetchSermons();
    }, [searchTerm, typeFilter, seriesFilter]);

    const fetchSermons = async () => {
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (typeFilter !== 'all') params.append('type', typeFilter);
            if (seriesFilter !== 'all') params.append('series', seriesFilter);

            const token = localStorage.getItem('token');
            const res = await fetch(`/api/sermons?${params}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            if (res.ok) {
                const data = await res.json();
                setSermons(data);
            }
        } catch (err) {
            console.error('Error fetching sermons:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditSermon = async (sermonData: any) => {
        if (!editingSermon) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/sermons/${editingSermon.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(sermonData)
            });

            if (res.ok) {
                setEditingSermon(null);
                fetchSermons();
            } else {
                alert('Failed to update sermon');
            }
        } catch (err) {
            console.error('Error updating sermon:', err);
            alert('Error updating sermon');
        }
    };

    const handleDeleteSermon = async (sermonId: string) => {
        if (!confirm('Are you sure you want to delete this sermon? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/sermons/${sermonId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setSelectedSermon(null);
                fetchSermons();
            } else {
                alert('Failed to delete sermon');
            }
        } catch (err) {
            console.error('Error deleting sermon:', err);
            alert('Error deleting sermon');
        }
    };

    const latestSermon = sermons.find(s => s.is_published);
    const archiveSermons = sermons.filter(s => s.id !== latestSermon?.id);

    // Get unique series for filter
    const seriesList = ['all', ...new Set(sermons.map(s => s.series).filter(Boolean))];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-church-gold rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Sermon Archive</h1>
                    <p className="text-slate-500 text-sm mt-1">Watch, listen, and grow in faith</p>
                </div>
                {isAdmin && (
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="bg-church-gold hover:bg-church-burgundy"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Sermon
                    </Button>
                )}
            </div>

            {/* Hero Section - Latest Sermon */}
            {latestSermon && (
                <div>
                    <SermonHeroCard sermon={latestSermon} />
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search sermons..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-church-gold outline-none"
                        />
                    </div>

                    {/* Type Filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-church-gold outline-none bg-white"
                    >
                        <option value="all">All Types</option>
                        <option value="Sunday">Sunday</option>
                        <option value="Bible Study">Bible Study</option>
                        <option value="Prayer">Prayer</option>
                    </select>

                    {/* Series Filter */}
                    <select
                        value={seriesFilter}
                        onChange={(e) => setSeriesFilter(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-church-gold outline-none bg-white"
                    >
                        {seriesList.map(series => (
                            <option key={series} value={series}>
                                {series === 'all' ? 'All Series' : series}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Archive Grid */}
            {archiveSermons.length > 0 ? (
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Archive</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {archiveSermons.map(sermon => (
                            <SermonCard
                                key={sermon.id}
                                sermon={sermon}
                                onClick={() => setSelectedSermon(sermon)}
                            />
                        ))}
                    </div>
                </div>
            ) : sermons.length === 0 ? (
                /* Empty State */
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-400 mb-2">No Sermons Yet</h3>
                    <p className="text-sm text-slate-300 mb-6">Start building your sermon archive</p>
                    {isAdmin && (
                        <Button
                            onClick={() => setShowAddModal(true)}
                            className="bg-church-gold hover:bg-church-burgundy"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Sermon
                        </Button>
                    )}
                </div>
            ) : null}

            {/* Sermon Details Modal */}
            {selectedSermon && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSermon(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-8">
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedSermon(null)}
                                className="float-right p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Admin Controls */}
                            {isAdmin && (
                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={() => {
                                            setEditingSermon(selectedSermon);
                                            setSelectedSermon(null);
                                        }}
                                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSermon(selectedSermon.id)}
                                        className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-sm font-medium hover:bg-rose-100 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}

                            {/* Title */}
                            <h2 className="text-3xl font-bold text-slate-900 mb-4 pr-12">{selectedSermon.title}</h2>

                            {/* Meta */}
                            <div className="flex flex-wrap gap-4 mb-6 text-sm text-slate-600">
                                <span>{selectedSermon.speaker}</span>
                                <span>•</span>
                                <span>{new Date(selectedSermon.preached_at).toLocaleDateString()}</span>
                                {selectedSermon.scripture && (
                                    <>
                                        <span>•</span>
                                        <span>{selectedSermon.scripture}</span>
                                    </>
                                )}
                            </div>

                            {/* Summary */}
                            {selectedSermon.summary && (
                                <p className="text-slate-700 mb-6 leading-relaxed">{selectedSermon.summary}</p>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 mb-8">
                                {selectedSermon.video_url && (
                                    <button
                                        onClick={() => window.open(selectedSermon.video_url, '_blank')}
                                        className="flex items-center gap-2 px-4 py-2 bg-church-gold text-white rounded-xl font-bold hover:bg-church-burgundy transition-colors"
                                    >
                                        <Video className="w-4 h-4" />
                                        Watch
                                    </button>
                                )}
                                {selectedSermon.audio_url && (
                                    <button
                                        onClick={() => window.open(selectedSermon.audio_url, '_blank')}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                    >
                                        <Headphones className="w-4 h-4" />
                                        Listen
                                    </button>
                                )}
                                {selectedSermon.notes_url && (
                                    <button
                                        onClick={() => window.open(selectedSermon.notes_url, '_blank')}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                    >
                                        <FileText className="w-4 h-4" />
                                        Notes
                                    </button>
                                )}
                            </div>

                            {/* Key Points */}
                            {selectedSermon.key_points && selectedSermon.key_points.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-3">Key Points</h3>
                                    <ul className="space-y-2">
                                        {selectedSermon.key_points.map((point, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-slate-700">
                                                <span className="text-church-gold mt-1">•</span>
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Small Group Questions */}
                            {selectedSermon.small_group_questions && selectedSermon.small_group_questions.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-3">Small Group Questions</h3>
                                    <ol className="space-y-2">
                                        {selectedSermon.small_group_questions.map((question, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-slate-700">
                                                <span className="text-church-gold font-bold">{idx + 1}.</span>
                                                <span>{question}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Sermon Modal */}
            <SermonFormModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={async (sermonData) => {
                    try {
                        const token = localStorage.getItem('token');
                        const res = await fetch('/api/sermons', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(sermonData)
                        });

                        if (res.ok) {
                            setShowAddModal(false);
                            fetchSermons(); // Refresh list
                        } else {
                            alert('Failed to create sermon');
                        }
                    } catch (err) {
                        console.error('Error creating sermon:', err);
                        alert('Error creating sermon');
                    }
                }}
            />

            {/* Edit Sermon Modal */}
            <SermonFormModal
                isOpen={!!editingSermon}
                sermon={editingSermon || undefined}
                onClose={() => setEditingSermon(null)}
                onSave={handleEditSermon}
            />
        </div>
    );
};
