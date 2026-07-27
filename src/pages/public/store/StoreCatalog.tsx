import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  formatPrice,
  getMinistryMeta,
  getProductsByMinistry,
  isStoreMinistry,
} from '../../../data/storeProducts';

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

  return (
    <div className="bg-gray-50 min-h-screen pt-24 md:pt-28 pb-14">
      <div className="max-w-5xl mx-auto px-5 md:px-6">
        <Link
          to="/store"
          className="mb-6 inline-flex items-center gap-2 text-church-gold font-semibold uppercase tracking-widest text-[10px] group"
        >
          <i className="fa-solid fa-arrow-left text-[10px] group-hover:-translate-x-0.5 transition-transform" />
          Back to AWC Store
        </Link>

        <div className="mb-7">
          <span className="text-church-gold font-semibold tracking-[0.25em] uppercase text-[9px] mb-1.5 block">
            Collection
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-church-burgundy serif mb-1.5">
            {meta.name}
          </h1>
          <p className="text-sm text-slate-500 font-light max-w-lg leading-relaxed">
            {meta.tagline}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
                <div className="aspect-square sm:aspect-[4/5] overflow-hidden relative bg-slate-100">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-2.5 sm:p-3">
                  <h3 className="text-xs sm:text-sm font-semibold text-church-burgundy serif leading-snug mb-0.5 line-clamp-2">
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
    </div>
  );
};

export default StoreCatalog;
