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
      {/* Hero — full-bleed, editorial: clean type left, Pastor & First Lady right */}
      <section className="relative overflow-hidden bg-[#2a050c] pt-20">
        {/* Background: deep burgundy with a soft light behind the pastors */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4a0a17] via-[#2e060e] to-[#16030a]" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_55%,rgba(150,32,52,0.5),transparent_55%)]" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 md:min-h-[600px] lg:min-h-[640px]">
            {/* Copy */}
            <div
              className={`relative z-20 md:col-span-7 lg:col-span-6 flex flex-col justify-center pt-12 md:py-20 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
            >
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-[#d4af37]" aria-hidden="true" />
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] sm:tracking-[0.22em] text-[#d4af37]">
                  Welcome to Anointed Worship Center
                </p>
              </div>

              <h1 className="mt-6 font-serif font-bold text-white leading-[1.06] text-[clamp(2.4rem,calc((100vw-60px)/8.4),3.6rem)] md:text-[clamp(2.5rem,calc(5vw-2px),4.5rem)]">
                Where Everybody
                <br />
                Is <span className="text-[#d4af37]">Somebody</span>
              </h1>

              <p className="mt-6 max-w-md md:max-w-sm lg:max-w-lg text-base sm:text-lg text-white/75 leading-relaxed">
                A community of faith, family, and purpose in Acton, Massachusetts.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row sm:flex-wrap gap-3">
                <Link
                  to="/visit"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#d4af37] px-7 py-3.5 text-sm font-semibold text-[#2a050c] transition-colors hover:bg-[#e6c45a]"
                >
                  Plan Your Visit
                  <i className="fa-solid fa-arrow-right text-[11px]" aria-hidden="true"></i>
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
                  className="inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-md border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/5"
                >
                  <i className="fa-solid fa-play text-[11px]" aria-hidden="true"></i>
                  Watch Sermons
                </button>
              </div>

              {/* Service times */}
              <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-sm text-white/70">
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">Sunday Service</span>
                  <span className="mt-1 block text-white font-medium">10:00 AM</span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">Wednesday Bible Study</span>
                  <span className="mt-1 block text-white font-medium">7:00 PM</span>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=4+School+St+Acton,+MA+01720"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">Location</span>
                  <span className="mt-1 block text-white font-medium group-hover:underline underline-offset-4">4 School St, Acton, MA</span>
                </a>
              </div>
            </div>

            {/* Pastor & First Lady */}
            <div
              className={`relative md:col-span-5 lg:col-span-6 flex items-end justify-center md:justify-end mt-10 md:mt-0 transition-all duration-1000 delay-150 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
            >
              <img
                src="/images/pastors-couple-blue-transparent.png"
                alt="Dr. Kenneth Mutegyeki and First Lady Sania Mutegyeki"
                className="relative z-10 h-[380px] sm:h-[460px] md:absolute md:bottom-0 md:right-0 md:h-[72%] lg:h-[94%] w-auto max-w-none object-contain object-bottom"
                style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.45))' }}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-[#1c040a]/80 to-transparent" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Slim bottom bar: leadership link + music */}
        <div className="relative z-30 border-t border-white/10 bg-black/25 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/ministries"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 hover:text-[#d4af37] transition-colors"
            >
              Meet Our Pastoral Leadership
              <i className="fa-solid fa-arrow-right text-[10px]" aria-hidden="true"></i>
            </Link>
            <div className="flex items-center gap-2.5 text-white/80">
              <button
                onClick={togglePlay}
                className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center transition-colors ${isPlaying ? 'bg-white text-[#2a050c]' : 'bg-[#d4af37] text-[#2a050c]'}`}
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
