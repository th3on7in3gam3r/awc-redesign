import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FEATURED_HOME_EVENT } from '../constants';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <div className="text-2xl md:text-4xl font-bold text-church-gold tabular-nums">
      {String(value).padStart(2, '0')}
    </div>
    <div className="text-white/45 text-[11px] uppercase tracking-wider mt-1">{label}</div>
  </div>
);

const EventCountdown: React.FC = () => {
  const event = FEATURED_HOME_EVENT;
  const target = new Date(event.targetDate);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => getTimeLeft(target));

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [event.targetDate]);

  const hasPassed = timeLeft === null;

  return (
    <div className="animate-fade-in bg-gradient-to-br from-church-burgundy to-black rounded-3xl shadow-xl border border-church-gold/20 overflow-hidden">
      <div className="p-8 md:p-12 text-center">
        <span className="text-church-gold font-bold tracking-[0.3em] uppercase text-xs">
          {event.eyebrow}
        </span>

        <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mt-4 mb-3">
          {event.title}
        </h2>

        <p className="text-white/70 font-light max-w-xl mx-auto mb-2">
          {event.description}
        </p>

        <p className="text-white/50 text-sm mb-8 flex items-center justify-center gap-2 flex-wrap">
          <i className="fa-solid fa-location-dot text-church-gold text-xs"></i>
          {event.location}
          <span className="hidden sm:inline">&middot;</span>
          <i className="fa-solid fa-clock text-church-gold text-xs"></i>
          {event.displayDate} &middot; {event.time}
        </p>

        {hasPassed ? (
          <div className="py-6" aria-live="polite">
            <p className="text-2xl md:text-3xl font-bold text-church-gold serif">
              Event day is here!
            </p>
            <p className="text-white/60 mt-2">We can&apos;t wait to see you there.</p>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-lg mx-auto mb-10"
            aria-live="polite"
            aria-label={`Countdown to ${event.title}`}
          >
            <TimeUnit value={timeLeft.days} label="Days" />
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <TimeUnit value={timeLeft.minutes} label="Minutes" />
            <TimeUnit value={timeLeft.seconds} label="Seconds" />
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 bg-church-gold hover:bg-white text-church-burgundy px-6 py-3 rounded-lg font-semibold text-[12px] tracking-wide transition-colors"
          >
            Mark Your Calendar
            <i className="fa-solid fa-arrow-right text-[10px]"></i>
          </Link>
          <a
            href={event.signupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-transparent border border-church-gold/50 text-church-gold hover:bg-church-gold hover:text-church-burgundy px-6 py-3 rounded-lg font-semibold text-[12px] tracking-wide transition-colors"
          >
            <i className="fa-solid fa-user-plus text-[10px]"></i>
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
};

export default EventCountdown;
