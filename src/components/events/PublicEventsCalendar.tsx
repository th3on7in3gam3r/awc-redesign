import * as React from 'react';
import { ChurchEvent } from '../../types';
import { getCalendarDays, getEventsForDay } from '../../services/vaultEventsService';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface PublicEventsCalendarProps {
  events: ChurchEvent[];
  currentDate: Date;
  onMonthChange: (date: Date) => void;
  onSelectEvent: (event: ChurchEvent) => void;
}

const PublicEventsCalendar: React.FC<PublicEventsCalendarProps> = ({
  events,
  currentDate,
  onMonthChange,
  onSelectEvent,
}) => {
  const days = getCalendarDays(currentDate);

  const handlePrevMonth = () => {
    onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-church-burgundy to-[#2A0202]">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="w-10 h-10 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
          aria-label="Previous month"
        >
          <i className="fa-solid fa-chevron-left text-xs"></i>
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-white serif">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          type="button"
          onClick={handleNextMonth}
          className="w-10 h-10 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
          aria-label="Next month"
        >
          <i className="fa-solid fa-chevron-right text-xs"></i>
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-100">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-[10px] font-bold uppercase tracking-widest text-church-burgundy/60"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();
          const dailyEvents = getEventsForDay(events, day);

          return (
            <div
              key={`${day.toISOString()}-${index}`}
              className={`min-h-[110px] md:min-h-[130px] p-2 border-b border-r border-gray-100 ${
                !isCurrentMonth ? 'bg-gray-50/70' : 'bg-white'
              }`}
            >
              <div
                className={`mb-2 w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold ${
                  isToday
                    ? 'bg-church-gold text-church-burgundy'
                    : isCurrentMonth
                      ? 'text-church-burgundy'
                      : 'text-gray-400'
                }`}
              >
                {day.getDate()}
              </div>

              <div className="space-y-1">
                {dailyEvents.slice(0, 3).map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onSelectEvent(event)}
                    className="w-full text-left text-[10px] md:text-[11px] px-2 py-1 rounded-md bg-church-gold/15 text-church-burgundy border border-church-gold/20 hover:bg-church-gold/25 transition-colors truncate"
                  >
                    {event.title}
                  </button>
                ))}
                {dailyEvents.length > 3 && (
                  <p className="text-[10px] text-slate-400 px-2">+{dailyEvents.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PublicEventsCalendar;
