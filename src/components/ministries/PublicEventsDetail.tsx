import * as React from 'react';
import { useState } from 'react';

interface PublicEventsDetailProps {
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
    icon: 'fa-people-group',
    title: 'Fellowship',
    action: 'Gather Together',
    body: 'Meals, celebrations, and open gatherings where the church and community share life around the table.',
  },
  {
    icon: 'fa-hands-holding-circle',
    title: 'Hospitality',
    action: 'Welcome Everyone',
    body: 'Warm, practical welcome — food, friendship, and a place where everybody is somebody.',
  },
  {
    icon: 'fa-heart',
    title: 'Public Witness',
    action: 'Love in Action',
    body: 'Visible moments of service and joy that share Christ’s love beyond our Sunday walls.',
  },
] as const;

const PHOTO_GALLERY: GalleryItem[] = [
  { id: 'dsc-4806', src: '/images/public-events/dsc-4806.jpg', alt: 'Guests enjoying an AWC public event' },
  { id: 'dsc-4813', src: '/images/public-events/dsc-4813.jpg', alt: 'Community gathering at an AWC event' },
  { id: 'dsc-4815', src: '/images/public-events/dsc-4815.jpg', alt: 'Youth smiling with plates at a community meal' },
  { id: 'dsc-4820', src: '/images/public-events/dsc-4820.jpg', alt: 'Fellowship moment at AWC Public Events' },
  { id: 'dsc-4822', src: '/images/public-events/dsc-4822.jpg', alt: 'Friends sharing a meal together' },
  { id: 'dsc-4827', src: '/images/public-events/dsc-4827.jpg', alt: 'Celebration and hospitality at AWC' },
  { id: 'dsc-4832', src: '/images/public-events/dsc-4832.jpg', alt: 'Families connecting at a public event' },
  { id: 'dsc-4836', src: '/images/public-events/dsc-4836.jpg', alt: 'Outdoor community fellowship' },
  { id: 'dsc-4842', src: '/images/public-events/dsc-4842.jpg', alt: 'Guests gathering for food and fellowship' },
  { id: 'dsc-4852', src: '/images/public-events/dsc-4852.jpg', alt: 'Smiles around the table at AWC' },
  { id: 'dsc-4854', src: '/images/public-events/dsc-4854.jpg', alt: 'Public event hospitality in action' },
  { id: 'dsc-4861', src: '/images/public-events/dsc-4861.jpg', alt: 'Banquet fellowship with the AWC family' },
  { id: 'dsc-4868', src: '/images/public-events/dsc-4868.jpg', alt: 'Community members enjoying the gathering' },
  { id: 'dsc-4872', src: '/images/public-events/dsc-4872.jpg', alt: 'Joyful moment from an AWC public event' },
];

const HERO_IMAGE = '/images/public-events/dsc-4815.jpg';

const PublicEventsDetail: React.FC<PublicEventsDetailProps> = ({ onBack, joined, onJoin }) => {
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  return (
    <div className="bg-slate-50 min-h-screen">
      <section className="relative min-h-[78vh] flex items-end overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="AWC Public Events community gathering"
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
            AWC Public Events
          </h1>
          <p className="mt-6 max-w-xl text-lg md:text-xl text-white/80 font-light leading-relaxed animate-fade-in">
            Open gatherings where faith, food, and fellowship meet the community with joy.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <a
              href="#public-events-join"
              className="inline-flex items-center justify-center bg-church-gold hover:bg-white text-church-burgundy px-8 py-4 rounded-full text-xs font-black uppercase tracking-[0.25em] transition-colors"
            >
              Get Involved
            </a>
            <a
              href="#public-events-gallery"
              className="inline-flex items-center justify-center border border-white/30 hover:border-church-gold hover:text-church-gold text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-[0.25em] transition-colors"
            >
              See the Moments
            </a>
          </div>
        </div>
      </section>

      <section className="relative -mt-8 z-20 px-4 md:px-6">
        <div className="max-w-5xl mx-auto bg-church-gold text-church-burgundy rounded-2xl px-6 py-5 md:px-10 md:py-6 shadow-xl">
          <p className="text-sm md:text-base font-black uppercase tracking-[0.25em] text-center">
            Fellowship · Hospitality · Public Witness
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-24">
        <div className="max-w-3xl mb-12 md:mb-16">
          <p className="text-church-gold font-black uppercase tracking-[0.35em] text-xs mb-3">
            Why We Gather
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-church-burgundy leading-tight">
            Events that welcome the whole community
          </h2>
          <p className="mt-4 text-slate-600 text-lg font-light leading-relaxed">
            From cookouts to shared meals, AWC Public Events create space for neighbors, families, and
            friends to experience the love of Christ together.
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

      <section id="public-events-gallery" className="bg-church-burgundy py-20 md:py-24 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-10 md:mb-12">
            <p className="text-church-gold font-black uppercase tracking-[0.35em] text-xs mb-3">
              Recent Gatherings
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">
              Moments from AWC Public Events
            </h2>
            <p className="mt-4 text-white/60 font-light leading-relaxed">
              Real photos from community meals, celebrations, and open gatherings hosted by Anointed
              Worship Center.
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
                className="group relative aspect-[3/4] overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-church-gold"
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

      <section id="public-events-join" className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-24 scroll-mt-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 space-y-8">
            <div>
              <p className="text-church-gold font-black uppercase tracking-[0.35em] text-xs mb-3">
                Get Involved
              </p>
              <h2 className="font-serif text-3xl md:text-5xl text-church-burgundy leading-tight">
                Serve with Public Events
              </h2>
              <p className="mt-4 text-slate-600 text-lg font-light leading-relaxed">
                Help host, serve, welcome guests, or support setup — and be part of gatherings that
                bless our neighbors.
              </p>
            </div>

            <div className="border-l-4 border-church-gold pl-5">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-church-burgundy mb-2">
                Event Rhythm
              </p>
              <p className="text-slate-700 text-lg">
                Seasonal gatherings · Community meals · Special celebrations as announced
              </p>
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
                    Tell us a little about yourself and we will connect you with the public events team.
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

export default PublicEventsDetail;
