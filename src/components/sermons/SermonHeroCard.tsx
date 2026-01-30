import React from 'react';
import { Video, Headphones, FileText, Calendar, User, BookOpen } from 'lucide-react';

interface SermonHeroCardProps {
    sermon: {
        id: string;
        title: string;
        speaker: string;
        preached_at: string;
        scripture?: string;
        summary?: string;
        video_url?: string;
        audio_url?: string;
        notes_url?: string;
    };
}

export const SermonHeroCard: React.FC<SermonHeroCardProps> = ({ sermon }) => {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const handleAction = (url?: string, type?: string) => {
        if (url) {
            window.open(url, '_blank');
        }
    };

    return (
        <div className="bg-gradient-to-br from-church-burgundy to-black rounded-3xl shadow-xl border border-church-gold/20 overflow-hidden">
            <div className="p-8 lg:p-12">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-church-gold/20 rounded-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-church-gold" />
                    </div>
                    <p className="text-xs font-bold text-church-gold uppercase tracking-widest">This Week's Message</p>
                </div>

                {/* Title */}
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">{sermon.title}</h2>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 text-white/80">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">{sermon.speaker}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">{formatDate(sermon.preached_at)}</span>
                    </div>
                    {sermon.scripture && (
                        <div className="flex items-center gap-2 text-white/80">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-sm font-medium">{sermon.scripture}</span>
                        </div>
                    )}
                </div>

                {/* Summary */}
                {sermon.summary && (
                    <p className="text-lg text-white/90 mb-8 max-w-3xl leading-relaxed">
                        {sermon.summary}
                    </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => handleAction(sermon.video_url, 'video')}
                        disabled={!sermon.video_url}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${sermon.video_url
                                ? 'bg-church-gold text-church-burgundy hover:bg-church-gold/90 shadow-lg hover:shadow-xl'
                                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            }`}
                        title={!sermon.video_url ? 'Video not uploaded yet' : 'Watch sermon'}
                    >
                        <Video className="w-5 h-5" />
                        Watch
                    </button>

                    <button
                        onClick={() => handleAction(sermon.audio_url, 'audio')}
                        disabled={!sermon.audio_url}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${sermon.audio_url
                                ? 'bg-white text-church-burgundy hover:bg-white/90 shadow-lg hover:shadow-xl'
                                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            }`}
                        title={!sermon.audio_url ? 'Audio not uploaded yet' : 'Listen to sermon'}
                    >
                        <Headphones className="w-5 h-5" />
                        Listen
                    </button>

                    <button
                        onClick={() => handleAction(sermon.notes_url, 'notes')}
                        disabled={!sermon.notes_url}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${sermon.notes_url
                                ? 'bg-white/10 text-white border-2 border-white/20 hover:bg-white/20'
                                : 'bg-slate-700 text-slate-400 cursor-not-allowed border-2 border-slate-600'
                            }`}
                        title={!sermon.notes_url ? 'Notes not uploaded yet' : 'Read sermon notes'}
                    >
                        <FileText className="w-5 h-5" />
                        Read Notes
                    </button>
                </div>
            </div>
        </div>
    );
};
