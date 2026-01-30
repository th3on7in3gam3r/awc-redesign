import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SERVICE_TIMES } from '../../constants';

const Home: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sermons, setSermons] = useState<any[]>([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const playlist = [
    {
      title: "Everybody Is Somebody",
      url: "https://anointedworshipcenter.com/music/Everybody_Is_Somebody.mp3"
    },
    {
      title: "Reign in This House",
      url: "https://anointedworshipcenter.com/music/Reign_in_This_House_2.mp3"
    }
  ];

  useEffect(() => {
    setIsVisible(true);

    // Fetch latest sermons from API
    fetch('/api/sermons?published=true')
      .then(res => res.json())
      .then(data => setSermons(data.slice(0, 3))) // Get top 3 latest
      .catch(err => console.error('Error fetching sermons:', err));
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
    console.log('Toggle play clicked. Audio element:', audio);
    console.log('Current track:', playlist[currentTrack]);

    if (!audio) {
      console.error('Audio element not found!');
      return;
    }

    try {
      if (isPlaying) {
        console.log('Pausing audio...');
        audio.pause();
        setIsPlaying(false);
      } else {
        console.log('Attempting to play audio from:', audio.src);
        await audio.play();
        console.log('Audio playing successfully!');
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
        audio.play().catch(err => {
          console.error('Error playing next track:', err);
          setIsPlaying(false);
        });
      }
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/home-hero.jpg"
            className="w-full h-full object-cover"
            style={{ objectPosition: '40% center' }}
            alt="AWC Leadership"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/10"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-center h-full">
          <div className={`w-full flex justify-center transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-[280px] sm:mt-[400px] md:mt-[500px] lg:mt-[630px]">
              <button className="bg-church-gold hover:bg-white text-white hover:text-church-burgundy px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-all duration-300">
                Plan Your Visit →
              </button>
              <button className="bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-church-burgundy px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-all duration-300">
                Watch Sermons
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6">
          <div className="bg-black/40 backdrop-blur-xl rounded-full p-4 flex flex-col md:flex-row items-center justify-between border border-white/10">
            <div className="flex gap-8 px-6">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-[8px] font-bold text-church-gold uppercase tracking-widest mb-1">Sundays</span>
                <span className="text-white text-xs font-bold">10:00 AM <span className="text-white/40 font-normal">| MORNING WORSHIP</span></span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span className="text-[8px] font-bold text-church-gold uppercase tracking-widest mb-1">Wednesdays</span>
                <span className="text-white text-xs font-bold">7:00 PM <span className="text-white/40 font-normal">| BIBLE STUDY</span></span>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/5 rounded-full px-6 py-2 mt-4 md:mt-0">
              <button
                onClick={togglePlay}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-white text-church-burgundy' : 'bg-church-gold text-white'}`}
              >
                <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-[10px]`}></i>
              </button>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                  {playlist[currentTrack].title}
                </span>
                <span className="text-[8px] text-white/30 font-normal italic">
                  {isPlaying ? 'NOW PLAYING' : 'PAUSED'}
                </span>
              </div>
              <button
                onClick={nextTrack}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all ml-2"
              >
                <i className="fa-solid fa-forward text-[8px] text-white"></i>
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

      {/* Recent Messages Section */}
      <section className="py-24 bg-white">
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
            {sermons.length > 0 ? sermons.map((sermon) => {
              // Extract YouTube video ID for thumbnail
              const getYouTubeThumbnail = (url?: string) => {
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
                <div key={sermon.id} className="group cursor-pointer" onClick={() => sermon.video_url && window.open(sermon.video_url, '_blank')}>
                  <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden mb-6 relative">
                    <img
                      src={getYouTubeThumbnail(sermon.video_url)}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt={sermon.title}
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
                  <h3 className="text-2xl font-bold text-church-burgundy mb-2 group-hover:text-church-gold transition-colors">{sermon.title}</h3>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest italic">{sermon.speaker} • {formatDate(sermon.preached_at)}</p>
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
