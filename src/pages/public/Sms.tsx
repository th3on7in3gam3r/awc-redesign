import * as React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, HelpCircle, Mail, MapPin, MessageSquare, Phone, Shield } from 'lucide-react';
import { AWC_VAULT_LOGIN_URL, CHURCH_NAME } from '../../constants';

const disclosures = [
    {
        icon: MessageSquare,
        title: 'What we send',
        body: 'Anointed Worship Center / AWC Vault sends optional sign-in codes. These messages are used only to help members sign in to Vault. We do not use this program for marketing or promotional texts.',
    },
    {
        icon: Phone,
        title: 'How to opt in',
        body: 'Members opt in on the AWC Vault sign-in page by entering their mobile number and checking the text-message consent box (it is never pre-checked). Opting in is voluntary and not a condition of membership. No text is sent unless you request a code there.',
    },
    {
        icon: Shield,
        title: 'Message and data rates',
        body: 'Message and data rates may apply. Message frequency varies: one text each time you request a sign-in code. Carrier charges are billed by your wireless provider, not by the church.',
    },
    {
        icon: HelpCircle,
        title: 'Opt out and help',
        body: 'Reply STOP to opt out, HELP for help. After you reply STOP, you will no longer receive AWC Vault sign-in codes at that number unless you opt in again.',
    },
];

const CONSENT_TEXT =
    'I agree to receive one-time sign-in codes by text message from Anointed Worship Center (AWC Vault) at the mobile number above. Message frequency varies (one text per sign-in request). Message and data rates may apply. Reply STOP to opt out, HELP for help. Consent is not a condition of membership.';

/** Static replica of the opt-in on the AWC Vault sign-in page, for carrier review. */
const OptInExample: React.FC = () => (
    <figure className="mt-12" aria-labelledby="optin-example-caption">
        <h2 id="optin-example-caption" className="font-serif text-2xl text-church-burgundy md:text-3xl">
            How members opt in
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-600">
            This is the opt-in on the AWC Vault sign-in page, where texts are requested. The consent box starts
            unchecked, and the Send code button stays disabled until the member checks it.
        </p>

        <div className="mt-8 rounded-[1.75rem] bg-[#F9F9F7] p-4 sm:p-8">
            <div className="mx-auto max-w-md rounded-[1.5rem] bg-[#400010] p-6 text-white shadow-2xl sm:p-8" role="img" aria-label="Example of the AWC Vault text-message sign-in screen with consent checkbox">
                <p className="text-center text-3xl font-black uppercase tracking-tight">
                    AWC <span className="text-church-gold">Vault</span>
                </p>
                <p className="mt-1 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-white/50">
                    Anointed Worship Center
                </p>

                <p className="mt-8 text-sm font-semibold text-white/80">Sign in with a text code</p>
                <label className="mt-3 block text-xs font-bold uppercase tracking-[0.15em] text-white/60">
                    Mobile number
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-2xl bg-white px-4 py-4 text-[#400010]">
                    <Phone className="h-5 w-5 text-[#400010]/50" aria-hidden="true" />
                    <span className="text-base text-slate-400">(555) 555-0123</span>
                </div>

                <div className="mt-5 flex items-start gap-3">
                    <span className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-white/60 bg-transparent" aria-hidden="true" />
                    <p className="text-[13px] leading-relaxed text-white/85">
                        {CONSENT_TEXT} See our{' '}
                        <Link to="/terms" className="font-semibold text-church-gold underline underline-offset-2">Terms</Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="font-semibold text-church-gold underline underline-offset-2">Privacy Policy</Link>.
                    </p>
                </div>

                <div className="mt-6 w-full rounded-2xl bg-church-gold/40 py-4 text-center text-sm font-black uppercase tracking-[0.2em] text-[#400010]/70">
                    Send code
                </div>
                <p className="mt-4 text-center text-[11px] leading-relaxed text-white/45">
                    No mobile information will be shared with third parties or affiliates for marketing or promotional
                    purposes.
                </p>
            </div>
        </div>

        <figcaption className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-6">
            <p className="text-sm font-bold text-church-burgundy">Example message</p>
            <p className="mt-2 font-mono text-sm text-slate-700">
                AWC Vault: your sign-in code is 123456. Do not share this code. Reply STOP to opt out.
            </p>
        </figcaption>
    </figure>
);

const Sms: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <section className="relative overflow-hidden bg-church-burgundy pt-36 pb-20 px-6">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
                <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-church-gold/10 blur-3xl" />
                <div className="absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

                <div className="relative z-10 mx-auto max-w-3xl text-center">
                    <p className="mb-5 text-xs font-black uppercase tracking-[0.4em] text-church-gold">
                        Text Messaging
                    </p>
                    <h1 className="font-serif text-4xl text-white md:text-6xl">SMS Program</h1>
                    <div className="mx-auto mt-6 h-px w-16 bg-church-gold/70" />
                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
                        Official messaging details for optional AWC Vault sign-in codes from {CHURCH_NAME}.
                    </p>
                    <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.28em] text-white/45">
                        Last updated October 21, 2026
                    </p>
                </div>
            </section>

            <section className="px-6 pb-24">
                <div className="mx-auto max-w-5xl -mt-10">
                    <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-xl md:p-12">
                        <p className="max-w-3xl text-lg leading-relaxed text-slate-600">
                            This page describes the Anointed Worship Center / AWC Vault text program. Please review
                            these terms before requesting a sign-in code. By entering your mobile number on the Vault
                            sign-in page and checking the consent box, you agree to receive the optional messages
                            described here.
                        </p>

                        <OptInExample />

                        <div className="mt-12 grid gap-6 md:grid-cols-2">
                            {disclosures.map(({ icon: Icon, title, body }) => (
                                <article
                                    key={title}
                                    className="rounded-2xl border border-slate-100 bg-slate-50/80 p-7"
                                >
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-church-burgundy text-church-gold">
                                        <Icon className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                    <h2 className="font-serif text-2xl text-church-burgundy">{title}</h2>
                                    <p className="mt-3 leading-relaxed text-slate-600">{body}</p>
                                </article>
                            ))}
                        </div>

                        <div className="mt-12 overflow-hidden rounded-2xl border border-church-gold/20 bg-church-burgundy text-white">
                            <div className="grid md:grid-cols-2">
                                <div className="border-white/10 p-8 md:border-r">
                                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-church-gold">
                                        Reply STOP
                                    </p>
                                    <p className="mt-3 text-lg leading-relaxed text-white/80">
                                        Reply <span className="font-semibold text-white">STOP</span> to opt out of
                                        AWC Vault sign-in codes at any time.
                                    </p>
                                </div>
                                <div className="p-8">
                                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-church-gold">
                                        Reply HELP
                                    </p>
                                    <p className="mt-3 text-lg leading-relaxed text-white/80">
                                        Reply <span className="font-semibold text-white">HELP</span> for help, or
                                        contact the church using the details below.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                            <a
                                href={AWC_VAULT_LOGIN_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-church-burgundy px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-church-burgundy-light"
                            >
                                Vault login page
                                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            </a>
                            <Link
                                to="/privacy"
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-church-burgundy transition-colors hover:border-church-gold hover:text-church-gold"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                to="/terms"
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-church-burgundy transition-colors hover:border-church-gold hover:text-church-gold"
                            >
                                Terms
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-lg md:p-10">
                        <h2 className="font-serif text-2xl text-church-burgundy">Contact the church</h2>
                        <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">
                            If you need help with AWC Vault sign-in codes, or have a question about this SMS program,
                            reach Anointed Worship Center at:
                        </p>
                        <div className="mt-6 space-y-4">
                            <p className="flex items-start gap-3 text-slate-700">
                                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-church-gold" aria-hidden="true" />
                                <span>4 School St, Acton, MA 01720</span>
                            </p>
                            <p className="flex items-start gap-3 text-slate-700">
                                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-church-gold" aria-hidden="true" />
                                <a
                                    href="mailto:anointedworshipcenter@gmail.com"
                                    className="font-medium text-church-burgundy hover:text-church-gold"
                                >
                                    anointedworshipcenter@gmail.com
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Sms;
