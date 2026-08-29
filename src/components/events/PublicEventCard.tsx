import * as React from 'react';
import { useState } from 'react';
import { ChurchEvent } from '../../types';
import EventImageLightbox from './EventImageLightbox';

interface PublicEventCardProps {
  event: ChurchEvent;
  expanded: boolean;
  onToggleDetails: () => void;
}

const PublicEventCard: React.FC<PublicEventCardProps> = ({
  event,
  expanded,
  onToggleDetails,
}) => {
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const dateParts = event.date.split(' ');
  const dayLabel = dateParts[1]?.replace(',', '') || dateParts[0];
  const monthLabel = event.eventDate
    ? new Date(`${event.eventDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short' })
    : dateParts[0];

  return (
    <>
      <article className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 flex flex-col md:flex-row">
        <div className="md:w-1/3 aspect-[4/3] relative group">
          <button
            type="button"
            onClick={() => setImagePreviewOpen(true)}
            className="block w-full h-full cursor-zoom-in"
            aria-label={`View larger image for ${event.title}`}
          >
            <img src={event.imageUrl} className="w-full h-full object-cover" alt={event.title} />
            <span className="absolute inset-0 bg-church-burgundy/0 group-hover:bg-church-burgundy/20 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-church-burgundy text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-full">
                View Image
              </span>
            </span>
          </button>
          <div className="absolute top-6 left-6 bg-white rounded-2xl p-4 shadow-xl text-center min-w-[80px] pointer-events-none">
            <p className="text-church-gold text-2xl font-black leading-none">{dayLabel}</p>
            <p className="text-church-burgundy text-[10px] font-bold uppercase tracking-widest mt-1">
              {monthLabel}
            </p>
          </div>
        </div>

        <div className="md:w-2/3 p-8 md:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-church-gold/10 text-church-gold text-[10px] font-black uppercase tracking-widest rounded-full">
              {event.category}
            </span>
          </div>

          <h3 className="text-3xl md:text-4xl font-bold text-church-burgundy mb-4 serif">{event.title}</h3>
          <p className="text-slate-600 text-lg mb-8 leading-relaxed max-w-2xl">{event.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-clock text-church-gold"></i>
              <span className="text-sm font-bold text-church-burgundy">{event.time}</span>
            </div>
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-location-dot text-church-gold"></i>
              <span className="text-sm font-bold text-church-burgundy">{event.location}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {event.signupUrl ? (
              <a
                href={event.signupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-church-burgundy text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-church-gold transition-all duration-300 shadow-xl"
              >
                Sign Up
              </a>
            ) : null}
            <button
              type="button"
              onClick={onToggleDetails}
              className="text-church-burgundy font-bold uppercase tracking-widest text-xs hover:text-church-gold flex items-center gap-2 transition-all"
            >
              {expanded ? 'Hide Details' : 'Details'}
              <i className={`fa-solid transition-transform duration-300 ${expanded ? 'fa-minus rotate-180' : 'fa-plus'}`}></i>
            </button>
          </div>

          {expanded && (
            <div className="mt-8 pt-8 border-t border-gray-100 animate-slide-down">
              <h4 className="text-xl font-bold text-church-burgundy mb-4 flex items-center gap-2">
                <i className="fa-solid fa-circle-info text-church-gold"></i>
                Event Details
              </h4>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-600">
                <p>
                  <span className="block text-xs font-bold text-church-burgundy uppercase tracking-wider mb-1">
                    Date
                  </span>
                  {event.date}
                </p>
                <p>
                  <span className="block text-xs font-bold text-church-burgundy uppercase tracking-wider mb-1">
                    Category
                  </span>
                  {event.category}
                </p>
              </div>
            </div>
          )}
        </div>
      </article>

      <EventImageLightbox
        imageUrl={event.imageUrl}
        title={event.title}
        isOpen={imagePreviewOpen}
        onClose={() => setImagePreviewOpen(false)}
      />
    </>
  );
};

export default PublicEventCard;
