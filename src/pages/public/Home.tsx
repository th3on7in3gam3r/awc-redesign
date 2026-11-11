import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SERVICE_TIMES } from '../../constants';
import GallerySection from '../../components/ui/GallerySection';
import ConnectAppPromo from '../../components/ui/ConnectAppPromo';
import { GivingModal } from '../../components/giving/GivingModal';
import EventCountdown from '../../components/EventCountdown';
import { youtubeService, YouTubeVideo } from '../../services/youtubeService';

const formatSermonDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getVideoThumbnail = (video: YouTubeVideo): string => {
  if (video.thumbnail) return video.thumbnail;
  if (video.id) return `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;
  return 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80';
};

const CHURCH_STATS = {
  establishedYear: '2009',
  establishedLabel: 'Established',
  establishedPhrase: 'Since 2009',
  members: '200+',
  ministries: '10',
} as const;

const Home: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recentVideos, setRecentVideos] = useState<YouTubeVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [showGivingModal, setShowGivingModal] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const playlist = [
    {
      title: "Everybody Is Somebody",
      url: "/music/everybody-is-somebody.mp3"
    },
    {
      title: "Reign in This House",
      url: "/music/reign-in-this-house.mp3"
    }
  ];

  useEffect(() => {
    setIsVisible(true);

    youtubeService
      .getLatestVideos(3)
      .then((videos) => setRecentVideos(videos))
      .catch((err) => console.error('Error fetching YouTube videos:', err))
      .finally(() => setLoadingVideos(false));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      // Auto-play next track
      const nextTrack = (currentTrack + 1) % playlist.length;
      setCurrentTrack(nextTrack);
      audio.src = playlist[nextTrack].url;
      audio.play();
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [currentTrack]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
    }
  };

  const nextTrack = () => {
    const next = (currentTrack + 1) % playlist.length;
    setCurrentTrack(next);
    const audio = audioRef.current;
    if (audio) {
      audio.src = playlist[next].url;
      if (isPlaying) {
        audio.play().catch(console.error);
      }
    }
  };

  return (
    <div className="flex flex-col w-full">
      <GivingModal isOpen={showGivingModal} onClose={() => setShowGivingModal(false)} />
      {/* Hero Banner — framed burgundy card, gold headline, pastors on the right */}
      <section className="relative bg-[#24050a] pt-24 md:pt-28 pb-8 md:pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#3a0912_0%,_#24050a_60%)]" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          {/* Banner card */}
          <div
            className="relative overflow-hidden rounded-2xl border border-[#e8c873]/40 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]"
            style={{
              background:
                'radial-gradient(ellipse 70% 90% at 30% 40%, #8a1a2b 0%, #6a0f1f 40%, #45081a 75%, #2e0510 100%)',
            }}
          >
            {/* Soft light behind the pastors */}
            <div className="pointer-events-none absolute right-[8%] top-[10%] h-[70%] w-[45%] rounded-full bg-[#b8323f]/25 blur-[90px]" aria-hidden="true" />

            {/* Gold swoosh ribbon */}
            <svg
              className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[45%] w-full"
              viewBox="0 0 1200 300"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="awcSwoosh" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8a6a22" stopOpacity="0.9" />
                  <stop offset="25%" stopColor="#f6dc8c" />
                  <stop offset="55%" stopColor="#d4af37" />
                  <stop offset="80%" stopColor="#fbe7a6" />
                  <stop offset="100%" stopColor="#b4942e" />
                </linearGradient>
                <linearGradient id="awcSwooshFade" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity="0" />
                  <stop offset="40%" stopColor="#d4af37" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#f6dc8c" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              {/* main ribbon */}
              <path
                d="M0 250 C 220 205, 420 215, 640 250 C 820 278, 1000 250, 1200 150 L 1200 168 C 1000 270, 820 296, 640 268 C 420 236, 220 228, 0 270 Z"
                fill="url(#awcSwoosh)"
              />
              {/* thin echo line */}
              <path
                d="M0 228 C 240 182, 460 196, 660 228 C 860 258, 1020 222, 1200 120"
                stroke="url(#awcSwooshFade)"
                strokeWidth="1.5"
              />
              {/* deep shade under ribbon */}
              <path
                d="M0 270 C 220 228, 420 236, 640 268 C 820 296, 1000 270, 1200 168 L 1200 300 L 0 300 Z"
                fill="#2a0410"
                opacity="0.55"
              />
            </svg>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 items-end md:min-h-[420px] lg:min-h-[470px]">
              {/* Left copy */}
              <div
                className={`md:col-span-7 px-6 sm:px-10 lg:px-14 pt-10 md:pt-0 md:pb-24 md:self-center transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
              >
                <div className="flex gap-5 sm:gap-6">
                  <div className="w-[2px] shrink-0 self-stretch bg-gradient-to-b from-[#f6dc8c] via-[#d4af37] to-transparent" aria-hidden="true" />
                  <div className="min-w-0">
                    <h1
                      className="font-serif font-bold text-[2.3rem] leading-[1.08] sm:text-6xl md:text-[3.4rem] lg:text-[4rem] xl:text-[4.4rem] bg-clip-text text-transparent drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
                      style={{ backgroundImage: 'linear-gradient(180deg, #fbe7a6 0%, #f0cf72 45%, #c9a03c 100%)' }}
                    >
                      <span className="sm:whitespace-nowrap">Where Everybody</span>
                      <br />
                      <span className="whitespace-nowrap">Is Somebody</span>
                    </h1>

                    <p className="mt-5 font-serif text-lg sm:text-xl text-white leading-snug">
                      Welcome to Anointed Worship Center.
                      <br />
                      <em className="text-white/90">A community of faith, family, and purpose.</em>
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Link
                        to="/visit"
                        className="inline-flex items-center justify-center rounded-md px-8 py-3.5 font-serif text-base font-bold text-[#3a0610] shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)] transition hover:brightness-110"
                        style={{ backgroundImage: 'linear-gradient(180deg, #f6dc8c 0%, #d9b14f 60%, #b88f2f 100%)' }}
                      >
                        Plan Your Visit
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          const sermonSection = document.getElementById('sermons-section');
                          if (sermonSection) {
                            sermonSection.scrollIntoView({ behavior: 'smooth' });
                          } else {
                            window.location.href = '/sermons';
                          }
                        }}
                        className="inline-flex items-center justify-center gap-3 rounded-md border border-white/85 px-7 py-3.5 font-serif text-base font-semibold text-white transition hover:bg-white hover:text-[#4a0414]"
                      >
                        <i className="fa-solid fa-play text-[12px]" aria-hidden="true"></i>
                        Watch Sermons
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Pastor & First Lady */}
              <div
                className={`md:col-span-5 relative flex justify-center md:justify-end items-end md:self-stretch mt-8 md:mt-0 transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              >
                <img
                  src="/images/pastors-couple-blue-transparent.png"
                  alt="Dr. Kenneth Mutegyeki and First Lady Sania Mutegyeki"
                  className="relative h-[360px] sm:h-[440px] md:absolute md:bottom-0 md:right-[4%] md:h-[104%] w-auto max-w-none object-contain object-bottom"
                  style={{ filter: 'drop-shadow(0 12px 30px rgba(0,0,0,0.45))' }}
                />
              </div>
            </div>
          </div>

          {/* Gold rule + Pastoral Leadership tab, service info & music */}
          <div className="relative mt-6">
            <div className="absolute left-0 right-0 top-[17px] h-px bg-gradient-to-r from-[#d4af37] via-[#d4af37]/60 to-transparent" aria-hidden="true" />
            <div className="relative flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-8">
              <Link
                to="/ministries"
                className="self-start rounded-t-md rounded-b-sm border border-[#f6dc8c]/60 px-5 py-2 font-serif text-sm font-bold uppercase tracking-[0.08em] text-[#3a0610] shadow-md transition hover:brightness-110"
                style={{ backgroundImage: 'linear-gradient(180deg, #f6dc8c 0%, #d9b14f 70%, #b88f2f 100%)' }}
              >
                Pastoral Leadership
              </Link>

              <div className="lg:ml-auto mt-2 lg:mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-white/85">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-calendar-day text-[#d4af37] text-xs" aria-hidden="true"></i>
                  <span className="text-[13px]"><span className="font-semibold text-[#f0cf72]">Sun</span> 10 AM</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-book-bible text-[#d4af37] text-xs" aria-hidden="true"></i>
                  <span className="text-[13px]"><span className="font-semibold text-[#f0cf72]">Wed</span> 7 PM</span>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=4+School+St+Acton,+MA+01720"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[13px] hover:text-white"
                >
                  <i className="fa-solid fa-location-dot text-[#d4af37] text-xs" aria-hidden="true"></i>
                  4 School St, Acton, MA
                </a>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={togglePlay}
                    className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center transition-colors ${isPlaying ? 'bg-white text-[#4a0414]' : 'bg-[#d4af37] text-[#4a0414]'}`}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-[9px]`}></i>
                  </button>
                  <span className="text-[13px] font-medium whitespace-nowrap">{playlist[currentTrack].title}</span>
                  <button
                    onClick={nextTrack}
                    className="w-7 h-7 shrink-0 rounded-full border border-white/20 hover:bg-white/10 flex items-center justify-center transition-colors"
                    aria-label="Next track"
                  >
                    <i className="fa-solid fa-forward text-[8px]"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={playlist[currentTrack].url}
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={(e) => {
            console.error('Audio loading error:', e);
            setIsPlaying(false);
          }}
        />
      </section>

      {/* Fellowship Cookout Countdown */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <EventCountdown />
        </div>
      </section>

      {/* Legacy Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white via-gray-50/40 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Image */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-3 md:-inset-4 bg-church-burgundy/5 rounded-[2rem] -z-10" aria-hidden="true" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-church-gold/15 rounded-full blur-3xl -z-10" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[1.75rem] shadow-[0_24px_60px_-20px_rgba(64,0,16,0.25)] ring-1 ring-black/5">
                <img
                  src="/images/awc-welcome.png"
                  className="w-full aspect-[3/2] object-cover object-center"
                  alt="Welcome to Anointed Worship Center"
                />
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-7 space-y-8 md:space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 rounded-full border border-church-burgundy/10 bg-white px-4 py-2 shadow-sm">
                  <span className="text-church-burgundy text-xl md:text-2xl font-bold serif leading-none tabular-nums">
                    {CHURCH_STATS.establishedYear}
                  </span>
                  <span className="h-8 w-px bg-church-burgundy/15" aria-hidden="true" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    {CHURCH_STATS.establishedPhrase}
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-church-burgundy serif leading-[1.1]">
                  Building a legacy of{' '}
                  <span className="text-church-gold italic">faith &amp; purpose.</span>
                </h2>

                <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl">
                  {CHURCH_STATS.establishedPhrase}, Anointed Worship Center has been a beacon of light in Acton, MA.
                  We are a multi-generational, diverse family of believers dedicated to the radical love of
                  Christ and the transformation of our community.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-7 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-church-gold/10 text-church-gold">
                      <i className="fa-solid fa-eye text-sm" aria-hidden="true"></i>
                    </span>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-church-gold">
                      Our Vision
                    </h3>
                  </div>
                  <p className="text-slate-600 text-sm md:text-[15px] leading-relaxed">
                    Empowering every believer through the uncompromising Word of God.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-7 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-church-gold/10 text-church-gold">
                      <i className="fa-solid fa-hands-holding-heart text-sm" aria-hidden="true"></i>
                    </span>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-church-gold">
                      Our Mission
                    </h3>
                  </div>
                  <p className="text-slate-600 text-sm md:text-[15px] leading-relaxed">
                    Transforming lives locally and globally through active service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-church-gold font-bold uppercase tracking-[0.4em] text-[10px] block mb-4">Your Journey Starts Here</span>
          <h2 className="text-4xl md:text-5xl font-bold text-church-burgundy serif mb-16">Discover Your Next Step</h2>
          <div className="grid md:grid-cols-3 gap-10 text-left">
            {[
              { title: "I'm New Here", icon: "fa-user-plus", desc: "First time at AWC? We have something special for you." },
              { title: "Get Connected", icon: "fa-users", desc: "Find your community in our small groups and ministries." },
              { title: "Serve with Us", icon: "fa-heart", desc: "Discover how your unique talents can help build the Kingdom." }
            ].map((step, i) => (
              <div key={i} className="bg-white p-12 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-shadow duration-500">
                <div className="w-12 h-12 bg-church-gold/10 rounded-xl flex items-center justify-center text-church-gold text-xl mb-8">
                  <i className={`fa-solid ${step.icon}`}></i>
                </div>
                <h3 className="text-2xl font-bold text-church-burgundy mb-4">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">{step.desc}</p>
                <button className="text-church-gold font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:gap-4 transition-all">
                  Start Here <i className="fa-solid fa-chevron-right text-[8px]"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <ConnectAppPromo />

      {/* Gallery Section */}
      {/* Daily Inspiration Section */}
      <section className="py-24 relative overflow-hidden bg-[#fafafa]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-church-gold/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-church-burgundy/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <span className="text-church-gold font-bold uppercase tracking-[0.4em] text-[10px] block mb-6">Daily Inspiration</span>

          <div className="mb-8">
            <i className="fa-solid fa-quote-left text-4xl text-church-gold/20"></i>
          </div>

          <h2 className="text-3xl md:text-5xl font-serif italic text-church-burgundy leading-relaxed mb-8">
            "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint."
          </h2>

          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="h-px w-12 bg-church-gold/30"></div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Isaiah 40:31</p>
            <div className="h-px w-12 bg-church-gold/30"></div>
          </div>

          <div className="flex justify-center gap-4">
            <button className="bg-white border border-slate-200 hover:border-church-gold text-slate-600 hover:text-church-gold px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-sm hover:shadow-md flex items-center gap-2">
              <i className="fa-solid fa-share-nodes"></i> Share
            </button>
            <Link to="/daily-devotional" className="bg-church-burgundy hover:bg-church-gold text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
              <i className="fa-solid fa-book-open"></i> Read Devotional
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Messages Section */}
      <section id="sermons-section" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-church-gold font-bold uppercase tracking-[0.4em] text-[10px] block mb-4">Digital Sanctuary</span>
              <h2 className="text-4xl md:text-5xl font-bold text-church-burgundy serif">Recent Messages</h2>
            </div>
            <Link to="/sermons" className="text-church-burgundy font-bold uppercase tracking-widest text-[10px] flex items-center gap-3 border-b-2 border-church-gold/20 pb-1 hover:border-church-gold transition-colors">
              Watch All <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {loadingVideos ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-3xl mb-6"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))
            ) : recentVideos.length > 0 ? (
              recentVideos.map((video) => {
                const formattedDate = formatSermonDate(video.publishedAt);

                return (
                  <a
                    key={video.id}
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden mb-6 relative">
                      <img
                        src={getVideoThumbnail(video)}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        alt={video.title}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (video.id) {
                            target.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-church-burgundy/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[16px] border-l-church-burgundy border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-church-burgundy mb-2 group-hover:text-church-gold transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                      {[formattedDate, video.viewCount ? `${youtubeService.formatViewCount(video.viewCount)} views` : '']
                        .filter(Boolean)
                        .join(' • ')}
                    </p>
                  </a>
                );
              })
            ) : (
              <div className="md:col-span-3 text-center py-16 bg-gray-50 rounded-3xl border border-gray-100">
                <p className="text-church-burgundy font-semibold mb-2">Sermons are on the way</p>
                <p className="text-slate-500 text-sm">Visit our YouTube channel for the latest messages.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
