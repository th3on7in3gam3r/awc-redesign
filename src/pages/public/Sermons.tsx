

import React, { useState, useEffect } from 'react';
import { youtubeService, YouTubeVideo, LiveStreamInfo } from '../../services/youtubeService';

interface Sermon {
  id: string;
  title: string;
  speaker: string;
  preached_at: string;
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
        setLoading(false);
      } else {
        // Fallback to database if YouTube fails
        setUseYouTube(false);
        fetchDatabaseSermons();
      }
    }).catch(() => {
      setUseYouTube(false);
      fetchDatabaseSermons();
    });
  }, []);

  const fetchDatabaseSermons = () => {
    // Fetch published sermons from API
    fetch('/api/sermons?published=true')
      .then(res => res.json())
      .then(data => {
        setSermons(data);
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
    <div className="pt-28 md:pt-52 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-church-gold font-bold tracking-[0.4em] uppercase text-xs mb-4 block animate-fade-in">Digital Library</span>
          <h1 className="text-6xl font-bold text-church-burgundy mb-6 serif leading-tight">Watch & Listen</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
            Missed a service? Catch up on our latest messages or dive into our archives to find spiritual nourishment.
          </p>
        </div>

        {/* Live Stream Section */}
        {liveStream.isLive ? (
          <div className="mb-16 bg-gradient-to-br from-red-600 to-red-700 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-red-500 animate-fade-in">
            <div className="relative">
              <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
                <div className="relative">
                  <span className="flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
                  </span>
                </div>
                <span className="bg-white text-red-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                  🔴 LIVE NOW
                </span>
              </div>

              <div
                className="cursor-pointer group"
                onClick={() => window.open(`https://www.youtube.com/watch?v=${liveStream.videoId}`, '_blank')}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={liveStream.thumbnail}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt="Live Stream"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-red-600 shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                      <i className="fa-solid fa-play ml-1 text-2xl"></i>
                    </div>
                  </div>
                </div>

                <div className="p-10 bg-red-600">
                  <h2 className="text-white text-3xl font-bold serif mb-2">{liveStream.title}</h2>
                  {liveStream.viewerCount && (
                    <p className="text-red-100 text-sm">
                      <i className="fa-solid fa-eye mr-2"></i>
                      {youtubeService.formatViewCount(liveStream.viewerCount)} watching now
                    </p>
                  )}
                  <p className="text-red-100 text-sm mt-4">Click to join the live stream on YouTube</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-16 bg-gradient-to-br from-church-burgundy to-church-burgundy/90 rounded-[3rem] p-12 text-center shadow-xl">
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-church-gold/20 text-church-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-calendar-day text-2xl"></i>
              </div>
              <h3 className="text-white text-2xl font-bold serif mb-3">Join Us Live Every Sunday</h3>
              <p className="text-gray-300 text-lg mb-6">
                {liveStream.scheduledStartTime
                  ? `Next service scheduled: ${new Date(liveStream.scheduledStartTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`
                  : 'Sundays at 10:00 AM EST'}
              </p>
              <a
                href="https://www.youtube.com/@anointedworshipcenter/streams"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 bg-church-gold hover:bg-white text-white hover:text-church-burgundy px-8 py-4 rounded-full font-black uppercase tracking-[0.2em] text-xs transition-all duration-500 shadow-xl"
              >
                <i className="fa-brands fa-youtube text-lg"></i> Set Reminder
              </a>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100">
                <div className="aspect-video bg-gray-200"></div>
                <div className="p-10">
                  <div className="h-4 bg-gray-200 rounded mb-4 w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : useYouTube && youtubeVideos.length > 0 ? (
          <>
            <div className="flex items-center gap-6 mb-8">
              <h2 className="text-3xl font-bold text-church-burgundy serif">Recent Sermons</h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-church-gold/40 to-transparent"></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {youtubeVideos.map((video) => (
                <div
                  key={video.id}
                  className="group bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 cursor-pointer hover:-translate-y-2 transition-all duration-500"
                  onClick={() => setSelectedYouTubeVideo(video)}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      alt={video.title}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-church-burgundy/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-church-burgundy shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                        <i className="fa-solid fa-play ml-1 text-xl"></i>
                      </div>
                    </div>
                    {video.duration && (
                      <div className="absolute bottom-3 right-3 bg-black/80 text-white px-2 py-1 rounded text-xs font-bold">
                        {video.duration}
                      </div>
                    )}
                  </div>
                  <div className="p-10">
                    <p className="text-xs text-church-gold font-black uppercase tracking-tighter mb-4">
                      {new Date(video.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <h3 className="text-2xl font-bold text-church-burgundy mb-4 serif group-hover:text-church-gold transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                    {video.viewCount && (
                      <p className="text-sm text-slate-500 mb-3">
                        <i className="fa-solid fa-eye mr-2"></i>
                        {youtubeService.formatViewCount(video.viewCount)} views
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : sermons.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {sermons.map((sermon) => (
              <div
                key={sermon.id}
                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 cursor-pointer hover:-translate-y-2 transition-all duration-500"
                onClick={() => setSelectedSermon(sermon)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={getYouTubeThumbnail(sermon.video_url)}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    alt={sermon.title}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-church-burgundy/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-church-burgundy shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                      <i className="fa-solid fa-play ml-1 text-xl"></i>
                    </div>
                  </div>
                  <div className="absolute top-6 left-6">
                    <span className={`${getTypeColor(sermon.type)} text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg`}>
                      {sermon.type}
                    </span>
                  </div>
                </div>
                <div className="p-10">
                  <p className="text-xs text-church-gold font-black uppercase tracking-tighter mb-4">{formatDate(sermon.preached_at)}</p>
                  <h3 className="text-2xl font-bold text-church-burgundy mb-4 serif group-hover:text-church-gold transition-colors">{sermon.title}</h3>
                  {sermon.scripture && (
                    <p className="text-sm text-slate-500 mb-3 italic">{sermon.scripture}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-church-gold/20 overflow-hidden bg-church-gold/10 flex items-center justify-center">
                      <span className="text-church-gold text-xs font-bold">{sermon.speaker.charAt(0)}</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium italic">{sermon.speaker}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-video text-3xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-slate-400 mb-2">No Sermons Available</h3>
            <p className="text-slate-300">Check back soon for new messages!</p>
          </div>
        )}

        {/* Featured Archive Section */}
        <div className="mt-32 bg-church-burgundy rounded-[4rem] p-16 md:p-24 relative overflow-hidden text-center shadow-2xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-church-gold rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-church-gold rounded-full blur-[150px] translate-x-1/3 translate-y-1/3"></div>
          </div>
          <div className="relative z-10">
            <h2 className="text-white text-4xl md:text-5xl font-bold mb-8 serif">Looking for older messages?</h2>
            <p className="text-gray-400 text-lg mb-12 font-light max-w-xl mx-auto leading-relaxed">
              Explore our full digital archive on YouTube. Subscribe to stay notified whenever we go live!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="https://www.youtube.com/@anointedworshipcenter"
                target="_blank"
                rel="noreferrer"
                className="bg-church-gold hover:bg-white text-white hover:text-church-burgundy px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs transition-all duration-500 shadow-xl inline-flex items-center gap-3 justify-center"
              >
                <i className="fa-brands fa-youtube text-lg"></i> YouTube Channel
              </a>
            </div>
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

          <div className="relative w-full max-w-5xl bg-black rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(212,175,55,0.2)] animate-slide-up">
            <div className="absolute top-6 right-6 z-10">
              <button
                onClick={() => setSelectedSermon(null)}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all group"
              >
                <i className="fa-solid fa-xmark text-lg group-hover:rotate-90 transition-transform"></i>
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
                <div className="w-full h-full flex flex-col items-center justify-center text-white p-10 text-center">
                  <div className="w-20 h-20 bg-church-gold/20 text-church-gold rounded-full flex items-center justify-center mb-6 text-3xl">
                    <i className="fa-solid fa-video-slash"></i>
                  </div>
                  <h3 className="text-3xl font-bold mb-4 serif">Video Unavailable</h3>
                  <p className="text-gray-400 max-w-sm">This sermon video is not yet available. Check back soon or visit our YouTube channel.</p>
                </div>
              )}
            </div>

            <div className="p-10 bg-church-burgundy border-t border-white/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-church-gold font-black uppercase tracking-[0.2em] text-[10px]">{selectedSermon.type}</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                    <span className="text-gray-400 text-xs font-medium">{formatDate(selectedSermon.preached_at)}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white serif">{selectedSermon.title}</h2>
                  {selectedSermon.scripture && (
                    <p className="text-church-gold text-sm mt-2 italic">{selectedSermon.scripture}</p>
                  )}
                  <p className="text-gray-400 mt-2 font-light">{selectedSermon.speaker}</p>
                  {selectedSermon.summary && (
                    <p className="text-gray-300 mt-4 leading-relaxed">{selectedSermon.summary}</p>
                  )}
                </div>
                <div className="flex gap-4">
                  {selectedSermon.video_url && (
                    <a
                      href={selectedSermon.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest"
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

          <div className="relative w-full max-w-5xl bg-black rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(212,175,55,0.2)] animate-slide-up">
            <div className="absolute top-6 right-6 z-10">
              <button
                onClick={() => setSelectedYouTubeVideo(null)}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all group"
              >
                <i className="fa-solid fa-xmark text-lg group-hover:rotate-90 transition-transform"></i>
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

            <div className="p-10 bg-church-burgundy border-t border-white/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-church-gold font-black uppercase tracking-[0.2em] text-[10px]">SERMON</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                    <span className="text-gray-400 text-xs font-medium">
                      {new Date(selectedYouTubeVideo.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-white serif">{selectedYouTubeVideo.title}</h2>
                  {selectedYouTubeVideo.viewCount && (
                    <p className="text-gray-400 mt-2 text-sm">
                      <i className="fa-solid fa-eye mr-2"></i>
                      {youtubeService.formatViewCount(selectedYouTubeVideo.viewCount)} views
                    </p>
                  )}
                  {selectedYouTubeVideo.description && (
                    <p className="text-gray-300 mt-4 leading-relaxed line-clamp-3">{selectedYouTubeVideo.description}</p>
                  )}
                </div>
                <div className="flex gap-4">
                  <a
                    href={selectedYouTubeVideo.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest"
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