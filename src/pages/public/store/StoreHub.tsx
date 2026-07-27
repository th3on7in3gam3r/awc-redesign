import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { STORE_MINISTRIES } from '../../../data/storeProducts';
import { StoreWelcomeModal } from '../../../components/store/StoreWelcomeModal';

const StoreHub: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <StoreWelcomeModal />

      <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden bg-church-burgundy">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        <div className="absolute inset-0 bg-gradient-to-br from-church-burgundy via-church-burgundy/95 to-black/70" />

        <div className="max-w-5xl mx-auto px-5 md:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-church-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-3 block">
              Merchandise
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white serif leading-tight mb-3">
              AWC Store
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/75 font-light max-w-xl mx-auto leading-relaxed">
              Apparel for Youth, Men, and Women — crafted with purpose for our ministries.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="max-w-6xl mx-auto px-5 md:px-6">
          <div className="text-center mb-8 md:mb-10">
            <span className="text-church-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-2 block">
              Shop by Ministry
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-church-burgundy serif mb-2">
              Choose Your Collection
            </h2>
            <p className="text-slate-500 text-sm md:text-base font-light max-w-md mx-auto">
              Browse available apparel by ministry.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {STORE_MINISTRIES.map((ministry, index) => {
              const comingSoon = !!ministry.comingSoon;
              const cardInner = (
                <div className="aspect-[16/10] md:aspect-[4/5] max-h-[220px] md:max-h-none overflow-hidden relative">
                  <img
                    src={ministry.imageUrl}
                    alt={ministry.name}
                    className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ${
                      comingSoon ? 'grayscale-[25%]' : 'group-hover:scale-105'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-church-burgundy/95 via-church-burgundy/35 to-transparent" />
                  {comingSoon && (
                    <div className="absolute top-3 right-3 md:top-4 md:right-4">
                      <span className="bg-church-gold text-white px-2.5 py-1 md:px-3 md:py-1.5 rounded-md text-[9px] font-bold uppercase tracking-[0.2em] shadow">
                        Coming Soon
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 text-white">
                    <h3 className="text-lg md:text-2xl font-bold serif mb-0.5 md:mb-1">{ministry.name}</h3>
                    <p className="text-white/75 text-xs md:text-sm font-light mb-2 md:mb-3 leading-snug line-clamp-2">
                      {ministry.tagline}
                    </p>
                    {comingSoon ? (
                      <span className="text-white/45 text-[9px] font-bold uppercase tracking-[0.25em]">
                        Opening soon
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-church-gold text-[9px] font-bold uppercase tracking-[0.25em]">
                        Shop Collection
                        <i className="fa-solid fa-arrow-right text-[9px] group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    )}
                  </div>
                </div>
              );

              return (
                <motion.div
                  key={ministry.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  {comingSoon ? (
                    <div
                      className="relative block bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 cursor-default select-none"
                      aria-disabled="true"
                    >
                      {cardInner}
                    </div>
                  ) : (
                    <Link
                      to={`/store/${ministry.id}`}
                      className="group relative block bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      {cardInner}
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default StoreHub;
