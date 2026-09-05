import * as React from 'react';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import type { MediaItem } from '../../data/galleryData';

interface MediaCarouselProps {
  title: string;
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
}

const CARD_SCROLL_PX = 260;

const MediaCarousel: React.FC<MediaCarouselProps> = ({ title, items, onSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scrollBy = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <section className="w-full mb-10 md:mb-12">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-church-burgundy serif shrink-0">{title}</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-church-gold/40 to-transparent" />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => scrollBy(-CARD_SCROLL_PX)}
            className="h-8 w-8 rounded-full border border-slate-200 bg-white text-church-burgundy hover:bg-church-burgundy hover:text-white transition-colors flex items-center justify-center"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(CARD_SCROLL_PX)}
            className="h-8 w-8 rounded-full border border-slate-200 bg-white text-church-burgundy hover:bg-church-burgundy hover:text-white transition-colors flex items-center justify-center"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            className="group w-[220px] md:w-[240px] flex-none snap-start text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-church-gold/50 rounded-2xl"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-sm">
              <img
                src={item.thumbnail || item.url}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-church-burgundy shadow-sm">
                    <Play size={14} fill="currentColor" className="ml-0.5" />
                  </div>
                </div>
              )}
              <div className="absolute top-2.5 left-2.5">
                <span className="rounded-md bg-white/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-church-burgundy">
                  {item.category}
                </span>
              </div>
            </div>
            <div className="pt-2.5 px-0.5">
              <h3 className="text-sm font-bold text-church-burgundy serif leading-snug line-clamp-2">
                {item.title}
              </h3>
              {item.description && (
                <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{item.description}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default MediaCarousel;
