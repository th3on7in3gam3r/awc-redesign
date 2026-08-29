import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  formatPrice,
  getMinistryMeta,
  getProductsByMinistry,
  isStoreMinistry,
} from '../../../data/storeProducts';
import { getScripturesForMinistry } from '../../../data/storeScriptures';

const StoreCatalog: React.FC = () => {
  const { ministry } = useParams<{ ministry: string }>();

  if (!ministry || !isStoreMinistry(ministry)) {
    return <Navigate to="/store" replace />;
  }

  const meta = getMinistryMeta(ministry)!;
  if (meta.comingSoon) {
    return <Navigate to="/store" replace />;
  }

  const products = getProductsByMinistry(ministry);
  const scriptures = getScripturesForMinistry(ministry);

  const scripturePanel = (
    <aside className="space-y-4">
      <div>
        <span className="text-church-gold font-semibold tracking-[0.25em] uppercase text-[9px] mb-1.5 block">
          Word for this collection
        </span>
        <h2 className="text-lg md:text-xl font-bold text-church-burgundy serif">
          Scripture
        </h2>
      </div>
      <ul className="space-y-4">
        {scriptures.map((verse) => (
          <li
            key={verse.reference}
            className="border-l-2 border-church-gold/60 pl-3 md:pl-4"
          >
            <p className="text-church-burgundy serif text-sm md:text-[15px] leading-relaxed italic">
              “{verse.text}”
            </p>
            <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-church-gold">
              {verse.reference}
            </p>
          </li>
        ))}
      </ul>
    </aside>
  );

  return (
    <div className="bg-gray-50 min-h-screen pt-24 md:pt-28 pb-12 md:pb-14 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 md:px-6">
        <Link
          to="/store"
          className="mb-5 md:mb-6 inline-flex items-center gap-2 min-h-[44px] text-church-gold font-semibold uppercase tracking-widest text-[10px] group"
        >
          <i className="fa-solid fa-arrow-left text-[10px] group-hover:-translate-x-0.5 transition-transform" />
          Back to AWC Store
        </Link>

        <div className="mb-5 md:mb-7">
          <span className="text-church-gold font-semibold tracking-[0.25em] uppercase text-[9px] mb-1 block">
            Collection
          </span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-church-burgundy serif mb-1">
            {meta.name}
          </h1>
          <p className="text-sm text-slate-500 font-light max-w-lg leading-relaxed">
            {meta.tagline}
          </p>
        </div>

        {/* Mobile: compact scripture strip above products */}
        <div className="lg:hidden mb-6 rounded-xl bg-white border border-gray-100 shadow-sm p-4 sm:p-5">
          <div className="mb-3">
            <span className="text-church-gold font-semibold tracking-[0.25em] uppercase text-[9px] block">
              Word for this collection
            </span>
          </div>
          <div className="space-y-3">
            {scriptures.slice(0, 2).map((verse) => (
              <div key={verse.reference} className="border-l-2 border-church-gold/60 pl-3">
                <p className="text-church-burgundy serif text-sm leading-snug italic line-clamp-3">
                  “{verse.text}”
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-church-gold">
                  {verse.reference}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <Link
                    to={`/store/product/${product.id}`}
                    className="group block bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="aspect-square sm:aspect-[4/5] max-h-[180px] sm:max-h-none overflow-hidden relative bg-slate-100">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-2 sm:p-2.5 md:p-3">
                      <h3 className="text-[11px] sm:text-xs md:text-sm font-semibold text-church-burgundy serif leading-snug mb-0.5 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-church-burgundy font-semibold text-xs sm:text-sm">
                        {formatPrice(product.priceCents)}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Desktop: sticky scripture panel fills blank space beside cards */}
          <div className="hidden lg:block">
            <div className="sticky top-28 rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
              {scripturePanel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreCatalog;
