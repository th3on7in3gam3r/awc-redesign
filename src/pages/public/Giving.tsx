import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HandHeart,
  Shield,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  CreditCard,
  Landmark,
  Receipt,
  Mail,
} from 'lucide-react';

/**
 * Online giving runs on AWC Tithe so every gift is confirmed (by Stripe, or
 * by Finance for Zelle / Venmo / Cash App) and recorded in the church's
 * Digital Contribution Book. This page explains and links to it.
 */
const DEFAULT_TITHE_URL = 'https://awc-tithe.onrender.com';

function titheBase(): string {
  const raw = (import.meta.env.VITE_TITHE_URL as string | undefined)?.trim() || DEFAULT_TITHE_URL;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.hostname === 'localhost' ? url.origin : DEFAULT_TITHE_URL;
  } catch {
    return DEFAULT_TITHE_URL;
  }
}

type Method = 'card' | 'bank' | 'zelle' | 'cashapp' | 'venmo';

function giveUrl(method?: Method): string {
  const params = new URLSearchParams({ from: 'website' });
  if (method) params.set('method', method);
  return `${titheBase()}/?${params.toString()}`;
}

const MY_GIVING_URL = () => `${titheBase()}/?tab=my-giving&from=website`;

const METHODS: Array<{ id: Method; title: string; note: string; icon: React.ReactNode }> = [
  { id: 'card', title: 'Card, Apple Pay or Google Pay', note: 'One-time, weekly or monthly', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'bank', title: 'Bank account', note: 'Lowest fee for the church', icon: <Landmark className="w-5 h-5" /> },
  { id: 'zelle', title: 'Zelle', note: 'From your bank’s app', icon: <span className="font-black text-sm">Z</span> },
  { id: 'cashapp', title: 'Cash App', note: '$awcgiveplus', icon: <span className="font-black text-lg leading-none">$</span> },
  { id: 'venmo', title: 'Venmo', note: 'Church business profile', icon: <span className="font-black text-sm">V</span> },
];

const FAQ = [
  {
    q: 'Is online giving secure?',
    a: 'Yes. Card and bank gifts are processed by Stripe. Anointed Worship Center never sees or stores your card or bank details.',
  },
  {
    q: 'Can I make a recurring gift?',
    a: 'Yes. Choose weekly, every two weeks, monthly or yearly when you give by card or bank account. You can change or stop it any time from My giving.',
  },
  {
    q: 'How do Zelle, Cash App and Venmo gifts work?',
    a: 'The giving page gives you a short code (like AWC-7K3Q) to put in your payment note. Our Finance team uses it to match your gift, usually within 2 business days, and then emails your receipt.',
  },
  {
    q: 'Will I receive a receipt?',
    a: 'Yes. Every confirmed gift gets an email receipt, and you can download your history and year-end statement from My giving.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. Just enter your name and email when you give. To see past gifts later, open My giving and sign in with a code sent to that email.',
  },
  {
    q: 'I already give through Vanco. Do I need to change anything?',
    a: 'Your Vanco recurring gift keeps working. You can manage it on Vanco, or set up a new gift here and cancel the Vanco one when you are ready.',
  },
];

const Giving: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="bg-stone-50 min-h-screen">
      <section className="bg-church-burgundy text-white py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 border border-church-gold/40 mb-6">
            <HandHeart className="w-7 h-7 text-church-gold" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Give to Anointed Worship Center</h1>
          <p className="text-white/90 text-lg leading-relaxed max-w-2xl mx-auto">
            Your generosity helps Anointed Worship Center continue its ministry, serve its church family, and share the
            love of Christ. Thank you for giving faithfully.
          </p>
          <p className="text-church-gold/90 text-sm mt-4 font-medium tracking-wide">Where Everybody is Somebody</p>
          <a
            href={giveUrl()}
            className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-church-gold text-church-burgundy font-bold rounded-full hover:bg-white transition-colors"
          >
            Give now
            <ArrowUpRight className="w-5 h-5" />
          </a>
          <p className="flex items-center justify-center gap-2 text-xs text-white/70 mt-6">
            <Shield className="w-4 h-4" />
            Secure giving with a receipt for every gift
          </p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 py-12">
        <h2 className="text-lg font-bold text-church-burgundy mb-1">Choose how to give</h2>
        <p className="text-sm text-slate-600 mb-4">Each option opens our secure giving page with it already selected.</p>
        <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 overflow-hidden">
          {METHODS.map((m) => (
            <a
              key={m.id}
              href={giveUrl(m.id)}
              className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50 transition-colors"
            >
              <span className="w-10 h-10 rounded-xl bg-church-burgundy/10 text-church-burgundy flex items-center justify-center shrink-0">
                {m.icon}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-semibold text-slate-900">{m.title}</span>
                <span className="block text-sm text-slate-500">{m.note}</span>
              </span>
              <ArrowUpRight className="w-5 h-5 text-slate-400 shrink-0" />
            </a>
          ))}
        </div>

        <a
          href={MY_GIVING_URL()}
          className="mt-4 flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border border-church-gold/40 hover:bg-stone-50 transition-colors"
        >
          <Receipt className="w-5 h-5 text-church-burgundy shrink-0" />
          <span className="flex-1">
            <span className="block font-semibold text-slate-900">My giving &amp; receipts</span>
            <span className="block text-sm text-slate-500">Past gifts, recurring gifts and year-end statements</span>
          </span>
          <ArrowUpRight className="w-5 h-5 text-slate-400 shrink-0" />
        </a>
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-12">
        <h2 className="text-lg font-bold text-church-burgundy mb-4">Other ways to give</h2>
        <ul className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 text-sm text-slate-700">
          <li className="px-5 py-4">In person during worship services</li>
          <li className="px-5 py-4 flex items-start gap-2">
            <Mail className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
            <span>By check, mailed to 4 School St, Acton, MA 01720</span>
          </li>
          <li className="px-5 py-4">
            Already set up with Vanco?{' '}
            <a
              href="https://secure.myvanco.com/YKB0/campaign/C-1218F?access=tile_direct"
              target="_blank"
              rel="noopener noreferrer"
              className="text-church-burgundy font-semibold underline underline-offset-2"
            >
              Manage your Vanco gift
            </a>{' '}
            or text to give at 855-625-4703.
          </li>
        </ul>
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-20">
        <h2 className="text-lg font-bold text-church-burgundy mb-4">Giving FAQ</h2>
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <div key={item.q} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
              <button
                type="button"
                aria-expanded={expandedFaq === i}
                className="w-full flex justify-between items-center gap-3 px-5 py-4 text-left font-semibold text-slate-800"
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
              >
                {item.q}
                {expandedFaq === i ? <ChevronUp className="w-5 h-5 shrink-0" /> : <ChevronDown className="w-5 h-5 shrink-0" />}
              </button>
              {expandedFaq === i && <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{item.a}</p>}
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-600 mt-6">
          Questions about a gift?{' '}
          <a href="mailto:stewardship@anointedworshipcenter.com" className="text-church-burgundy font-medium">
            stewardship@anointedworshipcenter.com
          </a>
        </p>
        <p className="mt-8 text-center">
          <Link to="/" className="text-church-burgundy font-semibold hover:underline">
            ← Back to home
          </Link>
        </p>
      </section>
    </div>
  );
};

export default Giving;
