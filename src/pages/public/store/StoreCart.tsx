import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, getProductById, getProductColor } from '../../../data/storeProducts';
import { useCart } from '../../../context/CartContext';

const StoreCart: React.FC = () => {
  const { items, updateQty, removeItem, subtotalCents, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen pt-24 md:pt-28 pb-14">
        <div className="max-w-3xl mx-auto px-5 md:px-6 text-center">
          <span className="text-church-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-3 block">
            Your Cart
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-church-burgundy serif mb-3">
            Cart is empty
          </h1>
          <p className="text-slate-500 text-sm mb-8">Browse a ministry collection to add apparel.</p>
          <Link
            to="/store"
            className="inline-flex items-center justify-center min-h-[44px] bg-church-burgundy text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-church-gold transition-all"
          >
            Go to AWC Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-24 md:pt-28 pb-14">
      <div className="max-w-4xl mx-auto px-5 md:px-6">
        <Link
          to="/store"
          className="mb-6 md:mb-8 inline-flex items-center gap-2 text-church-gold font-semibold uppercase tracking-widest text-[10px] group"
        >
          <i className="fa-solid fa-arrow-left text-[10px] group-hover:-translate-x-0.5 transition-transform" />
          Continue Shopping
        </Link>

        <div className="mb-6 md:mb-8">
          <span className="text-church-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-2 block">
            Your Cart
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-church-burgundy serif">
            {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
          </h1>
        </div>

        <div className="space-y-3 mb-8">
          {items.map((item) => {
            const product = getProductById(item.productId);
            if (!product) return null;
            const colorMeta = getProductColor(product, item.color);
            return (
              <div
                key={`${item.productId}-${item.size}-${item.color}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-5 flex flex-row gap-3 sm:gap-4 items-start sm:items-center"
              >
                <Link
                  to={`/store/product/${product.id}`}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover object-top"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/store/product/${product.id}`}
                    className="font-semibold text-church-burgundy serif text-base sm:text-lg hover:text-church-gold transition-colors line-clamp-2"
                  >
                    {product.name}
                  </Link>
                  <p className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider mt-1 flex items-center gap-2">
                    {colorMeta && (
                      <span
                        className="inline-block w-3 h-3 rounded-full ring-1 ring-gray-200 shrink-0"
                        style={{ backgroundColor: colorMeta.hex }}
                        aria-hidden
                      />
                    )}
                    <span className="truncate">
                      {colorMeta?.name ?? item.color} · Size: {item.size}
                    </span>
                  </p>
                  <p className="text-church-burgundy font-semibold mt-1 text-sm sm:text-base">
                    {formatPrice(product.priceCents)}
                  </p>
                  <div className="flex items-center justify-between gap-3 mt-3 sm:mt-2">
                    <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, item.size, item.color, item.quantity - 1)}
                        className="px-3 py-2 text-slate-500 hover:bg-slate-50 min-h-[40px]"
                      >
                        −
                      </button>
                      <span className="px-3 py-1.5 font-semibold text-sm min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, item.size, item.color, item.quantity + 1)}
                        className="px-3 py-2 text-slate-500 hover:bg-slate-50 min-h-[40px]"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.size, item.color)}
                      className="text-slate-400 hover:text-red-600 text-[10px] font-bold uppercase tracking-wider py-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-1">
              Subtotal
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-church-burgundy">
              {formatPrice(subtotalCents)}
            </p>
          </div>
          <Link
            to="/store/checkout"
            className="inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] text-center bg-church-burgundy hover:bg-church-gold text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StoreCart;
