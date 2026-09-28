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
        body: 'People opt in by entering their number on the Vault login page. Providing your mobile number is voluntary. You will not receive a sign-in code unless you request one there.',
    },
    {
        icon: Shield,
        title: 'Message and data rates',
        body: 'Message/data rates may apply. Frequency depends on how often you request a sign-in code. Carrier charges are billed by your wireless provider, not by the church.',
    },
    {
        icon: HelpCircle,
        title: 'Opt out and help',
        body: 'Reply STOP to opt out, HELP for help. After you reply STOP, you will no longer receive AWC Vault sign-in codes at that number unless you opt in again.',
    },
];

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
                        Last updated September 28, 2026
                    </p>
                </div>
            </section>

            <section className="px-6 pb-24">
                <div className="mx-auto max-w-5xl -mt-10">
                    <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-xl md:p-12">
                        <p className="max-w-3xl text-lg leading-relaxed text-slate-600">
                            This page describes the Anointed Worship Center / AWC Vault text program. Please review
                            these terms before requesting a sign-in code. By entering your mobile number on the Vault
                            login page, you agree to receive the optional messages described here.
                        </p>

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
