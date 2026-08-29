import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { EVENTS } from '../../constants';
import { ChurchEvent } from '../../types';
import PublicEventsCalendar from '../../components/events/PublicEventsCalendar';
import PublicEventCard from '../../components/events/PublicEventCard';
import EventImageLightbox from '../../components/events/EventImageLightbox';
import { fetchVaultEvents, getMonthDisplayEvents, getPublicDisplayEvents } from '../../services/vaultEventsService';

type ViewMode = 'list' | 'calendar';

const Events: React.FC = () => {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const eventsPerPage = 6;

  useEffect(() => {
    let active = true;

    fetchVaultEvents()
      .then((vaultEvents) => {
        if (!active) return;
        setEvents(vaultEvents);
        setUsingFallback(false);

        const display = getPublicDisplayEvents(vaultEvents);
        if (display[0]?.eventDate) {
          const [year, month] = display[0].eventDate.split('-').map(Number);
          setCalendarDate(new Date(year, month - 1, 1));
        }
      })
      .catch(() => {
        if (!active) return;
        setEvents(EVENTS);
        setUsingFallback(true);

        const display = getPublicDisplayEvents(EVENTS);
        if (display[0]?.eventDate) {
          const [year, month] = display[0].eventDate.split('-').map(Number);
          setCalendarDate(new Date(year, month - 1, 1));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const displayEvents = useMemo(() => getPublicDisplayEvents(events), [events]);
  const calendarEvents = useMemo(
    () => getMonthDisplayEvents(events, calendarDate),
    [events, calendarDate],
  );

  const totalPages = Math.max(1, Math.ceil(displayEvents.length / eventsPerPage));
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = displayEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleEventDetails = (eventId: string) => {
    setExpandedEvents((prev) => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  return (
    <div className="pt-52 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-church-gold font-bold tracking-[0.3em] uppercase text-xs">Mark Your Calendar</span>
          <h1 className="text-5xl font-bold text-church-burgundy mt-4 serif">Upcoming Gatherings</h1>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
            {usingFallback
              ? 'Showing featured events while we reconnect to AWC Vault.'
              : 'Live church calendar synced from AWC Vault.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
              viewMode === 'list'
                ? 'bg-church-gold text-church-burgundy'
                : 'bg-white text-church-burgundy border border-gray-200 hover:border-church-gold'
            }`}
          >
            List View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
              viewMode === 'calendar'
                ? 'bg-church-gold text-church-burgundy'
                : 'bg-white text-church-burgundy border border-gray-200 hover:border-church-gold'
            }`}
          >
            Calendar View
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-church-gold rounded-full animate-spin"></div>
          </div>
        ) : viewMode === 'calendar' ? (
          <PublicEventsCalendar
            events={calendarEvents}
            currentDate={calendarDate}
            onMonthChange={setCalendarDate}
            onSelectEvent={setSelectedEvent}
          />
        ) : (
          <>
            <p className="text-center text-slate-500 mb-8">
              Showing {displayEvents.length === 0 ? 0 : indexOfFirstEvent + 1}-
              {Math.min(indexOfLastEvent, displayEvents.length)} of {displayEvents.length} upcoming events
            </p>

            {displayEvents.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-xl">
                <p className="text-church-burgundy font-bold text-xl serif mb-2">No upcoming events yet</p>
                <p className="text-slate-500">Check back soon or visit AWC Vault for the latest updates.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {currentEvents.map((event) => (
                  <PublicEventCard
                    key={event.id}
                    event={event}
                    expanded={!!expandedEvents[event.id]}
                    onToggleDetails={() => toggleEventDetails(event.id)}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-church-burgundy hover:bg-church-gold hover:text-white shadow-md'
                  }`}
                >
                  <i className="fa-solid fa-chevron-left"></i>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => goToPage(pageNumber)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                      currentPage === pageNumber
                        ? 'bg-church-gold text-white shadow-lg scale-110'
                        : 'bg-white text-church-burgundy hover:bg-church-burgundy hover:text-white shadow-md'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-church-burgundy hover:bg-church-gold hover:text-white shadow-md'
                  }`}
                >
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-church-burgundy/80 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
            aria-label="Close event details"
          />
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full relative z-10 animate-slide-up overflow-hidden">
            <button
              type="button"
              onClick={() =>
                setPreviewImage({ url: selectedEvent.imageUrl, title: selectedEvent.title })
              }
              className="relative block w-full aspect-[16/10] cursor-zoom-in group"
              aria-label={`View larger image for ${selectedEvent.title}`}
            >
              <img
                src={selectedEvent.imageUrl}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute inset-0 bg-church-burgundy/0 group-hover:bg-church-burgundy/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-church-burgundy text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-full">
                  Enlarge
                </span>
              </span>
            </button>
            <div className="p-8">
            <span className="px-3 py-1 bg-church-gold/10 text-church-gold text-[10px] font-black uppercase tracking-widest rounded-full">
              {selectedEvent.category}
            </span>
            <h3 className="text-3xl font-bold text-church-burgundy mt-4 mb-2 serif">{selectedEvent.title}</h3>
            <p className="text-slate-500 mb-6">{selectedEvent.date}</p>
            <p className="text-slate-600 mb-6 leading-relaxed">{selectedEvent.description}</p>
            <div className="space-y-3 text-sm text-church-burgundy font-semibold mb-8">
              <p className="flex items-center gap-2">
                <i className="fa-solid fa-clock text-church-gold"></i>
                {selectedEvent.time}
              </p>
              <p className="flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-church-gold"></i>
                {selectedEvent.location}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {selectedEvent.signupUrl ? (
                <a
                  href={selectedEvent.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-church-gold hover:bg-white text-church-burgundy px-6 py-3 rounded-lg font-semibold text-[12px] tracking-wide transition-colors"
                >
                  Sign Up
                </a>
              ) : null}
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="inline-flex items-center justify-center border border-gray-200 text-church-burgundy px-6 py-3 rounded-lg font-semibold text-[12px] tracking-wide transition-colors hover:border-church-gold"
              >
                Close
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      <EventImageLightbox
        imageUrl={previewImage?.url ?? ''}
        title={previewImage?.title ?? ''}
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
};

export default Events;
