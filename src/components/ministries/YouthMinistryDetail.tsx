import * as React from 'react';
import { useState } from 'react';

interface YouthMinistryDetailProps {
  onBack: () => void;
  joined: boolean;
  onJoin: (e: React.FormEvent) => void;
}

const PILLARS = [
  { icon: 'fa-book-bible', title: 'Bible Teaching', action: 'Know God' },
  { icon: 'fa-people-group', title: 'Real Community', action: 'Belong' },
  { icon: 'fa-hands-praying', title: 'Worship', action: 'Experience' },
  { icon: 'fa-lightbulb', title: 'Purpose', action: 'Discover' },
  { icon: 'fa-hand-holding-heart', title: 'Service', action: 'Make a Difference' },
] as const;

const ACTIONS = ['Grow', 'Connect', 'Serve', 'Lead'] as const;

const GALLERY = [
  { src: '/images/gallery/church/img-3720.jpg', alt: 'Youth dancers leaping in praise' },
  { src: '/images/gallery/church/img-3705.jpg', alt: 'Youth speaking from the podium' },
  { src: '/images/gallery/church/img-3695.jpg', alt: 'Hands raised in worship' },
  { src: '/images/gallery/church/img-3719.jpg', alt: 'Dance before the cross' },
  { src: '/images/gallery/church/img-3721.jpg', alt: 'Blue flags rising in praise' },
  { src: '/images/gallery/church/img-3703.jpg', alt: 'Powerful ministry moment on stage' },
  { src: '/images/gallery/church/img-3722.jpg', alt: 'Flags in motion during worship' },
  { src: '/images/gallery/church/img-3698.jpg', alt: 'Youth in the Word together' },
] as const;

const HERO_IMAGE = '/images/gallery/church/img-3720.jpg';

const YouthMinistryDetail: React.FC<YouthMinistryDetailProps> = ({ onBack, joined, onJoin }) => {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  return (
    <div className="bg-slate-50 min-h-screen">
      <section className="relative min-h-[78vh] flex items-end overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="AWC Youth Ministry worship and dance"
          className="absolute inset-0 h-full w-full object-cover animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-church-burgundy via-church-burgundy/55 to-church-burgundy/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-church-burgundy/50 via-transparent to-transparent" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 pb-14 md:pb-20 pt-36">
          <button
            type="button"
            onClick={onBack}
            className="mb-10 inline-flex items-center gap-2 text-church-gold font-bold uppercase tracking-[0.3em] text-[10px] hover:text-white transition-colors"
          >
            <i className="fa-solid fa-arrow-left text-xs" />
            Back to Ministries
          </button>

          <p className="text-church-gold font-black uppercase tracking-[0.4em] text-xs mb-4 animate-fade-in">
            Anointed Worship Center
          </p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white leading-[0.95] max-w-4xl animate-slide-up">
            Youth Ministry
          </h1>
          <p className="mt-6 max-w-xl text-lg md:text-xl text-white/80 font-light leading-relaxed animate-fade-in">
            A generation set apart for His glory.
          </p>
          <p className="mt-3 text-sm text-white/55 tracking-[0.2em] uppercase">
            1 Timothy 4:12
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <a
              href="#youth-join"
              className="inline-flex items-center justify-center bg-church-gold hover:bg-white text-church-burgundy px-8 py-4 rounded-full text-xs font-black uppercase tracking-[0.25em] transition-colors"
            >
              Join Youth Ministry
            </a>
            <a
              href="#youth-gallery"
              className="inline-flex items-center justify-center border border-white/30 hover:border-church-gold hover:text-church-gold text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-[0.25em] transition-colors"
            >
              See Conference Photos
            </a>
          </div>
        </div>
      </section>

      <section className="relative -mt-8 z-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto bg-church-gold text-church-burgundy rounded-2xl px-6 py-5 md:px-10 md:py-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-sm md:text-base font-black uppercase tracking-[0.25em] text-center md:text-left">
            Faith · Community · Purpose
          </p>
          <p className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-center md:text-right text-church-burgundy/80">
            {ACTIONS.join('  ·  ')}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-24">
        <div className="max-w-3xl mb-12 md:mb-16">
          <p className="text-church-gold font-black uppercase tracking-[0.35em] text-xs mb-3">
            What We Build
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-church-burgundy leading-tight">
            Five pillars that shape every gathering
          </h2>
          <p className="mt-4 text-slate-600 text-lg font-light leading-relaxed">
            Equipping the next generation with faith, purpose, and community through dynamic worship
            and biblical teaching.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-6">
          {PILLARS.map((pillar, index) => (
            <div
              key={pillar.title}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-church-burgundy text-church-gold">
                <i className={`fa-solid ${pillar.icon}`} aria-hidden="true" />
              </div>
              <h3 className="font-serif text-xl text-church-burgundy">{pillar.title}</h3>
              <p className="mt-2 text-xs font-black uppercase tracking-[0.25em] text-church-gold">
                {pillar.action}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="youth-gallery" className="bg-church-burgundy py-20 md:py-24 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-12">
            <div>
              <p className="text-church-gold font-black uppercase tracking-[0.35em] text-xs mb-3">
                Youth Conference 2026
              </p>
              <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
                Moments from the movement
              </h2>
            </div>
            <p className="text-white/60 max-w-md font-light leading-relaxed">
              Real photos from AWC Youth Conference — worship, dance, teaching, and a generation
              set apart.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {GALLERY.map((photo, index) => (
              <button
                key={photo.src}
                type="button"
                onClick={() => setLightbox(photo)}
                className={`group relative overflow-hidden rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-church-gold ${
                  index === 0 || index === 5 ? 'md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto md:min-h-[320px]' : 'aspect-[4/3]'
                }`}
                aria-label={`View larger: ${photo.alt}`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute inset-0 bg-church-burgundy/0 group-hover:bg-church-burgundy/25 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="youth-join" className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-24 scroll-mt-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 space-y-8">
            <div>
              <p className="text-church-gold font-black uppercase tracking-[0.35em] text-xs mb-3">
                Get Involved
              </p>
              <h2 className="font-serif text-3xl md:text-5xl text-church-burgundy leading-tight">
                Join the Youth Ministry
              </h2>
              <p className="mt-4 text-slate-600 text-lg font-light leading-relaxed">
                Come grow in faith, find community, and discover your purpose with AWC youth.
              </p>
            </div>

            <div className="border-l-4 border-church-gold pl-5">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-church-burgundy mb-2">
                Meeting Schedule
              </p>
              <p className="text-slate-700 text-lg">
                Every 2nd and 4th Saturday · 10:00 AM
              </p>
            </div>

            <div className="flex items-center gap-4">
              <img
                src="/images/paul-n.jpg"
                alt="Paul Njenga"
                className="h-14 w-14 rounded-full object-cover border-2 border-church-gold/40"
              />
              <div>
                <p className="font-serif text-lg text-church-burgundy">Paul Njenga</p>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Youth Minister
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 md:p-10 shadow-xl">
              {joined ? (
                <div className="text-center py-10 animate-fade-in">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white text-2xl">
                    <i className="fa-solid fa-check" />
                  </div>
                  <h3 className="font-serif text-2xl text-church-burgundy mb-2">Welcome to the family</h3>
                  <p className="text-slate-500">A ministry leader will reach out within 48 hours.</p>
                </div>
              ) : (
                <>
                  <h3 className="font-serif text-2xl text-church-burgundy mb-2">Join This Ministry</h3>
                  <p className="text-slate-500 mb-8">
                    Tell us a little about yourself and we will connect you with the youth team.
                  </p>
                  <form onSubmit={onJoin} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-church-gold/30"
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-church-gold/30"
                      />
                    </div>
                    <div className="relative">
                      <select
                        required
                        defaultValue=""
                        className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-600 font-medium focus:outline-none focus:ring-2 focus:ring-church-gold/30"
                      >
                        <option value="" disabled>
                          How did you hear about this ministry?
                        </option>
                        <option value="service">Sunday Service Announcement</option>
                        <option value="social">Social Media (FB/Instagram)</option>
                        <option value="friend">Friend or Family Member</option>
                        <option value="website">Church Website</option>
                        <option value="community">Community Event</option>
                        <option value="other">Other</option>
                      </select>
                      <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-church-gold">
                        <i className="fa-solid fa-chevron-down text-xs" />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-church-burgundy py-4 text-xs font-black uppercase tracking-[0.25em] text-white transition-colors hover:bg-church-gold hover:text-church-burgundy"
                    >
                      Submit Application
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {lightbox && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-church-burgundy/90 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
            aria-label="Close photo"
          />
          <div className="relative z-10 w-full max-w-5xl animate-fade-in">
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white text-xs font-bold uppercase tracking-[0.25em]"
            >
              Close
            </button>
            <img
              src={lightbox.src}
              alt={lightbox.alt}
              className="max-h-[80vh] w-full rounded-2xl object-contain bg-black/40"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default YouthMinistryDetail;
