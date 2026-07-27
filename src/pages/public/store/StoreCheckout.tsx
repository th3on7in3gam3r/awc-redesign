import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { formatPrice, getProductById, getProductColor } from '../../../data/storeProducts';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';

type Fulfillment = 'pickup' | 'ship';
type PaymentMethod = 'pickup' | 'cashapp' | 'zelle';

const StoreCheckout: React.FC = () => {
  const { items, subtotalCents, clear } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [fulfillment, setFulfillment] = useState<Fulfillment>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pickup');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return <Navigate to="/store/cart" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch('/api/store/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerName,
          email,
          phone,
          fulfillment,
          paymentMethod,
          shipping: fulfillment === 'ship'
            ? { addressLine1, addressLine2, city, state, zip }
            : undefined,
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Could not place order');
      }

      clear();
      navigate(`/store/order/${data.id}?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <Link
          to="/store/cart"
          className="mb-10 inline-flex items-center gap-2 text-church-gold font-bold uppercase tracking-widest text-xs group"
        >
          <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform" />
          Back to Cart
        </Link>

        <div className="mb-10">
          <span className="text-church-gold font-black tracking-[0.4em] uppercase text-xs mb-4 block">
            Checkout
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-church-burgundy serif">
            Complete Your Order
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 space-y-8">
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-church-burgundy serif">Contact</h2>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
                  Full Name
                </label>
                <input
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-gold/40"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-gold/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
                    Phone
                  </label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-gold/40"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-church-burgundy serif">Fulfillment</h2>
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    { id: 'pickup', label: 'Pickup at Church' },
                    { id: 'ship', label: 'Ship to Address' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFulfillment(opt.id)}
                    className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      fulfillment === opt.id
                        ? 'bg-church-burgundy text-white'
                        : 'bg-slate-50 text-slate-600 border border-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {fulfillment === 'ship' && (
                <div className="space-y-4 pt-2">
                  <input
                    required
                    placeholder="Address line 1"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-gold/40"
                  />
                  <input
                    placeholder="Address line 2 (optional)"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-gold/40"
                  />
                  <div className="grid sm:grid-cols-3 gap-4">
                    <input
                      required
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-gold/40"
                    />
                    <input
                      required
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-gold/40"
                    />
                    <input
                      required
                      placeholder="ZIP"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-gold/40"
                    />
                  </div>
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-church-burgundy serif">Payment</h2>
              <p className="text-slate-500 text-sm font-light">
                Online card payments are coming soon. Choose how you would like to pay for this order.
              </p>
              <div className="space-y-2">
                {(
                  [
                    { id: 'pickup', label: 'Pay at Church Pickup' },
                    { id: 'cashapp', label: 'Cash App' },
                    { id: 'zelle', label: 'Zelle' },
                  ] as const
                ).map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === opt.id
                        ? 'border-church-gold bg-church-gold/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === opt.id}
                      onChange={() => setPaymentMethod(opt.id)}
                      className="accent-church-burgundy"
                    />
                    <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 sticky top-28 space-y-6">
              <h2 className="text-lg font-bold text-church-burgundy serif">Order Summary</h2>
              <ul className="space-y-3 text-sm">
                {items.map((item) => {
                  const product = getProductById(item.productId);
                  if (!product) return null;
                  const colorMeta = getProductColor(product, item.color);
                  return (
                    <li
                      key={`${item.productId}-${item.size}-${item.color}`}
                      className="flex justify-between gap-4 text-slate-600"
                    >
                      <span>
                        {product.name} ({colorMeta?.name ?? item.color}, {item.size}) × {item.quantity}
                      </span>
                      <span className="font-medium text-church-burgundy whitespace-nowrap">
                        {formatPrice(product.priceCents * item.quantity)}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                  Total
                </span>
                <span className="text-2xl font-bold text-church-burgundy">
                  {formatPrice(subtotalCents)}
                </span>
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-church-burgundy hover:bg-church-gold disabled:opacity-60 text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                {submitting ? 'Placing Order…' : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreCheckout;
