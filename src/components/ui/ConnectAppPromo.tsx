import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';

/**
 * AWC Connect promo for the Home page.
 *
 * AWC Connect is an installable web app (PWA), not an App Store / Google Play
 * listing. So "downloading" it means: open it, then Add to Home Screen.
 * - Phones: a big "Open AWC Connect" button + step-by-step install help for
 *   the visitor's own device (you can't scan a QR code on your own screen).
 * - Computers: a large, high-contrast QR code to scan with a phone camera.
 */

const CONNECT_URL = 'https://awc-connect.vercel.app/welcome';
const CONNECT_DISPLAY = 'awc-connect.vercel.app';

type Platform = 'ios' | 'android';

const detectPlatform = (): Platform | null => {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'android';
  // iPadOS reports as Mac, so also check for touch support.
  if (/iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  return null;
};

const INSTALL_STEPS: Record<Platform, { icon: string; text: React.ReactNode }[]> = {
  ios: [
    { icon: 'fa-solid fa-compass', text: <>Tap <strong>Open AWC Connect</strong> (use <strong>Safari</strong>)</> },
    { icon: 'fa-solid fa-arrow-up-from-bracket', text: <>Tap the <strong>Share</strong> button at the bottom of the screen</> },
    { icon: 'fa-solid fa-square-plus', text: <>Scroll down and tap <strong>Add to Home Screen</strong>, then <strong>Add</strong></> },
  ],
  android: [
    { icon: 'fa-brands fa-chrome', text: <>Tap <strong>Open AWC Connect</strong> (use <strong>Chrome</strong>)</> },
    { icon: 'fa-solid fa-ellipsis-vertical', text: <>Tap the <strong>⋮ menu</strong> in the top-right corner</> },
    { icon: 'fa-solid fa-square-plus', text: <>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong></> },
  ],
};

const FEATURES = [
  { icon: 'fa-solid fa-tower-broadcast', label: 'Watch Live & Archives' },
  { icon: 'fa-solid fa-heart', label: 'Easy Mobile Giving' },
  { icon: 'fa-solid fa-hands-praying', label: 'Prayer Requests' },
  { icon: 'fa-solid fa-bell', label: 'Event Updates' },
];

const ConnectAppPromo: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>('ios');
  const [isPhone, setIsPhone] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const detected = detectPlatform();
    if (detected) {
      setPlatform(detected);
      setIsPhone(true);
    }
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CONNECT_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', CONNECT_URL);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AWC Connect',
          text: 'Get the AWC Connect app — church in your pocket.',
          url: CONNECT_URL,
        });
        return;
      } catch {
        /* user cancelled */
        return;
      }
    }
    handleCopy();
  };

  return (
    <section id="connect-app" className="py-20 md:py-24 bg-church-burgundy relative overflow-hidden scroll-mt-24">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-church-gold/10 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content Side */}
          <div className="text-white space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <img
                  src="/images/awc-connect-icon.png"
                  alt=""
                  className="w-12 h-12 rounded-2xl shadow-lg ring-2 ring-church-gold/60"
                />
                <div>
                  <span className="text-church-gold font-black tracking-[0.3em] uppercase text-xs block">AWC Connect</span>
                  <span className="inline-flex items-center gap-1.5 mt-1 text-[11px] font-bold uppercase tracking-wider text-white bg-church-gold/90 px-2.5 py-0.5 rounded-full">
                    <i className="fa-solid fa-star text-[9px]"></i> New · Free
                  </span>
                </div>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold serif mb-5 leading-tight">Church in Your Pocket</h2>
              <p className="text-lg md:text-xl text-white/85 font-light leading-relaxed max-w-xl">
                Stay connected with the AWC family wherever you go. Watch sermons, submit prayer requests, give securely, and get updates on upcoming events.
              </p>
            </div>

            {/* Feature chips */}
            <div className="grid grid-cols-2 gap-3 max-w-xl">
              {FEATURES.map((f) => (
                <div key={f.label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <i className={`${f.icon} text-church-gold text-sm w-4 text-center`}></i>
                  <span className="font-medium text-sm">{f.label}</span>
                </div>
              ))}
            </div>

            {/* Primary call to action */}
            <div className="space-y-4">
              <a
                href={CONNECT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex sm:inline-flex items-center justify-center gap-3 w-full sm:w-auto bg-church-gold hover:bg-white text-church-burgundy font-black text-lg px-8 py-5 rounded-2xl shadow-2xl shadow-black/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <i className="fa-solid fa-mobile-screen-button text-xl"></i>
                Open AWC Connect
                <i className="fa-solid fa-arrow-right text-sm transition-transform group-hover:translate-x-1"></i>
              </a>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/75">
                <span className="flex items-center gap-2"><i className="fa-solid fa-circle-check text-church-gold"></i>No app store needed</span>
                <span className="flex items-center gap-2"><i className="fa-brands fa-apple"></i>iPhone</span>
                <span className="flex items-center gap-2"><i className="fa-brands fa-android"></i>Android</span>
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={isPhone ? handleShare : handleCopy}
                  className="inline-flex items-center gap-2 text-sm font-semibold bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 rounded-xl transition-colors"
                >
                  <i className={`fa-solid ${copied ? 'fa-check' : isPhone ? 'fa-share-nodes' : 'fa-link'}`}></i>
                  {copied ? 'Link copied!' : isPhone ? 'Share with family' : 'Copy link'}
                </button>
                <span className="inline-flex items-center text-sm font-mono text-white/70 px-1">{CONNECT_DISPLAY}</span>
              </div>
            </div>

            {/* How to install — tailored to device */}
            <div className="bg-black/25 border border-white/10 rounded-3xl p-5 sm:p-6 max-w-xl">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="font-bold text-base">Add it to your home screen</h3>
                <div className="flex bg-white/10 rounded-full p-1 text-xs font-bold" role="tablist" aria-label="Choose your phone">
                  {(['ios', 'android'] as Platform[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      role="tab"
                      aria-selected={platform === p}
                      onClick={() => setPlatform(p)}
                      className={`px-3 py-1.5 rounded-full transition-colors ${platform === p ? 'bg-church-gold text-church-burgundy' : 'text-white/70 hover:text-white'}`}
                    >
                      {p === 'ios' ? 'iPhone' : 'Android'}
                    </button>
                  ))}
                </div>
              </div>
              <ol className="space-y-3">
                {INSTALL_STEPS[platform].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/90">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-church-gold text-church-burgundy font-black text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="pt-1 leading-snug">
                      <i className={`${step.icon} text-church-gold/90 mr-2`}></i>
                      {step.text}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="text-xs text-white/60 mt-4">The AWC Connect icon will appear on your home screen like any other app.</p>
            </div>
          </div>

          {/* Visual Side: big QR on computers, phone mockup on phones */}
          <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0">
            {/* QR card — computers / tablets only (you can't scan your own phone screen) */}
            <div className={`${isPhone ? 'hidden' : 'hidden md:flex'} flex-col items-center bg-white rounded-[2rem] shadow-2xl p-7 w-[290px] flex-shrink-0 relative z-20 lg:-mr-10`}>
              <p className="text-church-burgundy text-xs font-black uppercase tracking-[0.25em] mb-1">Scan with your phone</p>
              <p className="text-gray-500 text-xs mb-5">Open your camera and point it here</p>
              {/* White padding = quiet zone so phone cameras can lock on */}
              <div className="bg-white p-3 rounded-xl ring-1 ring-gray-100">
                <QRCode
                  value={CONNECT_URL}
                  size={200}
                  level="M"
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  title="Scan to open AWC Connect"
                />
              </div>
              <a
                href={CONNECT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 text-church-burgundy hover:text-church-gold text-sm font-bold transition-colors"
              >
                {CONNECT_DISPLAY} <i className="fa-solid fa-arrow-up-right-from-square text-[10px] ml-1"></i>
              </a>
            </div>

            {/* Phone mockup */}
            <a
              href={CONNECT_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open AWC Connect"
              className={`${isPhone ? 'flex' : 'flex md:hidden lg:flex'} relative justify-center flex-shrink-0 z-10`}
            >
              <div className="relative w-[240px] h-[480px] lg:w-[260px] lg:h-[520px] bg-black rounded-[2.75rem] border-8 border-slate-900 shadow-2xl overflow-hidden rotate-[-6deg] hover:rotate-0 transition-transform duration-700">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-20"></div>
                <div className="w-full h-full overflow-hidden bg-white">
                  <img src="/images/awc-app-preview.png" alt="AWC Connect app preview" className="w-full h-auto object-cover" />
                  <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              </div>
            </a>

            <div className="absolute -z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-church-gold/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConnectAppPromo;
