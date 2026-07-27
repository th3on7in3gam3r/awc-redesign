import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { formatPrice } from '../../../data/storeProducts';

type OrderItem = {
  product_id: string;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  unit_price_cents: number;
};

type Order = {
  id: string;
  customer_name: string;
  email: string;
  fulfillment: string;
  payment_method: string;
  status: string;
  total_cents: number;
  items: OrderItem[];
};

const PAYMENT_COPY: Record<string, string> = {
  pickup:
    'Pay when you pick up your order at Anointed Worship Center (4 School St, Acton, MA).',
  cashapp:
    'Send payment via Cash App to the church handle, and include your order ID in the note.',
  zelle:
    'Send payment via Zelle to anointedworshipcenter@gmail.com, and include your order ID in the memo.',
};

const StoreOrderConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const [order, setOrder] = useState<Order | null>(null);
  const [email, setEmail] = useState(emailParam);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const [needsEmail, setNeedsEmail] = useState(false);

  const fetchOrder = async (orderId: string, orderEmail?: string) => {
    setLoading(true);
    setError(null);
    try {
      const qs = orderEmail ? `?email=${encodeURIComponent(orderEmail)}` : '';
      const res = await fetch(`/api/store/orders/${orderId}${qs}`);
      const data = await res.json();
      if (res.status === 401 || data.requiresEmail) {
        setNeedsEmail(true);
        setOrder(null);
        return;
      }
      if (!res.ok) {
        throw new Error(data.message || 'Order not found');
      }
      setOrder(data);
      setNeedsEmail(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load order');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder(id, emailParam || undefined);
    }
  }, [id, emailParam]);

  if (!id) {
    return (
      <div className="bg-gray-50 min-h-screen pt-32 pb-20 text-center px-6">
        <p className="text-slate-500">Invalid order.</p>
        <Link to="/store" className="text-church-gold font-bold mt-4 inline-block">
          Back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-32 pb-20">
      <div className="max-w-2xl mx-auto px-6">
        {loading && (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-church-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Loading your order…</p>
          </div>
        )}

        {!loading && needsEmail && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-4">
            <h1 className="text-2xl font-bold text-church-burgundy serif">Confirm your email</h1>
            <p className="text-slate-500 text-sm">
              Enter the email used at checkout to view order details.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-gold/40"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="button"
              onClick={() => fetchOrder(id, email)}
              className="bg-church-burgundy text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest"
            >
              View Order
            </button>
          </div>
        )}

        {!loading && error && !needsEmail && (
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">{error}</p>
            <Link to="/store" className="text-church-gold font-bold uppercase tracking-widest text-xs">
              Back to Store
            </Link>
          </div>
        )}

        {!loading && order && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                <i className="fa-solid fa-check" />
              </div>
              <span className="text-church-gold font-black tracking-[0.4em] uppercase text-xs mb-4 block">
                Order Confirmed
              </span>
              <h1 className="text-4xl font-bold text-church-burgundy serif mb-2">Thank you!</h1>
              <p className="text-slate-500">
                Order <span className="font-mono text-church-burgundy font-bold">{order.id.slice(0, 8)}</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-church-burgundy serif mb-2">Next steps</h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {PAYMENT_COPY[order.payment_method] ||
                    'We will follow up with payment instructions shortly.'}
                </p>
                {order.fulfillment === 'pickup' && (
                  <p className="text-slate-600 text-sm mt-2">
                    Status: <strong className="text-church-burgundy">{order.status.replace(/_/g, ' ')}</strong>
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">
                  Items
                </h3>
                <ul className="space-y-3 text-sm">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between gap-4 text-slate-600">
                      <span>
                        {item.product_name} ({item.color}, {item.size}) × {item.quantity}
                      </span>
                      <span className="font-medium text-church-burgundy">
                        {formatPrice(item.unit_price_cents * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-church-burgundy">
                    {formatPrice(order.total_cents)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/store"
                className="inline-block bg-church-burgundy text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-church-gold transition-all"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreOrderConfirmation;
