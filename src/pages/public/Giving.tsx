import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HandHeart, Shield, ChevronDown, ChevronUp, ExternalLink, Loader2 } from 'lucide-react';
import {
  createGivingCheckout,
  fetchGivingConfig,
  type GivingConfig,
  type GivingProvider,
} from '../../services/givingService';

const FAQ = [
  {
    q: 'Is online giving secure?',
    a: 'Yes. Gifts are processed through the church’s approved payment providers using industry-standard encryption. Anointed Worship Center does not store your card or bank details on this website.',
  },
  {
    q: 'Can I make a recurring gift?',
    a: 'Recurring gifts are available when supported by your selected provider (such as Vanco). Choose weekly or monthly on the form when that option is available.',
  },
  {
    q: 'Can I choose where my gift is applied?',
    a: 'Yes. Select the fund or designation that best matches how you would like your gift used.',
  },
  {
    q: 'Will I receive a receipt?',
    a: 'Your giving provider typically sends an email receipt for online gifts. Annual giving statements are available from the church for tax purposes.',
  },
  {
    q: 'Who should I contact about a giving record?',
    a: 'Contact the church finance team using the contact information shown below if you need help with a gift or statement.',
  },
  {
    q: 'Can I give without creating an account?',
    a: 'Yes. You do not need a church portal account to give online.',
  },
];

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

const Giving: React.FC = () => {
  const [config, setConfig] = useState<GivingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [amountCents, setAmountCents] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [fundId, setFundId] = useState<number | ''>('');
  const [frequency, setFrequency] = useState('one-time');
  const [providerKey, setProviderKey] = useState('');
  const [note, setNote] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const visibleProviders = config?.providers?.filter((p) => p) || [];
  const singleProvider = visibleProviders.length === 1 ? visibleProviders[0] : null;

  useEffect(() => {
    fetchGivingConfig()
      .then((data) => {
        setConfig(data);
        if (data.funds?.[0]) setFundId(data.funds[0].id);
        if (data.providers?.length === 1) setProviderKey(data.providers[0].providerKey);
        if (data.presetAmountsCents?.[0]) setAmountCents(data.presetAmountsCents[0]);
      })
      .catch(() => setError('Unable to load giving options. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (singleProvider && !providerKey) setProviderKey(singleProvider.providerKey);
  }, [singleProvider, providerKey]);

  const resolvedAmountCents = () => {
    if (customAmount.trim()) {
      const parsed = Math.round(parseFloat(customAmount) * 100);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return amountCents || 0;
  };

  const handleContinue = async () => {
    setError(null);
    const cents = resolvedAmountCents();
    if (cents < 100) {
      setError('Please enter an amount of at least $1.00.');
      return;
    }
    if (!fundId) {
      setError('Please select a fund.');
      return;
    }
    const pk = providerKey || singleProvider?.providerKey;
    if (!pk) {
      setError('Please select a giving provider.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createGivingCheckout({
        amountCents: cents,
        fundId: Number(fundId),
        providerKey: pk,
        frequency,
        note: note.trim() || undefined,
        anonymous,
      });

      const checkout = result.checkout;
      if (checkout.checkoutType === 'redirect' || checkout.checkoutType === 'cashapp_url') {
        if (checkout.redirectUrl) {
          window.location.href = checkout.redirectUrl;
          return;
        }
      }
      if (checkout.checkoutType === 'cashapp_copy' && checkout.cashAppHandle) {
        try {
          await navigator.clipboard.writeText(checkout.cashAppHandle);
        } catch {
          /* ignore */
        }
        window.location.href = `/giving/confirmation?ref=${encodeURIComponent(result.publicReference)}`;
        return;
      }
      if (checkout.checkoutType === 'unavailable') {
        setError(checkout.message || 'This provider is not available right now.');
        return;
      }
      window.location.href = `/giving/confirmation?ref=${encodeURIComponent(result.publicReference)}`;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const contactEmail = config?.contactEmail;
  const contactPhone = config?.contactPhone;

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero */}
      <section className="bg-church-burgundy text-white py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 border border-church-gold/40 mb-6">
            <HandHeart className="w-7 h-7 text-church-gold" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Give to Anointed Worship Center</h1>
          <p className="text-white/90 text-lg leading-relaxed max-w-2xl mx-auto">
            Your generosity helps Anointed Worship Center continue its ministry, serve its church family, and share the love of Christ. Thank you for giving faithfully.
          </p>
          <p className="text-church-gold/90 text-sm mt-4 font-medium tracking-wide">Where Everybody is Somebody</p>
          <a
            href="#giving-form"
            className="inline-block mt-8 px-8 py-3 bg-church-gold text-church-burgundy font-bold rounded-full hover:bg-white transition-colors"
          >
            Give Now
          </a>
          <p className="flex items-center justify-center gap-2 text-xs text-white/70 mt-6">
            <Shield className="w-4 h-4" />
            Secure giving through approved church payment providers
          </p>
        </div>
      </section>

      {/* Form */}
      <section id="giving-form" className="max-w-2xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-church-burgundy" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
            <p className="text-red-800">{error}</p>
            <p className="text-xs text-slate-500 mt-4">
              Make sure the API is running: <code className="bg-slate-100 px-1 rounded">npm run backend</code>
            </p>
          </div>
        ) : !config?.enabled ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-slate-600">
            <p>Online giving is being prepared. Please check back soon or give in person during worship.</p>
            {(config as GivingConfig & { error?: string })?.error && (
              <p className="text-xs text-slate-400 mt-3">{(config as GivingConfig & { error?: string }).error}</p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold text-church-burgundy">Your gift</h2>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Amount</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {(config.presetAmountsCents || [2500, 5000, 10000, 25000]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setAmountCents(c); setCustomAmount(''); }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                      amountCents === c && !customAmount
                        ? 'bg-church-burgundy text-white border-church-burgundy'
                        : 'border-stone-300 text-slate-700 hover:border-church-burgundy'
                    }`}
                  >
                    {formatCents(c)}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-4 py-3 text-lg"
                aria-label="Custom amount"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Fund / designation</label>
              <select
                value={fundId}
                onChange={(e) => setFundId(Number(e.target.value))}
                className="w-full border border-stone-300 rounded-lg px-4 py-3"
              >
                {config.funds.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-4 py-3"
              >
                <option value="one-time">One-time gift</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {visibleProviders.length > 1 && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Giving provider</label>
                <div className="space-y-2">
                  {visibleProviders.map((p: GivingProvider) => (
                    <label
                      key={p.providerKey}
                      className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer ${
                        providerKey === p.providerKey ? 'border-church-burgundy bg-rose-50/50' : 'border-stone-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="provider"
                        value={p.providerKey}
                        checked={providerKey === p.providerKey}
                        onChange={() => setProviderKey(p.providerKey)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">{p.displayName}</div>
                        {p.description && <p className="text-sm text-slate-600 mt-0.5">{p.description}</p>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full border border-stone-300 rounded-lg px-4 py-3 text-sm"
                placeholder="Optional message for the finance team"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
              Give anonymously (when supported by provider)
            </label>

            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3" role="alert">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleContinue}
              disabled={submitting}
              className="w-full py-4 bg-church-burgundy text-white font-bold rounded-xl hover:bg-church-burgundy/90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ExternalLink className="w-5 h-5" />}
              Continue to secure payment
            </button>
          </div>
        )}
      </section>

      {/* Other ways */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <h2 className="text-lg font-bold text-church-burgundy mb-4">Other ways to give</h2>
        <ul className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 text-sm text-slate-700">
          <li className="px-5 py-4">In-person during worship services</li>
          <li className="px-5 py-4">By mail to the church office (use the address on our Contact page)</li>
          <li className="px-5 py-4">Through the approved online providers above</li>
        </ul>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <h2 className="text-lg font-bold text-church-burgundy mb-4">Giving FAQ</h2>
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <div key={item.q} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
              <button
                type="button"
                className="w-full flex justify-between items-center px-5 py-4 text-left font-semibold text-slate-800"
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
              >
                {item.q}
                {expandedFaq === i ? <ChevronUp className="w-5 h-5 shrink-0" /> : <ChevronDown className="w-5 h-5 shrink-0" />}
              </button>
              {expandedFaq === i && (
                <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{item.a}</p>
              )}
            </div>
          ))}
        </div>
        {(contactEmail || contactPhone) && (
          <p className="text-sm text-slate-600 mt-6">
            Questions?{' '}
            {contactEmail && <a href={`mailto:${contactEmail}`} className="text-church-burgundy font-medium">{contactEmail}</a>}
            {contactEmail && contactPhone && ' · '}
            {contactPhone && <a href={`tel:${contactPhone}`} className="text-church-burgundy font-medium">{contactPhone}</a>}
          </p>
        )}
        <p className="mt-8 text-center">
          <Link to="/" className="text-church-burgundy font-semibold hover:underline">← Back to home</Link>
        </p>
      </section>
    </div>
  );
};

export default Giving;
