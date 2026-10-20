import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { MediaItem } from '../../data/galleryData';
import { isNativeVideoUrl } from '../../data/churchMedia';

interface LightboxProps {
  items: MediaItem[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
}

const SWIPE_THRESHOLD_PX = 50;

function preload(item?: MediaItem) {
  if (!item || item.type !== 'image') return;
  const img = new Image();
  img.src = item.url;
}

/**
 * Shows the (already cached) thumbnail instantly, then fades the full-size photo
 * in on top once it has downloaded — no blank frame, no pop.
 */
const PhotoStage: React.FC<{ item: MediaItem }> = ({ item }) => {
  const fullRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Cached images can finish before React attaches onLoad.
    if (fullRef.current?.complete && fullRef.current.naturalWidth > 0) setLoaded(true);
  }, []);

  const ratio = item.width && item.height ? `${item.width} / ${item.height}` : undefined;
  const alt = item.description || item.title;

  return (
    <div
      className="relative max-h-full max-w-full"
      style={ratio ? { aspectRatio: ratio, height: '100%' } : undefined}
    >
      {item.thumbnail && item.thumbnail !== item.url && (
        <img
          src={item.thumbnail}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain select-none"
          draggable={false}
        />
      )}
      <img
        ref={fullRef}
        src={item.url}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`relative h-full w-full max-h-full max-w-full object-contain select-none transition-opacity duration-200 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        draggable={false}
      />
    </div>
  );
};

const Lightbox: React.FC<LightboxProps> = ({ items, index, onIndexChange }) => {
  const reduceMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  const isOpen = index !== null && items[index] !== undefined;
  const item = isOpen ? items[index as number] : null;
  const total = items.length;

  const close = useCallback(() => onIndexChange(null), [onIndexChange]);
  const step = useCallback(
    (delta: number) => {
      if (index === null || total === 0) return;
      onIndexChange((index + delta + total) % total);
    },
    [index, total, onIndexChange]
  );

  // Focus management + scroll lock while open.
  useEffect(() => {
    if (!isOpen) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const { body } = document;
    const previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    // Keep the page from shifting sideways when the scrollbar disappears.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
      returnFocusRef.current?.focus?.({ preventScroll: true });
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close, step]);

  // Warm up the neighbours so arrowing through feels instant.
  useEffect(() => {
    if (index === null || total < 2) return;
    preload(items[(index + 1) % total]);
    preload(items[(index - 1 + total) % total]);
  }, [index, items, total]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > SWIPE_THRESHOLD_PX) step(dx < 0 ? 1 : -1);
  };

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title}, ${(index as number) + 1} of ${total}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.15 }}
          className="fixed inset-0 z-[100] flex flex-col bg-[#1C0101] text-white"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex items-center justify-between px-4 md:px-6 h-16 shrink-0">
            <p className="text-sm text-white/60 tabular-nums" aria-live="polite">
              {(index as number) + 1} of {total}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close"
              className="h-10 w-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-church-gold"
            >
              <X size={22} />
            </button>
          </div>

          <div className="relative flex-1 min-h-0 flex items-center justify-center px-2 md:px-20">
            {total > 1 && (
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous"
                className="absolute left-2 md:left-5 z-10 h-11 w-11 rounded-full flex items-center justify-center bg-black/30 md:bg-transparent text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-church-gold"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            <div key={item.id} className="h-full w-full flex items-center justify-center">
              {item.type === 'video' ? (
                isNativeVideoUrl(item.url) ? (
                  <video
                    src={item.url}
                    poster={item.thumbnail}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-full max-w-full rounded-sm bg-black"
                  />
                ) : (
                  <iframe
                    src={item.url}
                    title={item.title}
                    className="w-full max-w-5xl aspect-video rounded-sm"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )
              ) : (
                <PhotoStage item={item} />
              )}
            </div>

            {total > 1 && (
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next"
                className="absolute right-2 md:right-5 z-10 h-11 w-11 rounded-full flex items-center justify-center bg-black/30 md:bg-transparent text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-church-gold"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>

          <div className="shrink-0 px-5 md:px-6 py-4 md:py-5 text-center">
            {item.credit ? (
              <p className="text-sm text-white/70">
                Photo by {item.credit.name}.{' '}
                <a
                  href={item.credit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-church-gold hover:text-church-gold-light underline underline-offset-4 decoration-church-gold/40"
                >
                  See the full collection
                </a>
              </p>
            ) : (
              <>
                <p className="serif text-lg md:text-xl text-white">{item.title}</p>
                {item.description && (
                  <p className="mt-1 text-sm text-white/60 max-w-xl mx-auto">{item.description}</p>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Lightbox;
