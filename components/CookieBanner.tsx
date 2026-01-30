
import React, { useState, useEffect } from 'react';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('awc_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('awc_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('awc_cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-8 z-[150] w-[calc(100%-4rem)] max-w-md animate-slide-up">
      <div className="bg-church-burgundy border-2 border-church-gold rounded-[2rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden">
        <div className="p-8">
          <div className="flex items-start gap-5 mb-6">
            <div className="w-14 h-14 bg-church-gold rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg rotate-3">
              <i className="fa-solid fa-cookie-bite text-2xl"></i>
            </div>
            <div>
              <h3 className="text-white font-bold text-xl serif mb-1">Sacred Stewardship</h3>
              <p className="text-church-gold/80 text-[10px] uppercase font-black tracking-widest">Digital Privacy Policy</p>
            </div>
          </div>
          
          <p className="text-gray-300 text-sm font-light leading-relaxed mb-8">
            To enhance our virtual fellowship and improve your experience within our digital sanctuary, we utilize cookies. By continuing, you agree to our use of these digital tools.
          </p>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleAccept}
              className="flex-1 bg-church-gold hover:bg-white text-white hover:text-church-burgundy py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-500 shadow-xl"
            >
              Accept All
            </button>
            <button 
              onClick={handleDecline}
              className="px-6 py-4 text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors border border-white/10 rounded-xl hover:border-white/30"
            >
              Essential
            </button>
          </div>
        </div>
        
        {/* Decorative thin gold line at bottom */}
        <div className="h-1 w-full bg-church-gold"></div>
      </div>
    </div>
  );
};

export default CookieBanner;
