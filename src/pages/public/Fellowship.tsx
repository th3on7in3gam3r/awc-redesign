import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AWC_CONNECT_URL,
  AWC_VAULT_MEMBER_SETUP_URL,
  FELLOWSHIP_COOKOUT,
} from '../../constants';

const NEXT_STEPS = [
  {
    title: 'Plan a Visit',
    description: 'Service times, directions, and what to expect when you arrive.',
    to: '/visit',
    icon: 'fa-solid fa-location-dot',
  },
  {
    title: 'Find a Ministry',
    description: 'Discover where your gifts and passions can serve the church family.',
    to: '/ministries',
    icon: 'fa-solid fa-hands-holding-heart',
  },
  {
    title: 'Upcoming Events',
    description: 'See what’s happening this season and mark your calendar.',
    to: '/events',
    icon: 'fa-solid fa-calendar-days',
  },
  {
    title: 'Photo Gallery',
    description: 'Catch a glimpse of worship, fellowship, and church life.',
    to: '/gallery',
    icon: 'fa-solid fa-camera',
  },
] as const;

const Fellowship: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [requestText, setRequestText] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePrayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const res = await fetch('/api/public/prayer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: email || undefined,
          requestText,
          website: honeypot,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Unable to submit your prayer request.');
      }

      setName('');
      setEmail('');
      setRequestText('');
      setHoneypot('');
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-28 md:pt-32 pb-16 md:pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10 md:mb-12">
          <span className="text-church-gold font-bold tracking-[0.35em] uppercase text-[10px] mb-3 block">
            Fellowship
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-church-burgundy mb-3 serif leading-tight">
            Get Connected
          </h1>
          <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
            Belong with us at Anointed Worship Center — take a next step, join church life, or share a prayer need.
          </p>
        </div>

        <section className="mb-14 md:mb-16">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-church-burgundy serif">Next Steps</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-church-gold/40 to-transparent"></div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {NEXT_STEPS.map((step) => (
              <Link
                key={step.to}
                to={step.to}
                className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-church-gold/40 transition-all duration-300 p-5 md:p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-church-burgundy/5 text-church-burgundy flex items-center justify-center text-sm mb-4 group-hover:bg-church-gold group-hover:text-white transition-colors">
                  <i className={step.icon}></i>
                </div>
                <h3 className="text-lg font-bold text-church-burgundy serif mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{step.description}</p>
                <span className="inline-flex items-center gap-2 text-church-gold font-bold uppercase tracking-[0.18em] text-[10px]">
                  Learn More
                  <i className="fa-solid fa-arrow-right text-[9px] transition-transform group-hover:translate-x-1"></i>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-14 md:mb-16">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-church-burgundy serif">Digital Tools</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-church-gold/40 to-transparent"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            <a
              href={AWC_CONNECT_URL}
              target="_blank"
              rel="noreferrer"
              className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-church-gold/40 transition-all duration-300 p-6 md:p-8"
            >
              <p className="text-church-gold font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Member App</p>
              <h3 className="text-xl md:text-2xl font-bold text-church-burgundy serif mb-2">AWC Connect</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-5">
                The church app for members — stay updated, engage with church life, and keep your household connected.
              </p>
              <span className="inline-flex items-center gap-2 text-church-gold font-bold uppercase tracking-[0.18em] text-[10px]">
                Open AWC Connect
                <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
              </span>
            </a>
            <a
              href={AWC_VAULT_MEMBER_SETUP_URL}
              target="_blank"
              rel="noreferrer"
              className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-church-gold/40 transition-all duration-300 p-6 md:p-8"
            >
              <p className="text-church-gold font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Member Setup</p>
              <h3 className="text-xl md:text-2xl font-bold text-church-burgundy serif mb-2">AWC Vault</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-5">
                Get set up in AWC Vault for member resources, household tools, and church operations access.
              </p>
              <span className="inline-flex items-center gap-2 text-church-gold font-bold uppercase tracking-[0.18em] text-[10px]">
                Member Setup Guide
                <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
              </span>
            </a>
          </div>
        </section>

        <section className="mb-14 md:mb-16">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 md:p-10">
            <div className="max-w-2xl mx-auto">
              <p className="text-church-gold font-bold uppercase tracking-[0.3em] text-[10px] mb-2 text-center">
                We Pray With You
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-church-burgundy serif text-center mb-3">
                Share a Prayer Request
              </h2>
              <p className="text-slate-500 text-sm text-center mb-8 leading-relaxed">
                Our pastoral team reviews every request. Share as much or as little as you are comfortable with.
              </p>

              {status === 'success' ? (
                <div className="text-center py-8 rounded-2xl bg-green-50 border border-green-100">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500 text-white flex items-center justify-center">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <h3 className="text-xl font-bold text-church-burgundy serif mb-2">Received with care</h3>
                  <p className="text-slate-500 text-sm mb-6">Thank you. Our team will be praying with you.</p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="text-church-gold font-bold uppercase tracking-[0.18em] text-[10px]"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePrayerSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-gray-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-gold/30"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email (optional)"
                      className="w-full bg-gray-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-gold/30"
                    />
                  </div>
                  <textarea
                    required
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                    placeholder="How can we pray for you?"
                    rows={5}
                    className="w-full bg-gray-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-gold/30 resize-y"
                  />
                  {/* Honeypot — leave empty */}
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                  />
                  {status === 'error' && (
                    <p className="text-red-600 text-sm">{errorMessage}</p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto bg-church-burgundy hover:bg-church-gold disabled:opacity-60 text-white px-8 py-3.5 rounded-full font-bold uppercase tracking-[0.2em] text-[10px] transition-colors"
                  >
                    {submitting ? 'Sending…' : 'Send Prayer Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="bg-church-burgundy rounded-3xl p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-church-gold/5 -skew-x-12 translate-x-1/2 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
            <div className="flex-1 min-w-0">
              <p className="text-church-gold font-bold uppercase tracking-[0.25em] text-[10px] mb-2">
                {FELLOWSHIP_COOKOUT.eyebrow}
              </p>
              <h2 className="text-white text-xl md:text-2xl font-bold serif mb-1">
                {FELLOWSHIP_COOKOUT.title}
              </h2>
              <p className="text-white/65 text-sm">
                September 20, 2026 · {FELLOWSHIP_COOKOUT.time} · {FELLOWSHIP_COOKOUT.location}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href="/fellowship-cookout/"
                className="inline-flex items-center justify-center bg-church-gold hover:bg-white text-white hover:text-church-burgundy px-6 py-3 rounded-full font-bold uppercase tracking-[0.18em] text-[10px] transition-colors"
              >
                View Flyer
              </a>
              <Link
                to={FELLOWSHIP_COOKOUT.signupPath}
                className="inline-flex items-center justify-center border border-white/25 text-white hover:bg-white hover:text-church-burgundy px-6 py-3 rounded-full font-bold uppercase tracking-[0.18em] text-[10px] transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Fellowship;
