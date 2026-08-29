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

type PaymentInfo = {
  cashappHandle: string;
  zelleTarget: string;
};

type Order = {
  id: string;
  customer_name: string;
  email: string;
  fulfillment: string;
  payment_method: string;
  status: string;
  total_cents: number;
  paid_at?: string | null;
  items: OrderItem[];
  payment_info?: PaymentInfo;
};

function statusLabel(status: string) {
  return status.replace(/_/g, ' ');
}

function paymentInstructions(order: Order): string {
  const info = order.payment_info;
  const shortId = order.id.slice(0, 8).toUpperCase();

  if (order.status === 'paid') {
    return 'Payment received — thank you! Your order is marked PAID.';
  }

  if (order.payment_method === 'pickup') {
    return 'Pay when you pick up your order at Anointed Worship Center (4 School St, Acton, MA).';
  }

  if (order.payment_method === 'cashapp') {
    const handle = info?.cashappHandle || '$AnointedWorshipCenter';
    return `Send payment via Cash App to ${handle}. Include order ${shortId} in the note.`;
  }

  if (order.payment_method === 'zelle') {
    const target = info?.zelleTarget || 'anointedworshipcenter@gmail.com';
    return `Send payment via Zelle to ${target}. Include order ${shortId} in the memo.`;
  }

  return 'We will follow up with payment instructions shortly.';
}

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
      <div className="bg-gray-50 min-h-screen pt-24 md:pt-28 pb-14 text-center px-5">
        <p className="text-slate-500">Invalid order.</p>
        <Link to="/store" className="text-church-gold font-bold mt-4 inline-block">
          Back to Store
        </Link>
      </div>
    );
  }

  const isPaid = order?.status === 'paid';

  return (
    <div className="bg-gray-50 min-h-screen pt-24 md:pt-28 pb-14 overflow-x-hidden">
      <div className="max-w-2xl mx-auto px-5 md:px-6">
        {loading && (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-church-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 text-sm">Loading your order…</p>
          </div>
        )}

        {!loading && needsEmail && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
            <h1 className="text-xl font-bold text-church-burgundy serif">Confirm your email</h1>
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
              className="w-full sm:w-auto min-h-[44px] bg-church-burgundy text-white px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest"
            >
              View Order
            </button>
          </div>
        )}

        {!loading && error && !needsEmail && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4 text-sm">{error}</p>
            <Link to="/store" className="text-church-gold font-bold uppercase tracking-widest text-[10px]">
              Back to Store
            </Link>
          </div>
        )}

        {!loading && order && (
          <div className="space-y-6">
            <div className="text-center">
              <div
                className={`w-12 h-12 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl ${
                  isPaid ? 'bg-green-600' : 'bg-church-gold'
                }`}
              >
                <i className={`fa-solid ${isPaid ? 'fa-check' : 'fa-clock'}`} />
              </div>
              <span className="text-church-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-2 block">
                {isPaid ? 'Payment Received' : 'Order Placed'}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-church-burgundy serif mb-1">
                {isPaid ? 'You are all set!' : 'Thank you!'}
              </h1>
              <p className="text-slate-500 text-sm">
                Order{' '}
                <span className="font-mono text-church-burgundy font-bold">
                  {order.id.slice(0, 8).toUpperCase()}
                </span>
              </p>
              <p className="mt-2">
                <span
                  className={`inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                    isPaid
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'pending_payment'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {statusLabel(order.status)}
                </span>
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-5">
              <div>
                <h2 className="text-base font-bold text-church-burgundy serif mb-2">Next steps</h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {paymentInstructions(order)}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-3">
                  Items
                </h3>
                <ul className="space-y-2 text-sm">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between gap-4 text-slate-600">
                      <span className="min-w-0 break-words">
                        {item.product_name} ({item.color}, {item.size}) × {item.quantity}
                      </span>
                      <span className="font-medium text-church-burgundy shrink-0">
                        {formatPrice(item.unit_price_cents * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                  <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400">
                    Total
                  </span>
                  <span className="text-xl font-bold text-church-burgundy">
                    {formatPrice(order.total_cents)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center flex flex-col sm:flex-row gap-2 justify-center">
              <button
                type="button"
                onClick={() => fetchOrder(id, emailParam || email || order.email)}
                className="inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] border border-gray-200 text-slate-600 px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:border-church-burgundy"
              >
                Refresh Status
              </button>
              <Link
                to="/store"
                className="inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] bg-church-burgundy text-white px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-church-gold transition-all"
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
