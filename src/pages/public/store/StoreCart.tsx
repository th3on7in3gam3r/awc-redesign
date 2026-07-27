import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, getProductById, getProductColor } from '../../../data/storeProducts';
import { useCart } from '../../../context/CartContext';

const StoreCart: React.FC = () => {
  const { items, updateQty, removeItem, subtotalCents, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="text-church-gold font-black tracking-[0.4em] uppercase text-xs mb-4 block">
            Your Cart
          </span>
          <h1 className="text-4xl font-bold text-church-burgundy serif mb-4">Cart is empty</h1>
          <p className="text-slate-500 mb-10">Browse a ministry collection to add apparel.</p>
          <Link
            to="/store"
            className="inline-block bg-church-burgundy text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-church-gold transition-all"
          >
            Go to AWC Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link
          to="/store"
          className="mb-10 inline-flex items-center gap-2 text-church-gold font-bold uppercase tracking-widest text-xs group"
        >
          <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform" />
          Continue Shopping
        </Link>

        <div className="mb-10">
          <span className="text-church-gold font-black tracking-[0.4em] uppercase text-xs mb-4 block">
            Your Cart
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-church-burgundy serif">
            {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
          </h1>
        </div>

        <div className="space-y-4 mb-10">
          {items.map((item) => {
            const product = getProductById(item.productId);
            if (!product) return null;
            const colorMeta = getProductColor(product, item.color);
            return (
              <div
                key={`${item.productId}-${item.size}-${item.color}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center"
              >
                <Link
                  to={`/store/product/${product.id}`}
                  className="w-full sm:w-24 h-40 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/store/product/${product.id}`}
                    className="font-bold text-church-burgundy serif text-lg hover:text-church-gold transition-colors"
                  >
                    {product.name}
                  </Link>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mt-1 flex items-center gap-2">
                    {colorMeta && (
                      <span
                        className="inline-block w-3 h-3 rounded-full ring-1 ring-gray-200"
                        style={{ backgroundColor: colorMeta.hex }}
                        aria-hidden
                      />
                    )}
                    {colorMeta?.name ?? item.color} · Size: {item.size}
                  </p>
                  <p className="text-church-burgundy font-bold mt-2">
                    {formatPrice(product.priceCents)}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateQty(item.productId, item.size, item.color, item.quantity - 1)}
                      className="px-3 py-1.5 text-slate-500 hover:bg-slate-50"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 font-bold text-sm min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.productId, item.size, item.color, item.quantity + 1)}
                      className="px-3 py-1.5 text-slate-500 hover:bg-slate-50"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.size, item.color)}
                    className="text-slate-400 hover:text-red-600 text-xs font-bold uppercase tracking-wider"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">
              Subtotal
            </p>
            <p className="text-3xl font-bold text-church-burgundy">{formatPrice(subtotalCents)}</p>
          </div>
          <Link
            to="/store/checkout"
            className="inline-block text-center bg-church-burgundy hover:bg-church-gold text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StoreCart;
