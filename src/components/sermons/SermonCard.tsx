import React from 'react';
import { Calendar, User, BookOpen } from 'lucide-react';

interface SermonCardProps {
    sermon: {
        id: string;
        title: string;
        speaker: string;
        preached_at: string;
        type: string;
        series?: string;
        scripture?: string;
        video_url?: string;
    };
    onClick: () => void;
}

export const SermonCard: React.FC<SermonCardProps> = ({ sermon, onClick }) => {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getYouTubeThumbnail = (url?: string) => {
        if (!url) return null;

        // Extract video ID from various YouTube URL formats
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        if (match && match[2].length === 11) {
            // Use maxresdefault for best quality, fallback to hqdefault
            return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
        }

        return null;
    };

    const thumbnailUrl = getYouTubeThumbnail(sermon.video_url);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Sunday': return 'bg-church-gold/10 text-church-gold border-church-gold/20';
            case 'Bible Study': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Prayer': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
        >
            {/* Thumbnail Image */}
            {thumbnailUrl && (
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    <img
                        src={thumbnailUrl}
                        alt={sermon.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            // Fallback to hqdefault if maxresdefault fails
                            const target = e.target as HTMLImageElement;
                            if (target.src.includes('maxresdefault')) {
                                const videoId = sermon.video_url?.match(/([^#&?]*)/)?.[0];
                                target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                            } else {
                                // Hide image if both fail
                                target.style.display = 'none';
                            }
                        }}
                    />
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-l-[16px] border-l-church-burgundy border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1"></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6">
                {/* Chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider border ${getTypeColor(sermon.type)}`}>
                        {sermon.type}
                    </span>
                    {sermon.series && (
                        <span className="text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider border bg-slate-50 text-slate-600 border-slate-200">
                            {sermon.series}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-church-burgundy transition-colors">
                    {sermon.title}
                </h3>

                {/* Scripture */}
                {sermon.scripture && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-slate-600">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        <span>{sermon.scripture}</span>
                    </div>
                )}

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>{sermon.speaker}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(sermon.preached_at)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
