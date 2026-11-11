import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
      {/* Hero Banner — mockup: burgundy, left copy, right couple photo */}
      <section className="relative overflow-hidden pt-20 bg-church-burgundy">
        <div className="absolute inset-0 bg-gradient-to-r from-church-burgundy via-church-burgundy to-[#3a0606]" aria-hidden="true" />

        {/* Decorative gold swooshes */}
        <svg
          className="pointer-events-none absolute -bottom-6 left-0 z-[5] h-[38%] w-[58%] max-w-3xl opacity-90"
          viewBox="0 0 640 240"
          fill="none"
          aria-hidden="true"
        >
          <path d="M-20 190 C120 110, 260 70, 420 95 C500 108, 560 140, 640 175" stroke="#D4AF37" strokeWidth="2.5" />
          <path d="M-20 215 C140 130, 280 95, 430 125 C510 142, 570 168, 640 205" stroke="#D4AF37" strokeWidth="1.5" opacity="0.65" />
        </svg>
        <svg
          className="pointer-events-none absolute bottom-8 right-0 z-[5] hidden h-[28%] w-[28%] opacity-50 md:block"
          viewBox="0 0 320 160"
          fill="none"
          aria-hidden="true"
        >
          <path d="M0 130 C80 90, 160 70, 320 95" stroke="#D4AF37" strokeWidth="1.5" />
        </svg>

        <div className="relative z-10 mx-auto grid min-h-[78vh] max-w-7xl grid-cols-1 items-center gap-6 px-6 py-10 md:min-h-[82vh] md:grid-cols-12 md:gap-8 md:py-14 lg:px-8">
          {/* Left copy */}
          <div
            className={`md:col-span-6 lg:col-span-5 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          >
            <div className="flex gap-4 sm:gap-5">
              <div className="mt-2 hidden h-auto w-px shrink-0 self-stretch bg-church-gold sm:block" aria-hidden="true" />
              <div className="min-w-0">
                <h1 className="font-serif text-4xl font-bold leading-[1.08] text-white sm:text-5xl md:text-5xl lg:text-[3.75rem]">
                  Where Everybody
                  <br />
                  <span className="text-church-gold">Is Somebody</span>
                </h1>

                <p className="mt-5 max-w-md font-serif text-base italic leading-relaxed text-white/90 sm:text-lg md:mt-6">
                  Welcome to Anointed Worship Center. A community of faith, family, and purpose.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
                  <Link
                    to="/about"
                    className="inline-flex items-center justify-center rounded-md bg-gradient-to-b from-church-gold-light to-church-gold px-7 py-3.5 text-[13px] font-bold text-church-burgundy shadow-lg shadow-black/20 transition hover:from-white hover:to-church-gold-light"
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
                    className="inline-flex items-center justify-center gap-2.5 rounded-md border border-white/80 bg-transparent px-7 py-3.5 text-[13px] font-semibold text-white transition hover:bg-white hover:text-church-burgundy"
                  >
                    <i className="fa-solid fa-play text-[10px]" aria-hidden="true" />
                    Watch Sermons
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right couple photo */}
          <div
            className={`relative md:col-span-6 lg:col-span-7 transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <div className="relative mx-auto flex h-[48vh] max-w-lg items-end justify-center md:mx-0 md:ml-auto md:h-[70vh] md:max-w-none">
              <img
                src="/images/pastors-couple-blue-transparent.png"
                alt="Dr. Kenneth Mutegyeki and First Lady Sania Mutegyeki"
                className="h-full w-auto max-w-full object-contain object-bottom drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Gold bottom rule + Pastoral Leadership tab */}
        <div className="relative z-20 border-t border-church-gold/80 bg-church-burgundy-dark/40">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/ministries"
                className="inline-flex items-center rounded-md bg-church-gold px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-church-burgundy shadow-sm transition hover:bg-white"
              >
                Pastoral Leadership
              </Link>
              <div className="flex items-center gap-4 text-white/80">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                  <i className="fa-solid fa-calendar-day text-church-gold text-[10px]" aria-hidden="true" />
                  Sun 10 AM
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                  <i className="fa-solid fa-book-bible text-church-gold text-[10px]" aria-hidden="true" />
                  Wed 7 PM
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${isPlaying ? 'bg-white text-church-burgundy' : 'bg-church-gold text-church-burgundy'}`}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-[10px]`} aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <span className="block truncate text-[12px] font-semibold text-white">{playlist[currentTrack].title}</span>
                <span className="block text-[10px] text-white/45">{isPlaying ? 'Now playing' : 'Paused'}</span>
              </div>
              <button
                type="button"
                onClick={nextTrack}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 transition hover:bg-white/10"
                aria-label="Next track"
              >
                <i className="fa-solid fa-forward text-[9px] text-white/80" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

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
