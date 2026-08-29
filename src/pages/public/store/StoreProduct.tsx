import React, { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { formatPrice, getProductById, getMinistryMeta } from '../../../data/storeProducts';
import { useCart } from '../../../context/CartContext';

const StoreProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = id ? getProductById(id) : undefined;
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [size, setSize] = useState(product?.sizes[0] ?? '');
  const [color, setColor] = useState(product?.colors[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return <Navigate to="/store" replace />;
  }

  const ministry = getMinistryMeta(product.ministry);
  const selectedColor = product.colors.find((c) => c.id === color);
  const displayImage = product.colorImages?.[color] ?? product.imageUrl;

  const handleAdd = () => {
    if (!size || !color) return;
    addItem(product.id, size, color, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-24 md:pt-28 pb-14">
      <div className="max-w-5xl mx-auto px-5 md:px-6">
        <Link
          to={`/store/${product.ministry}`}
          className="mb-6 inline-flex items-center gap-2 text-church-gold font-semibold uppercase tracking-widest text-[10px] group"
        >
          <i className="fa-solid fa-arrow-left text-[10px] group-hover:-translate-x-0.5 transition-transform" />
          Back to {ministry?.name ?? 'Collection'}
        </Link>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
          <div className="aspect-square max-h-[280px] md:max-h-[420px] w-full mx-auto rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 relative flex items-center justify-center">
            <img
              key={displayImage}
              src={displayImage}
              alt={`${product.name}${selectedColor ? ` — ${selectedColor.name}` : ''}`}
              className="w-full h-full object-contain animate-[fadeIn_0.35s_ease-out]"
            />
          </div>

          <div className="space-y-5">
            <div>
              <span className="text-church-gold font-semibold tracking-[0.25em] uppercase text-[9px] mb-1.5 block">
                {ministry?.name}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-church-burgundy serif mb-1.5">
                {product.name}
              </h1>
              <p className="text-lg font-semibold text-church-burgundy mb-2">
                {formatPrice(product.priceCents)}
              </p>
              <p className="text-slate-600 text-sm font-light leading-relaxed">
                {product.description}
              </p>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-2">
                Color{selectedColor ? ` — ${selectedColor.name}` : ''}
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => {
                  const isSelected = color === c.id;
                  const isLight =
                    c.id === 'white' ||
                    c.id === 'gold' ||
                    c.id === 'pink' ||
                    c.id === 'cream' ||
                    c.id === 'heather';
                  return (
                    <button
                      key={c.id}
                      type="button"
                      title={c.name}
                      aria-label={c.name}
                      aria-pressed={isSelected}
                      onClick={() => setColor(c.id)}
                      className={`relative w-9 h-9 sm:w-8 sm:h-8 rounded-full transition-all ${
                        isSelected
                          ? 'ring-2 ring-offset-1 ring-church-burgundy scale-105'
                          : 'ring-1 ring-gray-200 hover:ring-church-gold'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && (
                        <span
                          className={`absolute inset-0 flex items-center justify-center text-[10px] ${
                            isLight ? 'text-church-burgundy' : 'text-white'
                          }`}
                        >
                          <i className="fa-solid fa-check" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-2">
                Size
              </label>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`min-w-[2.75rem] min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all ${
                      size === s
                        ? 'bg-church-burgundy text-white'
                        : 'bg-white border border-gray-200 text-slate-600 hover:border-church-gold'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-2">
                Quantity
              </label>
              <div className="inline-flex items-center border border-gray-200 rounded-md bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2.5 sm:px-3 sm:py-1.5 text-slate-500 hover:bg-slate-50 text-sm min-h-[44px] sm:min-h-0"
                >
                  −
                </button>
                <span className="px-3 py-1.5 font-semibold text-church-burgundy text-sm min-w-[2.25rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-4 py-2.5 sm:px-3 sm:py-1.5 text-slate-500 hover:bg-slate-50 text-sm min-h-[44px] sm:min-h-0"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleAdd}
                className="w-full sm:w-auto min-h-[44px] bg-church-burgundy hover:bg-church-gold text-white px-5 py-3 sm:py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                {added ? 'Added to Cart' : 'Add to Cart'}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAdd();
                  navigate('/store/cart');
                }}
                className="w-full sm:w-auto min-h-[44px] bg-white border border-church-burgundy text-church-burgundy hover:bg-church-burgundy hover:text-white px-5 py-3 sm:py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreProduct;
