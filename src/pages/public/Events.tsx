
import React, { useState } from 'react';
import { EVENTS } from '../../constants';

const Events: React.FC = () => {
  const [rsvpStatus, setRsvpStatus] = useState<Record<string, boolean>>({});
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const eventsPerPage = 6;

  // Calculate pagination
  const totalPages = Math.ceil(EVENTS.length / eventsPerPage);
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = EVENTS.slice(indexOfFirstEvent, indexOfLastEvent);

  const handleRSVP = (eventId: string) => {
    setRsvpStatus(prev => ({ ...prev, [eventId]: true }));
    setTimeout(() => setActiveEvent(null), 2000);
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleEventDetails = (eventId: string) => {
    setExpandedEvents(prev => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  return (
    <div className="pt-52 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-church-gold font-bold tracking-[0.3em] uppercase text-xs">Mark Your Calendar</span>
          <h1 className="text-5xl font-bold text-church-burgundy mt-4 serif">Upcoming Gatherings</h1>
          <p className="text-slate-500 mt-4">
            Showing {indexOfFirstEvent + 1}-{Math.min(indexOfLastEvent, EVENTS.length)} of {EVENTS.length} events
          </p>
        </div>

        <div className="space-y-8">
          {currentEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 flex flex-col md:flex-row">
              <div className="md:w-1/3 aspect-[4/3] relative">
                <img src={event.imageUrl} className="w-full h-full object-cover" alt={event.title} />
                <div className="absolute top-6 left-6 bg-white rounded-2xl p-4 shadow-xl text-center min-w-[80px]">
                  <p className="text-church-gold text-2xl font-black leading-none">{event.date.split(' ')[1]?.replace(',', '') || event.date.split(' ')[0]}</p>
                  <p className="text-church-burgundy text-[10px] font-bold uppercase tracking-widest mt-1">{event.date.split(' ')[0]}</p>
                </div>
              </div>

              <div className="md:w-2/3 p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-church-gold/10 text-church-gold text-[10px] font-black uppercase tracking-widest rounded-full">{event.category}</span>
                </div>
                <h3 className="text-4xl font-bold text-church-burgundy mb-4 serif">{event.title}</h3>
                <p className="text-slate-600 text-lg mb-8 leading-relaxed max-w-2xl">{event.description}</p>

                <div className="grid grid-cols-2 sm:flex sm:items-center gap-6 mb-10">
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-clock text-church-gold"></i>
                    <span className="text-sm font-bold text-church-burgundy">{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-location-dot text-church-gold"></i>
                    <span className="text-sm font-bold text-church-burgundy">{event.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {rsvpStatus[event.id] ? (
                    <div className="flex items-center gap-2 text-green-600 font-bold animate-fade-in bg-green-50 px-6 py-4 rounded-full">
                      <i className="fa-solid fa-circle-check"></i>
                      <span>Registered Successfully</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setActiveEvent(event.id)}
                        className="bg-church-burgundy text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-church-gold transition-all duration-300 shadow-xl"
                      >
                        RSVP Now
                      </button>
                      <button
                        onClick={() => toggleEventDetails(event.id)}
                        className="text-church-burgundy font-bold uppercase tracking-widest text-xs hover:text-church-gold flex items-center gap-2 transition-all"
                      >
                        {expandedEvents[event.id] ? 'Hide Details' : 'Details'}
                        <i className={`fa-solid transition-transform duration-300 ${expandedEvents[event.id] ? 'fa-minus rotate-180' : 'fa-plus'}`}></i>
                      </button>
                    </>
                  )}
                </div>

                {/* Expanded Details Section */}
                {expandedEvents[event.id] && (
                  <div className="mt-8 pt-8 border-t border-gray-100 animate-slide-down">
                    <h4 className="text-xl font-bold text-church-burgundy mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-circle-info text-church-gold"></i>
                      Additional Information
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <i className="fa-solid fa-calendar-check text-church-gold mt-1"></i>
                          <div>
                            <p className="text-xs font-bold text-church-burgundy uppercase tracking-wider mb-1">Full Date</p>
                            <p className="text-sm text-slate-600">{event.date}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <i className="fa-solid fa-clock text-church-gold mt-1"></i>
                          <div>
                            <p className="text-xs font-bold text-church-burgundy uppercase tracking-wider mb-1">Time</p>
                            <p className="text-sm text-slate-600">{event.time}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <i className="fa-solid fa-map-pin text-church-gold mt-1"></i>
                          <div>
                            <p className="text-xs font-bold text-church-burgundy uppercase tracking-wider mb-1">Location</p>
                            <p className="text-sm text-slate-600">{event.location}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <i className="fa-solid fa-tag text-church-gold mt-1"></i>
                          <div>
                            <p className="text-xs font-bold text-church-burgundy uppercase tracking-wider mb-1">Category</p>
                            <p className="text-sm text-slate-600">{event.category}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <i className="fa-solid fa-users text-church-gold mt-1"></i>
                          <div>
                            <p className="text-xs font-bold text-church-burgundy uppercase tracking-wider mb-1">Who Should Attend</p>
                            <p className="text-sm text-slate-600">
                              {event.category === 'Youth' ? 'Ages 13-18' :
                                event.category === 'Children' ? 'Ages 5-12' :
                                  event.category === 'Men' ? 'All men welcome' :
                                    event.category === 'Women' ? 'All women welcome' :
                                      event.category === 'Marriage' ? 'Married couples' :
                                        'Everyone is welcome!'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <i className="fa-solid fa-circle-question text-church-gold mt-1"></i>
                          <div>
                            <p className="text-xs font-bold text-church-burgundy uppercase tracking-wider mb-1">Questions?</p>
                            <p className="text-sm text-slate-600">Contact us at events@awc.org</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-church-burgundy hover:bg-church-gold hover:text-white shadow-md'
                }`}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => goToPage(pageNumber)}
                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${currentPage === pageNumber
                  ? 'bg-church-gold text-white shadow-lg scale-110'
                  : 'bg-white text-church-burgundy hover:bg-church-burgundy hover:text-white shadow-md'
                  }`}
              >
                {pageNumber}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-church-burgundy hover:bg-church-gold hover:text-white shadow-md'
                }`}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* RSVP Modal Mock */}
      {activeEvent && !rsvpStatus[activeEvent] && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-church-burgundy/80 backdrop-blur-sm" onClick={() => setActiveEvent(null)}></div>
          <div className="bg-white rounded-[40px] shadow-2xl p-10 max-w-lg w-full relative z-10 animate-slide-up">
            <h3 className="text-3xl font-bold text-church-burgundy mb-2 serif">Register for {EVENTS.find(e => e.id === activeEvent)?.title}</h3>
            <p className="text-slate-500 mb-8">We're excited to see you! Please provide your details below.</p>
            <div className="space-y-4">
              <input type="text" placeholder="Full Name" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-church-gold" />
              <input type="email" placeholder="Email Address" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-church-gold" />
              <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-church-gold">
                <option>Number of Attendees: 1</option>
                <option>2</option>
                <option>3</option>
                <option>4+</option>
              </select>
              <button
                onClick={() => handleRSVP(activeEvent)}
                className="w-full bg-church-gold text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-2xl transition-all"
              >
                Confirm RSVP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;