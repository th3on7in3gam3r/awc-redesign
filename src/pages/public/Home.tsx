import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SERVICE_TIMES } from '../../constants';
import GallerySection from '../../components/ui/GallerySection';

const Home: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  // Using youtubeService types
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(0);
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

    // Fetch latest videos from YouTube (Live Streams & Uploads)
    import('../../services/youtubeService').then(({ youtubeService }) => {
      youtubeService.getLatestVideos(3)
        .then(videos => {
          if (videos.length > 0) {
            setRecentVideos(videos);
          } else {
            // Fallback to DB if YouTube fails or is empty
            fetchDatabaseSermons();
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching YouTube videos:', err);
          fetchDatabaseSermons();
        });
    });
  }, []);

  const fetchDatabaseSermons = () => {
    fetch('/api/sermons?published=true')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch sermons');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setRecentVideos(data.slice(0, 3));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching sermons:', err);
        setLoading(false);
      });
  };

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
      {/* Hero Section - Mobile Optimized */}
      <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden pt-20 bg-[#1a0509]">
        {/* Background Gradient & Effects */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#4a0d18] via-[#2a080d] to-black"></div>
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-church-gold/20 via-transparent to-transparent opacity-60"></div>
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

        {/* Pastor & First Lady Image */}
        <div className={`absolute bottom-0 right-0 z-10 h-[50vh] sm:h-[65vh] md:h-[90vh] w-full md:w-auto flex justify-end items-end transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="hidden md:block absolute top-[20%] right-[-10%] md:right-[10%] w-[400px] h-[400px] md:w-[800px] md:h-[800px] bg-church-gold/30 rounded-full blur-[100px] animate-pulse-slow"></div>

          <img
            src="/images/pastors-hero-transparent.png"
            alt="Pastor & First Lady"
            className="h-full w-auto object-contain object-bottom drop-shadow-2xl relative z-10"
            style={{ filter: 'drop-shadow(0 0 40px rgba(0,0,0,0.5))' }}
          />

          <div className="hidden md:block absolute top-0 right-0 w-full h-full z-20 pointer-events-none mix-blend-soft-light bg-gradient-to-tr from-transparent via-transparent to-white/40 md:to-white/20"></div>
          <div className="hidden md:block absolute top-[10%] right-[10%] w-[300px] h-[300px] bg-church-gold/20 rounded-full blur-[80px] z-20 mix-blend-screen pointer-events-none"></div>

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent md:hidden h-full z-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent md:hidden z-20"></div>
        </div>

        {/* Content Container */}
        <div className="container mx-auto px-6 relative z-20 h-full flex flex-col justify-start md:justify-center pt-10 md:pt-0">
          <div className="max-w-3xl mt-12 md:mt-0">
            {/* Animated Welcome Badge */}
            <div className={`transition-all duration-700 delay-100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 md:px-5 md:py-2 mb-6 sm:mb-8">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-church-gold rounded-full animate-pulse"></div>
                <span className="text-white text-[9px] sm:text-xs font-bold uppercase tracking-widest">Welcome to Anointed Worship Center</span>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-[0.9] md:leading-tight transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              Where <span className="text-transparent bg-clip-text bg-gradient-to-r from-church-gold to-yellow-200">Everybody</span>
              <br />
              Is <span className="text-transparent bg-clip-text bg-gradient-to-r from-church-gold to-yellow-200">Somebody</span>
            </h1>

            {/* Subtitle */}
            <p className={`text-base sm:text-xl md:text-2xl text-white/80 font-light mb-8 md:mb-10 max-w-sm md:max-w-2xl leading-relaxed transition-all duration-700 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              A vibrant community of faith in Grace City. Join us as we grow together in the radical love of Christ.
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 mb-8 md:mb-16 transition-all duration-700 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <Link
                to="/about"
                className="group bg-church-gold hover:bg-white text-white hover:text-church-burgundy px-8 py-3 md:py-4 rounded-full font-bold uppercase tracking-widest text-[10px] md:text-xs transition-all duration-300 shadow-lg hover:shadow-church-gold/50 flex items-center justify-center gap-3"
              >
                Plan Your Visit
                <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
              </Link>
              <button
                onClick={() => {
                  const sermonSection = document.getElementById('sermons-section');
                  if (sermonSection) {
                    sermonSection.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.location.href = '/sermons';
                  }
                }}
                className="group bg-white/5 backdrop-blur-sm border border-white/20 text-white hover:bg-white hover:text-church-burgundy px-8 py-3 md:py-4 rounded-full font-bold uppercase tracking-widest text-[10px] md:text-xs transition-all duration-300 flex items-center justify-center gap-3 hover:shadow-lg"
              >
                <i className="fa-solid fa-play text-[10px]"></i>
                Watch Sermons
              </button>
            </div>

            {/* Quick Stats */}
            <div className={`flex md:grid md:grid-cols-3 gap-6 md:gap-6 max-w-lg transition-all duration-700 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <div className="text-left">
                <div className="text-xl md:text-4xl font-black text-church-gold mb-1">20+</div>
                <div className="text-white/40 text-[9px] md:text-xs uppercase tracking-wider">Years</div>
              </div>
              <div className="text-left">
                <div className="text-xl md:text-4xl font-black text-church-gold mb-1">500+</div>
                <div className="text-white/40 text-[9px] md:text-xs uppercase tracking-wider">Members</div>
              </div>
              <div className="text-left hidden xs:block">
                <div className="text-xl md:text-4xl font-black text-church-gold mb-1">30+</div>
                <div className="text-white/40 text-[9px] md:text-xs uppercase tracking-wider">Ministries</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Service Times & Music Player Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-6xl px-4 z-30">
          <div className="bg-black/60 backdrop-blur-xl rounded-full py-2 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10 shadow-2xl">

            {/* Service Times */}
            <div className="flex items-center gap-6 md:gap-12 w-full md:w-auto justify-center md:justify-start">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-church-gold/20 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-calendar-day text-church-gold text-xs"></i>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-church-gold uppercase tracking-widest">Sun</span>
                  <span className="text-white text-xs font-bold">10 AM</span>
                </div>
              </div>
              <div className="w-px h-6 bg-white/10 hidden md:block"></div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-church-gold/20 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-book-bible text-church-gold text-xs"></i>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-church-gold uppercase tracking-widest">Wed</span>
                  <span className="text-white text-xs font-bold">7 PM</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="hidden lg:flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-church-burgundy transition-all">
                <i className="fa-solid fa-location-dot text-white text-xs group-hover:text-church-burgundy"></i>
              </div>
              <span className="text-[10px] font-bold text-white uppercase tracking-widest group-hover:text-church-gold transition-colors">Get Directions</span>
            </a>

            {/* Music Player */}
            <div className="flex items-center gap-4 bg-white/5 rounded-full px-5 py-1.5 border border-white/10 w-full md:w-auto justify-center">
              <button
                onClick={togglePlay}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md ${isPlaying ? 'bg-white text-church-burgundy' : 'bg-church-gold text-white'}`}
              >
                <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-[10px]`}></i>
              </button>

              <div className="flex flex-col min-w-[120px]">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate max-w-[120px]">
                  {playlist[currentTrack].title}
                </span>
                <div className="flex items-center gap-0.5 h-2">
                  {isPlaying ? (
                    <>
                      <div className="w-0.5 h-1.5 bg-church-gold animate-[bounce_1s_infinite]"></div>
                      <div className="w-0.5 h-2.5 bg-church-gold animate-[bounce_1.2s_infinite]"></div>
                      <div className="w-0.5 h-1 bg-church-gold animate-[bounce_0.8s_infinite]"></div>
                      <span className="text-[8px] text-white/50 font-normal ml-1">Now Playing</span>
                    </>
                  ) : (
                    <span className="text-[8px] text-white/40 font-normal">Paused</span>
                  )}
                </div>
              </div>

              <button
                onClick={nextTrack}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <i className="fa-solid fa-forward text-[8px] text-white"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 animate-bounce hidden lg:block z-30">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/50 rounded-full"></div>
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

      {/* Legacy Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="aspect-video bg-gray-100 rounded-[2rem] overflow-hidden shadow-2xl relative">
                <img
                  src="https://anointedworshipcenter.com/images/new_welcome.png"
                  className="w-full h-full object-cover"
                  alt="Church Ministry"
                />
              </div>
            </div>
            <div className="space-y-10">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-church-burgundy px-6 py-3 rounded-2xl">
                    <p className="text-church-gold text-3xl font-black leading-none">20+</p>
                  </div>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Years of Ministry</p>
                </div>
                <h2 className="text-5xl md:text-6xl font-bold text-church-burgundy serif italic mb-8">
                  Building a legacy of <br />
                  <span className="text-church-gold">faith & purpose.</span>
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed font-light">
                  For over two decades, Anointed Worship Center has been a beacon of light in Grace City. We are a multi-generational, diverse family of believers dedicated to the radical love of Christ and the transformation of our community.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 italic">
                  <h4 className="text-church-gold font-bold uppercase tracking-widest text-[10px] mb-3">Our Vision</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">Empowering every believer through the uncompromising Word of God.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 italic">
                  <h4 className="text-church-gold font-bold uppercase tracking-widest text-[10px] mb-3">Our Mission</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">Transforming lives locally and globally through active service.</p>
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

      {/* Gallery Section */}
      <GallerySection />

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
            {recentVideos.length > 0 ? recentVideos.map((video) => {
              // Extract YouTube video ID for thumbnail
              const videoUrl = video.videoUrl || video.video_url; // Handle both types
              const title = video.title;
              const date = video.publishedAt || video.date;
              const speaker = video.speaker || null;

              const getYouTubeThumbnail = (url?: string) => {
                if (video.thumbnail) return video.thumbnail; // Use provided thumbnail if available
                if (!url) return 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80';
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                const match = url.match(regExp);
                if (match && match[2].length === 11) {
                  return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
                }
                return 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80';
              };

              const formatDate = (dateStr: string) => {
                const date = new Date(dateStr);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              };

              return (
                <div key={video.id || video.url} className="group cursor-pointer" onClick={() => videoUrl && window.open(videoUrl, '_blank')}>
                  <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden mb-6 relative">
                    <img
                      src={getYouTubeThumbnail(videoUrl)}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt={title}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-church-burgundy/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-l-[16px] border-l-church-burgundy border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1"></div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-church-burgundy mb-2 group-hover:text-church-gold transition-colors">{title}</h3>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest italic">
                    {speaker ? `${speaker} • ` : ''}
                    {formatDate(date)}
                  </p>
                </div>
              );
            }) : (
              // Fallback while loading
              [1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-3xl mb-6"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
