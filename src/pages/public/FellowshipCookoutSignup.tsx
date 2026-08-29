import * as React from 'react';
import { Link } from 'react-router-dom';
import { FELLOWSHIP_COOKOUT, getFellowshipCookoutSignupUrl } from '../../constants';

const FellowshipCookoutSignup: React.FC = () => {
  const signupFormUrl = getFellowshipCookoutSignupUrl();

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-church-gold font-bold tracking-[0.3em] uppercase text-xs">
            {FELLOWSHIP_COOKOUT.eyebrow}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-church-burgundy mt-4 serif">
            Sign Up for {FELLOWSHIP_COOKOUT.title}
          </h1>
          <p className="text-slate-500 mt-4 max-w-xl mx-auto">
            Let us know you&apos;re coming so we can prepare enough food and fellowship for everyone.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
          <div className="grid lg:grid-cols-12">
            <div className="lg:col-span-4 bg-church-burgundy p-10 text-white flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-church-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <h2 className="text-3xl font-bold serif mb-4 relative z-10">Event Details</h2>
              <div className="space-y-4 relative z-10 text-white/80 text-sm">
                <p className="flex items-center gap-3">
                  <i className="fa-solid fa-calendar text-church-gold"></i>
                  September 20, 2026
                </p>
                <p className="flex items-center gap-3">
                  <i className="fa-solid fa-clock text-church-gold"></i>
                  {FELLOWSHIP_COOKOUT.time}
                </p>
                <p className="flex items-center gap-3">
                  <i className="fa-solid fa-location-dot text-church-gold"></i>
                  {FELLOWSHIP_COOKOUT.location}
                </p>
              </div>
            </div>

            <div className="lg:col-span-8 p-6 md:p-10 bg-slate-50">
              {signupFormUrl ? (
                <div className="w-full h-[700px] rounded-2xl overflow-hidden shadow-inner bg-white border border-slate-200">
                  <iframe
                    src={signupFormUrl}
                    className="w-full h-full border-none"
                    title={`${FELLOWSHIP_COOKOUT.title} Sign Up`}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-2xl bg-white border border-slate-200">
                  <div className="w-16 h-16 bg-church-gold/15 rounded-full flex items-center justify-center mb-6">
                    <i className="fa-solid fa-clipboard-list text-church-gold text-2xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-church-burgundy serif mb-3">
                    Sign-up form coming soon
                  </h3>
                  <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
                    We&apos;re setting up registration through AWC Vault. Check back shortly, or contact the church office to let us know you&apos;re attending.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-church-gold hover:bg-white text-church-burgundy px-6 py-3 rounded-lg font-semibold text-[12px] tracking-wide transition-colors"
                  >
                    <i className="fa-solid fa-arrow-left text-[10px]"></i>
                    Back to Home
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FellowshipCookoutSignup;
