import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { MediaItem } from '../../data/galleryData';
import { allChurchMedia, isNativeVideoUrl } from '../../data/churchMedia';
import MediaCarousel from '../../components/gallery/MediaCarousel';

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
  return LEGACY_PROMO_URL_SNIPPETS.some(
    (snippet) => url.includes(snippet) || thumb.includes(snippet)
  );
}

const Gallery: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [galleryItems, setGalleryItems] = useState<MediaItem[]>(allChurchMedia);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch('/api/gallery');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const apiItems: MediaItem[] = Array.isArray(data) ? data : [];
        const seen = new Set(allChurchMedia.map((item) => item.url));
        const extraFromApi = apiItems.filter(
          (item) => !seen.has(item.url) && !isLegacyPromoItem(item)
        );
        setGalleryItems([...allChurchMedia, ...extraFromApi]);
      } catch (err) {
        console.error('Error fetching gallery:', err);
        setGalleryItems(allChurchMedia);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const photos = galleryItems.filter((item) => item.type === 'image');
  const videos = galleryItems.filter((item) => item.type === 'video');

  const showPhotos = filter === 'all' || filter === 'image';
  const showVideos = filter === 'all' || filter === 'video';

  return (
    <div className="min-h-screen bg-gray-50 pt-28 md:pt-32 pb-16 md:pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-10">
          <span className="text-church-gold font-bold tracking-[0.35em] uppercase text-[10px] mb-3 block">
            Visual Journey
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-church-burgundy mb-3 serif leading-tight">
            Gallery
          </h1>
          <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
            Witness the beauty of our church family, worship, and community through the lens.
          </p>
        </div>

        <div className="flex justify-center mb-8 md:mb-10">
          <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            {([
              { key: 'all', label: 'All' },
              { key: 'image', label: 'Photos' },
              { key: 'video', label: 'Videos' },
            ] as const).map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setFilter(option.key)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] transition-colors ${
                  filter === option.key
                    ? 'bg-church-burgundy text-white'
                    : 'text-slate-500 hover:text-church-burgundy'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-300">
            <Loader2 className="animate-spin mb-3" size={28} />
            <p className="text-[10px] font-bold uppercase tracking-widest">Loading gallery…</p>
          </div>
        ) : (
          <>
            {showPhotos && (
              <MediaCarousel title="Photos" items={photos} onSelect={setSelectedMedia} />
            )}
            {showVideos && (
              <MediaCarousel title="Videos" items={videos} onSelect={setSelectedMedia} />
            )}
            {((showPhotos && photos.length === 0) || !showPhotos) &&
              ((showVideos && videos.length === 0) || !showVideos) && (
                <p className="text-center text-slate-400 text-sm py-12">No media in this filter yet.</p>
              )}
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-church-burgundy/90 backdrop-blur-sm p-4"
          >
            <button
              type="button"
              aria-label="Close"
              className="absolute inset-0"
              onClick={() => setSelectedMedia(null)}
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative z-10 w-full max-w-5xl overflow-hidden rounded-2xl bg-black shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center"
              >
                <X size={18} />
              </button>

              <div className="aspect-video bg-black flex items-center justify-center relative">
                {selectedMedia.type === 'video' ? (
                  isNativeVideoUrl(selectedMedia.url) ? (
                    <video
                      key={selectedMedia.id}
                      src={selectedMedia.url}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full absolute inset-0 bg-black"
                      poster={selectedMedia.thumbnail}
                    />
                  ) : (
                    <iframe
                      src={selectedMedia.url}
                      className="w-full h-full absolute inset-0"
                      title={selectedMedia.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                ) : (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.title}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <div className="p-5 md:p-6 bg-church-burgundy border-t border-white/10">
                <p className="text-church-gold font-bold uppercase tracking-[0.2em] text-[10px] mb-1">
                  {selectedMedia.category}
                </p>
                <h2 className="text-white text-xl md:text-2xl font-bold serif">{selectedMedia.title}</h2>
                {selectedMedia.description && (
                  <p className="text-white/65 text-sm mt-2">{selectedMedia.description}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
