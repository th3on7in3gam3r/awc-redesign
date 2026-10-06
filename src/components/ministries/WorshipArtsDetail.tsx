import * as React from 'react';
import { useState } from 'react';

interface WorshipArtsDetailProps {
  onBack: () => void;
  joined: boolean;
  onJoin: (e: React.FormEvent) => void;
}

type GalleryItem = {
  id: string;
  src: string;
  alt: string;
};

const PILLARS = [
  {
    icon: 'fa-music',
    title: 'Music',
    action: 'Lead Worship',
    body: 'Vocals, instruments, and arrangements that invite the room into God’s presence.',
  },
  {
    icon: 'fa-person-walking',
    title: 'Dance',
    action: 'Move in Praise',
    body: 'Expressive movement that tells the story of faith with beauty and excellence.',
  },
  {
    icon: 'fa-palette',
    title: 'Creative Expression',
    action: 'Glorify His Name',
    body: 'Tech, media, and creative gifts that support worship with clarity and excellence.',
  },
] as const;

const PHOTO_GALLERY: GalleryItem[] = [
  { id: 'dsc-6118', src: '/images/worship/dsc-6118.jpg', alt: 'Worship vocalists leading from the stage' },
  { id: 'dsc-6110', src: '/images/worship/dsc-6110.jpg', alt: 'Production team serving from the tech booth' },
  { id: 'dsc-6113', src: '/images/worship/dsc-6113.jpg', alt: 'Band leading worship on stage' },
  { id: 'dsc-6115', src: '/images/worship/dsc-6115.jpg', alt: 'Worship Arts musicians in service' },
  { id: 'dsc-6116', src: '/images/worship/dsc-6116.jpg', alt: 'Keys and vocals during worship' },
  { id: 'dsc-6119', src: '/images/worship/dsc-6119.jpg', alt: 'Stage worship moment' },
  { id: 'dsc-6120', src: '/images/worship/dsc-6120.jpg', alt: 'Live worship set at AWC' },
  { id: 'dsc-6121', src: '/images/worship/dsc-6121.jpg', alt: 'Bass and keys during worship' },
  { id: 'dsc-6122', src: '/images/worship/dsc-6122.jpg', alt: 'Musicians serving together' },
  { id: 'dsc-6123', src: '/images/worship/dsc-6123.jpg', alt: 'Worship team on the platform' },
  { id: 'dsc-6111', src: '/images/worship/dsc-6111.jpg', alt: 'Behind the scenes with the worship team' },
  { id: 'dsc-6112', src: '/images/worship/dsc-6112.jpg', alt: 'Preparing and leading in worship' },
];

const HERO_IMAGE = '/images/worship/dsc-6118.jpg';

const WorshipArtsDetail: React.FC<WorshipArtsDetailProps> = ({ onBack, joined, onJoin }) => {
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  return (
    <div className="bg-slate-50 min-h-screen">
      <section className="relative min-h-[78vh] flex items-end overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="AWC Worship Arts team leading from the stage"
          className="absolute inset-0 h-full w-full object-cover animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-church-burgundy via-church-burgundy/55 to-church-burgundy/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-church-burgundy/55 via-transparent to-transparent" />

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
            Worship Arts
          </h1>
          <p className="mt-6 max-w-xl text-lg md:text-xl text-white/80 font-light leading-relaxed animate-fade-in">
            Ushering in the presence of God through music, dance, and creative expression.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <a
              href="#worship-join"
              className="inline-flex items-center justify-center bg-church-gold hover:bg-white text-church-burgundy px-8 py-4 rounded-full text-xs font-black uppercase tracking-[0.25em] transition-colors"
            >
              Join Worship Arts
            </a>
            <a
              href="#worship-gallery"
              className="inline-flex items-center justify-center border border-white/30 hover:border-church-gold hover:text-church-gold text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-[0.25em] transition-colors"
            >
              See the Team
            </a>
          </div>
        </div>
      </section>

      <section className="relative -mt-8 z-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto bg-church-gold text-church-burgundy rounded-2xl px-6 py-5 md:px-10 md:py-6 shadow-xl">
          <p className="text-sm md:text-base font-black uppercase tracking-[0.25em] text-center">
            Music · Dance · Creative Expression
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-24">
        <div className="max-w-3xl mb-12 md:mb-16">
          <p className="text-church-gold font-black uppercase tracking-[0.35em] text-xs mb-3">
            How We Serve
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-church-burgundy leading-tight">
            Three ways we glorify His name
          </h2>
          <p className="mt-4 text-slate-600 text-lg font-light leading-relaxed">
            Whether you sing, play, dance, or serve behind the scenes, there is a place for your gift
            in Worship Arts.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 md:gap-8">
          {PILLARS.map((pillar, index) => (
            <div
              key={pillar.title}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-church-burgundy text-church-gold">
                <i className={`fa-solid ${pillar.icon}`} aria-hidden="true" />
              </div>
              <h3 className="font-serif text-2xl text-church-burgundy">{pillar.title}</h3>
              <p className="mt-2 text-xs font-black uppercase tracking-[0.25em] text-church-gold">
                {pillar.action}
              </p>
              <p className="mt-3 text-slate-600 leading-relaxed">{pillar.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="worship-gallery" className="bg-church-burgundy py-20 md:py-24 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-10 md:mb-12">
            <p className="text-church-gold font-black uppercase tracking-[0.35em] text-xs mb-3">
              In the House
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
              Moments from worship
            </h2>
            <p className="mt-4 text-white/60 font-light leading-relaxed">
              Real photos of AWC Worship Arts — stage, sound, and the team that helps the church
              encounter God.
            </p>
          </div>

          <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-3">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/70">Photos</h3>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
              {PHOTO_GALLERY.length} images
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {PHOTO_GALLERY.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLightbox(item)}
                className="group relative aspect-[16/10] overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-church-gold"
                aria-label={`View larger: ${item.alt}`}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="worship-join" className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-24 scroll-mt-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 space-y-8">
            <div>
              <p className="text-church-gold font-black uppercase tracking-[0.35em] text-xs mb-3">
                Get Involved
              </p>
              <h2 className="font-serif text-3xl md:text-5xl text-church-burgundy leading-tight">
                Join Worship Arts
              </h2>
              <p className="mt-4 text-slate-600 text-lg font-light leading-relaxed">
                Bring your voice, instrument, dance, or technical gift and help lead the church in
                worship.
              </p>
            </div>

            <div className="border-l-4 border-church-gold pl-5">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-church-burgundy mb-2">
                Meeting Schedule
              </p>
              <p className="text-slate-700 text-lg">
                Sundays during worship · Rehearsals as announced
              </p>
            </div>

            <div className="flex items-center gap-4">
              <img
                src="/images/joelk.jpeg"
                alt="Joel Kiwanuka"
                className="h-14 w-14 rounded-full object-cover border-2 border-church-gold/40"
              />
              <div>
                <p className="font-serif text-lg text-church-burgundy">Joel Kiwanuka</p>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Music Director
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
                    Tell us a little about yourself and we will connect you with the worship team.
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
            <div className="overflow-hidden rounded-2xl bg-black shadow-2xl">
              <img
                src={lightbox.src}
                alt={lightbox.alt}
                className="max-h-[80vh] w-full object-contain bg-black/40"
              />
            </div>
            <p className="mt-4 text-center text-sm text-white/70">{lightbox.alt}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorshipArtsDetail;
