

import * as React from 'react';
import { useState, useEffect } from 'react';
import { youtubeService, YouTubeVideo, LiveStreamInfo } from '../../services/youtubeService';
import { YOUTUBE_CHANNEL_URL } from '../../constants';

interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  type: string;
  series?: string;
  scripture?: string;
  summary?: string;
  video_url?: string;
  audio_url?: string;
  notes_url?: string;
}

const Sermons: React.FC = () => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [liveStream, setLiveStream] = useState<LiveStreamInfo>({ isLive: false });
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [selectedYouTubeVideo, setSelectedYouTubeVideo] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [useYouTube, setUseYouTube] = useState(true);

  useEffect(() => {
    // Fetch live stream status
    youtubeService.checkLiveStream().then(setLiveStream);

    // Fetch YouTube videos
    youtubeService.getLatestVideos(12).then(videos => {
      if (videos.length > 0) {
        setYoutubeVideos(videos);
        setUseYouTube(true);
      } else {
        setUseYouTube(false);
      }
    }).catch(() => {
      setUseYouTube(false);
    });

    // Always fetch database sermons for the "Recent Messages" section
    fetchDatabaseSermons();
  }, []);

  const fetchDatabaseSermons = () => {
    // Fetch published sermons from API
    fetch('/api/sermons?published=true')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch sermons');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setSermons(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching sermons:', err);
        setLoading(false);
      });
  };

  const getYouTubeThumbnail = (url?: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
    }
    return 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80';
  };

  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Sunday': return 'bg-church-gold';
      case 'Bible Study': return 'bg-blue-500';
      case 'Prayer': return 'bg-purple-500';
      default: return 'bg-church-gold';
    }
  };

  return (
    <div className="pt-28 md:pt-32 pb-16 md:pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10 md:mb-12">
          <span className="text-church-gold font-bold tracking-[0.35em] uppercase text-[10px] mb-3 block">
            Digital Library
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-church-burgundy mb-3 serif leading-tight">
            Watch &amp; Listen
          </h1>
          <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
            Missed a service? Catch up on our latest messages or dive into our archives to find spiritual nourishment.
          </p>
        </div>

        {/* Live Stream Section */}
        {liveStream.isLive ? (
          <div className="mb-10 md:mb-12 rounded-2xl overflow-hidden border border-red-500/40 shadow-sm bg-red-600 animate-fade-in">
            <div className="relative">
              <div className="absolute top-4 left-4 z-10">
                <span className="inline-flex items-center gap-2 bg-white text-red-600 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                  </span>
                  Live Now
                </span>
              </div>

              <button
                type="button"
                className="w-full text-left cursor-pointer group"
                onClick={() => window.open(`https://www.youtube.com/watch?v=${liveStream.videoId}`, '_blank')}
              >
                <div className="aspect-video relative overflow-hidden bg-black">
                  <img
                    src={liveStream.thumbnail}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    alt="Live Stream"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-red-600 shadow-md">
                      <i className="fa-solid fa-play ml-0.5 text-lg"></i>
                    </div>
                  </div>
                </div>

                <div className="p-5 md:p-6 bg-red-600">
                  <h2 className="text-white text-xl md:text-2xl font-bold serif mb-1">{liveStream.title}</h2>
                  {liveStream.viewerCount && (
                    <p className="text-red-100 text-sm">
                      <i className="fa-solid fa-eye mr-2"></i>
                      {youtubeService.formatViewCount(liveStream.viewerCount)} watching now
                    </p>
                  )}
                  <p className="text-red-100/90 text-sm mt-2">Click to join the live stream on YouTube</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-10 md:mb-12 bg-church-burgundy rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="shrink-0 w-11 h-11 bg-church-gold/15 text-church-gold rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-calendar-day text-lg"></i>
                </div>
                <div className="min-w-0">
                  <h3 className="text-white text-xl md:text-2xl font-bold serif mb-1">Join Us Live Every Sunday</h3>
                  <p className="text-white/65 text-sm md:text-base">
                    {liveStream.scheduledStartTime
                      ? `Next service scheduled: ${new Date(liveStream.scheduledStartTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`
                      : 'Sundays at 10:00 AM EST'}
                  </p>
                </div>
              </div>
              <a
                href={YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-church-gold hover:bg-white text-white hover:text-church-burgundy px-6 py-3 rounded-full font-bold uppercase tracking-[0.18em] text-[10px] transition-colors duration-300 shrink-0"
              >
                <i className="fa-brands fa-youtube text-sm"></i> Set Reminder
              </a>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm">
                <div className="aspect-video bg-gray-200"></div>
                <div className="p-4 md:p-5">
                  <div className="h-3 bg-gray-200 rounded mb-3 w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : useYouTube && youtubeVideos.length > 0 ? (
          <>
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-church-burgundy serif">Recent Sermons</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-church-gold/40 to-transparent"></div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {youtubeVideos.map((video) => (
                <button
                  key={video.id}
                  type="button"
                  className="group text-left bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md hover:border-church-gold/40 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-church-gold/50"
                  onClick={() => setSelectedYouTubeVideo(video)}
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    <img
                      src={video.thumbnail}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      alt=""
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
                      <div className="w-11 h-11 bg-white/95 rounded-full flex items-center justify-center text-church-burgundy shadow-sm">
                        <i className="fa-solid fa-play ml-0.5 text-sm"></i>
                      </div>
                    </div>
                    {video.duration && (
                      <div className="absolute bottom-2.5 right-2.5 bg-black/80 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                        {video.duration}
                      </div>
                    )}
                  </div>
                  <div className="p-4 md:p-5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2">
                      <span className="text-church-gold font-bold uppercase tracking-wider">
                        {new Date(video.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {video.viewCount && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span>{youtubeService.formatViewCount(video.viewCount)} views</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-church-burgundy serif leading-snug line-clamp-2 group-hover:text-church-gold transition-colors">
                      {video.title}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : sermons.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {sermons.map((sermon) => (
              <button
                key={sermon.id}
                type="button"
                className="group text-left bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md hover:border-church-gold/40 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-church-gold/50"
                onClick={() => setSelectedSermon(sermon)}
              >
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={getYouTubeThumbnail(sermon.video_url)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    alt=""
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
                    <div className="w-11 h-11 bg-white/95 rounded-full flex items-center justify-center text-church-burgundy shadow-sm">
                      <i className="fa-solid fa-play ml-0.5 text-sm"></i>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`${getTypeColor(sermon.type)} text-white px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest`}>
                      {sermon.type}
                    </span>
                  </div>
                </div>
                <div className="p-4 md:p-5">
                  <p className="text-[11px] text-church-gold font-bold uppercase tracking-wider mb-2">{formatDate(sermon.date)}</p>
                  <h3 className="text-base md:text-lg font-bold text-church-burgundy serif leading-snug line-clamp-2 mb-2 group-hover:text-church-gold transition-colors">
                    {sermon.title}
                  </h3>
                  {sermon.scripture && (
                    <p className="text-sm text-slate-500 mb-2 italic line-clamp-1">{sermon.scripture}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full border border-church-gold/20 bg-church-gold/10 flex items-center justify-center">
                      <span className="text-church-gold text-[10px] font-bold">{sermon.speaker.charAt(0)}</span>
                    </div>
                    <p className="text-slate-500 text-sm">{sermon.speaker}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-14">
            <div className="w-14 h-14 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-video text-xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-400 mb-1">No Sermons Available</h3>
            <p className="text-slate-300 text-sm">Check back soon for new messages!</p>
          </div>
        )}

        {/* Featured Archive Section */}
        <div className="mt-14 md:mt-16 bg-church-burgundy rounded-3xl p-10 md:p-14 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-church-gold/5 -skew-x-12 translate-x-1/2 pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-white text-2xl md:text-3xl font-bold mb-4 serif">Looking for older messages?</h2>
            <p className="text-white/60 text-base mb-8 font-light leading-relaxed">
              Explore our full digital archive on YouTube. Subscribe to stay notified whenever we go live!
            </p>
            <a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-church-gold hover:bg-white text-white hover:text-church-burgundy px-8 py-3.5 rounded-full font-bold uppercase tracking-[0.2em] text-[10px] transition-colors duration-300"
            >
              <i className="fa-brands fa-youtube text-sm"></i> YouTube Channel
            </a>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {selectedSermon && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-church-burgundy/95 backdrop-blur-xl animate-fade-in"
            onClick={() => setSelectedSermon(null)}
          ></div>

          <div className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
            <div className="absolute top-4 right-4 z-10">
              <button
                type="button"
                onClick={() => setSelectedSermon(null)}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
              >
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <div className="aspect-video bg-black">
              {getYouTubeEmbedUrl(selectedSermon.video_url) ? (
                <iframe
                  className="w-full h-full"
                  src={`${getYouTubeEmbedUrl(selectedSermon.video_url)}?autoplay=1`}
                  title={selectedSermon.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white p-8 text-center">
                  <div className="w-14 h-14 bg-church-gold/20 text-church-gold rounded-full flex items-center justify-center mb-4 text-2xl">
                    <i className="fa-solid fa-video-slash"></i>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 serif">Video Unavailable</h3>
                  <p className="text-gray-400 max-w-sm text-sm">This sermon video is not yet available. Check back soon or visit our YouTube channel.</p>
                </div>
              )}
            </div>

            <div className="p-6 md:p-8 bg-church-burgundy border-t border-white/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-church-gold font-bold uppercase tracking-[0.2em] text-[10px]">{selectedSermon.type}</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                    <span className="text-gray-400 text-xs font-medium">{formatDate(selectedSermon.date)}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white serif">{selectedSermon.title}</h2>
                  {selectedSermon.scripture && (
                    <p className="text-church-gold text-sm mt-2 italic">{selectedSermon.scripture}</p>
                  )}
                  <p className="text-gray-400 mt-2 font-light">{selectedSermon.speaker}</p>
                  {selectedSermon.summary && (
                    <p className="text-gray-300 mt-3 leading-relaxed text-sm">{selectedSermon.summary}</p>
                  )}
                </div>
                <div className="flex gap-3">
                  {selectedSermon.video_url && (
                    <a
                      href={selectedSermon.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl transition-colors text-[10px] font-bold uppercase tracking-widest"
                    >
                      <i className="fa-brands fa-youtube"></i> YouTube
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* YouTube Video Modal */}
      {selectedYouTubeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-church-burgundy/95 backdrop-blur-xl animate-fade-in"
            onClick={() => setSelectedYouTubeVideo(null)}
          ></div>

          <div className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
            <div className="absolute top-4 right-4 z-10">
              <button
                type="button"
                onClick={() => setSelectedYouTubeVideo(null)}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
              >
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <div className="aspect-video bg-black">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${selectedYouTubeVideo.id}?autoplay=1`}
                title={selectedYouTubeVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <div className="p-6 md:p-8 bg-church-burgundy border-t border-white/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-church-gold font-bold uppercase tracking-[0.2em] text-[10px]">SERMON</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                    <span className="text-gray-400 text-xs font-medium">
                      {new Date(selectedYouTubeVideo.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white serif">{selectedYouTubeVideo.title}</h2>
                  {selectedYouTubeVideo.viewCount && (
                    <p className="text-gray-400 mt-2 text-sm">
                      <i className="fa-solid fa-eye mr-2"></i>
                      {youtubeService.formatViewCount(selectedYouTubeVideo.viewCount)} views
                    </p>
                  )}
                  {selectedYouTubeVideo.description && (
                    <p className="text-gray-300 mt-3 leading-relaxed text-sm line-clamp-3">{selectedYouTubeVideo.description}</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <a
                    href={selectedYouTubeVideo.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl transition-colors text-[10px] font-bold uppercase tracking-widest"
                  >
                    <i className="fa-brands fa-youtube"></i> YouTube
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sermons;