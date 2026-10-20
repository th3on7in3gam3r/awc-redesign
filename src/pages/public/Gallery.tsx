import { useEffect, useMemo, useState } from 'react';
import { Play } from 'lucide-react';
import type { MediaItem } from '../../data/galleryData';
import { churchPhotos, churchVideos } from '../../data/churchMedia';
import {
  loadPixiesetPhotos,
  pixiesetSnapshotPhotos,
  PIXIESET_CREDIT,
  PIXIESET_GALLERY_URL,
  PIXIESET_HERO_KEYS,
} from '../../data/pixieset';
import Lightbox from '../../components/gallery/Lightbox';

/** Old promotional / ministry graphic assets — not real church event photography */
const LEGACY_PROMO_URL_SNIPPETS = [
  '/images/home-hero',
  '/images/mens-ministry',
  '/images/womens-ministry',
  '/images/youth-ministry',
  '/images/children-ministry',
  '/images/worship-arts',
  '/images/community-outreach',
  '/images/awc-welcome',
  'youtube.com/embed/dQw4w9WgXcQ',
];

function isLegacyPromoItem(item: MediaItem): boolean {
  const url = item.url || '';
  const thumb = item.thumbnail || '';
  return LEGACY_PROMO_URL_SNIPPETS.some((s) => url.includes(s) || thumb.includes(s));
}

type FilterKey = 'all' | 'leah' | 'church' | 'video';

const PAGE_SIZE = 36;

const Gallery: React.FC = () => {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [leahPhotos, setLeahPhotos] = useState<MediaItem[]>(pixiesetSnapshotPhotos);
  const [uploads, setUploads] = useState<MediaItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Leah's Pixieset collection (live sync, snapshot fallback).
  useEffect(() => {
    let cancelled = false;
    loadPixiesetPhotos().then((items) => {
      if (!cancelled) setLeahPhotos(items);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Anything staff uploaded through the admin gallery.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/gallery')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;
        const known = new Set([...churchPhotos, ...churchVideos].map((i) => i.url));
        setUploads(
          (data as MediaItem[]).filter((i) => i?.url && !known.has(i.url) && !isLegacyPromoItem(i))
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const churchMoments = useMemo(
    () => [...churchPhotos, ...uploads.filter((i) => i.type === 'image')],
    [uploads]
  );
  const videos = useMemo(
    () => [...churchVideos, ...uploads.filter((i) => i.type === 'video')],
    [uploads]
  );

  const filters: { key: FilterKey; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: leahPhotos.length + churchMoments.length + videos.length },
    { key: 'leah', label: `Photography by ${PIXIESET_CREDIT}`, count: leahPhotos.length },
    { key: 'church', label: 'Church moments', count: churchMoments.length },
    { key: 'video', label: 'Videos', count: videos.length },
  ];

  const showVideoStrip = filter === 'all' && videos.length > 0;
  const wallItems = useMemo<MediaItem[]>(() => {
    switch (filter) {
      case 'leah':
        return leahPhotos;
      case 'church':
        return churchMoments;
      case 'video':
        return videos;
      default:
        return [...leahPhotos, ...churchMoments];
    }
  }, [filter, leahPhotos, churchMoments, videos]);

  // The lightbox walks through exactly what's on screen, in on-screen order.
  const lightboxItems = useMemo(
    () => (showVideoStrip ? [...videos, ...wallItems] : wallItems),
    [showVideoStrip, videos, wallItems]
  );
  const wallOffset = showVideoStrip ? videos.length : 0;

  const visibleWall = wallItems.slice(0, visibleCount);
  const remaining = wallItems.length - visibleWall.length;

  const heroPhotos = useMemo(() => {
    const byKey = new Map(leahPhotos.map((p) => [p.id.replace('pixieset-', ''), p]));
    const picked = PIXIESET_HERO_KEYS.map((k) => byKey.get(k)).filter(Boolean) as MediaItem[];
    return picked.length === 4 ? picked : leahPhotos.slice(0, 4);
  }, [leahPhotos]);

  const chooseFilter = (key: FilterKey) => {
    setFilter(key);
    setVisibleCount(PAGE_SIZE);
  };

  const openFromWall = (i: number) => setLightboxIndex(wallOffset + i);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-church-burgundy-dark text-white pt-[72px]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-10 md:pb-14 grid gap-8 lg:gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-end">
          <div className="max-w-md">
            <h1 className="serif text-5xl md:text-7xl leading-[0.95] tracking-tight">Gallery</h1>
            <p className="mt-5 text-base md:text-lg text-white/75 leading-relaxed font-light">
              Worship, fellowship and family life at Anointed Worship Center. New photos from {PIXIESET_CREDIT}'s
              collection appear here as soon as she adds them.
            </p>
            <a
              href={PIXIESET_GALLERY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block text-sm text-church-gold hover:text-church-gold-light underline underline-offset-4 decoration-church-gold/40"
            >
              Order prints from {PIXIESET_CREDIT}'s gallery
            </a>
          </div>

          {heroPhotos.length === 4 && (
            <div className="grid grid-cols-6 grid-rows-[repeat(2,minmax(0,1fr))] gap-2 md:gap-3 h-[300px] sm:h-[380px] md:h-[440px]">
              {heroPhotos.map((photo, i) => {
                const layout = [
                  'col-span-4 row-span-1',
                  'col-span-2 row-span-2',
                  'col-span-2 row-span-1',
                  'col-span-2 row-span-1',
                ][i];
                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => {
                      setFilter('leah');
                      setVisibleCount(PAGE_SIZE);
                      setLightboxIndex(Math.max(0, leahPhotos.indexOf(photo)));
                    }}
                    className={`${layout} relative overflow-hidden rounded-md bg-church-burgundy focus:outline-none focus-visible:ring-2 focus-visible:ring-church-gold`}
                    aria-label={`Open photo ${i + 1} from ${PIXIESET_CREDIT}'s collection`}
                  >
                    <img
                      src={photo.url}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      fetchPriority={i === 0 ? 'high' : 'auto'}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-[72px] z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div
          role="tablist"
          aria-label="Filter gallery"
          className="max-w-7xl mx-auto px-4 md:px-6 flex gap-6 md:gap-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {filters.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => chooseFilter(f.key)}
                className={`relative shrink-0 py-4 text-sm md:text-[15px] transition-colors focus:outline-none focus-visible:text-church-burgundy ${
                  active ? 'text-church-burgundy font-semibold' : 'text-slate-500 hover:text-church-burgundy'
                }`}
              >
                {f.label}
                <span className="ml-1.5 text-xs tabular-nums text-slate-400">{f.count}</span>
                <span
                  className={`absolute left-0 right-0 -bottom-px h-[3px] rounded-full ${
                    active ? 'bg-church-gold' : 'bg-transparent'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14">
        {/* Videos strip (All view only) */}
        {showVideoStrip && (
          <section className="mb-12 md:mb-16" aria-labelledby="gallery-videos">
            <div className="flex items-baseline justify-between mb-4">
              <h2 id="gallery-videos" className="serif text-2xl md:text-3xl text-church-burgundy">
                Videos
              </h2>
              <button
                type="button"
                onClick={() => chooseFilter('video')}
                className="text-sm text-slate-500 hover:text-church-burgundy underline-offset-4 hover:underline"
              >
                See all {videos.length}
              </button>
            </div>
            <div className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {videos.map((video, i) => (
                <VideoCard key={video.id} item={video} onOpen={() => setLightboxIndex(i)} className="w-[240px] md:w-[280px] shrink-0 snap-start" />
              ))}
            </div>
          </section>
        )}

        {showVideoStrip && (
          <h2 className="serif text-2xl md:text-3xl text-church-burgundy mb-4">Photos</h2>
        )}

        {wallItems.length === 0 ? (
          <p className="text-center text-slate-500 py-20">
            Nothing here yet. Photos added in the admin gallery will show up in this section.
          </p>
        ) : filter === 'video' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleWall.map((video, i) => (
              <VideoCard key={video.id} item={video} onOpen={() => openFromWall(i)} />
            ))}
          </div>
        ) : (
          <div className="columns-2 md:columns-3 xl:columns-4 gap-2 md:gap-3">
            {visibleWall.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => openFromWall(i)}
                className="group mb-2 md:mb-3 block w-full break-inside-avoid overflow-hidden rounded-md bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-church-gold focus-visible:ring-offset-2"
                style={{ aspectRatio: photo.width && photo.height ? `${photo.width} / ${photo.height}` : '4 / 5' }}
                aria-label={photo.credit ? `Open photo by ${photo.credit.name}` : `Open ${photo.title}`}
              >
                <img
                  src={photo.thumbnail || photo.url}
                  alt={photo.credit ? '' : photo.description || photo.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                />
              </button>
            ))}
          </div>
        )}

        {remaining > 0 && (
          <div className="mt-10 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
              className="rounded-full bg-church-burgundy px-7 py-3 text-sm font-semibold text-white hover:bg-church-burgundy-light focus:outline-none focus-visible:ring-2 focus-visible:ring-church-gold focus-visible:ring-offset-2"
            >
              Show more photos
            </button>
            <p className="text-xs text-slate-400 tabular-nums">
              Showing {visibleWall.length} of {wallItems.length}
            </p>
          </div>
        )}
      </div>

      <Lightbox items={lightboxItems} index={lightboxIndex} onIndexChange={setLightboxIndex} />
    </div>
  );
};

const VideoCard: React.FC<{ item: MediaItem; onOpen: () => void; className?: string }> = ({
  item,
  onOpen,
  className = '',
}) => (
  <button
    type="button"
    onClick={onOpen}
    className={`group text-left focus:outline-none ${className}`}
    aria-label={`Play video: ${item.title}`}
  >
    <div className="relative aspect-video overflow-hidden rounded-md bg-church-burgundy-dark group-focus-visible:ring-2 group-focus-visible:ring-church-gold group-focus-visible:ring-offset-2">
      {item.thumbnail && (
        <img
          src={item.thumbnail}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
        />
      )}
      <span className="absolute left-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-church-burgundy shadow">
        <Play size={15} fill="currentColor" className="ml-0.5" />
      </span>
    </div>
    <p className="mt-2 serif text-base text-church-burgundy leading-snug">{item.title}</p>
    {item.description && <p className="text-sm text-slate-500 line-clamp-1">{item.description}</p>}
  </button>
);

export default Gallery;
