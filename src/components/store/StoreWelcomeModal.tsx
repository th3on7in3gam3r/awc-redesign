import React, { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'awc-store-welcome-seen';
const VIDEO_SRC = '/video/awc-store-welcome.mp4';

type Phase = 'choice' | 'playing';

export const StoreWelcomeModal: React.FC = () => {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== '1';
    } catch {
      return true;
    }
  });
  const [phase, setPhase] = useState<Phase>('choice');
  const [visible, setVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setVisible(false);
    window.setTimeout(() => setOpen(false), 280);
  };

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open || phase !== 'playing') return;
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.muted = false;
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => {});
    });
  }, [open, phase]);

  if (!open) return null;

  const startPlayback = () => setPhase('playing');

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      } bg-black/75 backdrop-blur-sm`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to AWC Store"
      onClick={dismiss}
    >
      <div
        className={`relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-100 transition-all duration-300 ${
          visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-[0.98]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/50 text-white hover:bg-church-gold transition-colors flex items-center justify-center"
          aria-label="Close"
        >
          <i className="fa-solid fa-xmark" />
        </button>

        {phase === 'choice' ? (
          <div className="p-8 md:p-10 text-center">
            <span className="text-church-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-3 block">
              Welcome
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-church-burgundy serif mb-3">
              AWC Store
            </h2>
            <p className="text-slate-500 text-sm font-light leading-relaxed mb-8 max-w-sm mx-auto">
              A short welcome from Pastor Kenneth — shop our Youth collection now; Men’s and Women’s are coming soon.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={startPlayback}
                className="inline-flex items-center justify-center gap-2 bg-church-burgundy hover:bg-church-gold text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-colors"
              >
                <i className="fa-solid fa-play text-[10px]" />
                Play Welcome
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="inline-flex items-center justify-center bg-white border border-gray-200 text-slate-600 hover:border-church-burgundy hover:text-church-burgundy px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="relative bg-black">
            <video
              ref={videoRef}
              src={VIDEO_SRC}
              className="w-full max-h-[70vh] object-contain bg-black"
              playsInline
              controls
              onEnded={dismiss}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreWelcomeModal;
