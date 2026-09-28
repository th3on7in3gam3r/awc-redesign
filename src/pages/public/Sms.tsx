import * as React from 'react';
import { Link } from 'react-router-dom';
import { AWC_VAULT_LOGIN_URL } from '../../constants';

const Sms: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden">
                <div className="bg-church-burgundy py-16 px-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                    <h1 className="text-4xl md:text-5xl font-serif text-white relative z-10">SMS Program</h1>
                    <p className="text-white/60 mt-4 font-bold uppercase tracking-widest text-xs relative z-10">Last Updated: September 28, 2026</p>
                </div>

                <div className="p-8 md:p-16 prose prose-slate max-w-none">
                    <p className="lead text-lg text-slate-600 mb-8">
                        Anointed Worship Center / AWC Vault sends optional sign-in codes.
                    </p>

                    <h2 className="text-2xl font-serif text-church-burgundy mt-12 mb-6">How to Opt In</h2>
                    <p>
                        People opt in by entering their number on the{' '}
                        <a href={AWC_VAULT_LOGIN_URL} target="_blank" rel="noopener noreferrer">
                            Vault login page
                        </a>.
                    </p>

                    <h2 className="text-2xl font-serif text-church-burgundy mt-12 mb-6">Message and Data Rates</h2>
                    <p>
                        Message/data rates may apply.
                    </p>

                    <h2 className="text-2xl font-serif text-church-burgundy mt-12 mb-6">Opt Out and Help</h2>
                    <p>
                        Reply STOP to opt out, HELP for help.
                    </p>

                    <h2 className="text-2xl font-serif text-church-burgundy mt-12 mb-6">Privacy</h2>
                    <p>
                        For details about how we handle personal information, please review our{' '}
                        <Link to="/privacy">Privacy Policy</Link>.
                    </p>

                    <h2 className="text-2xl font-serif text-church-burgundy mt-12 mb-6">Contact Us</h2>
                    <p>
                        If you need help with AWC Vault sign-in codes, please contact us at:
                    </p>
                    <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-church-gold mt-6">
                        <p className="font-bold text-church-burgundy mb-2">Anointed Worship Center</p>
                        <p className="text-slate-600">4 School St, Acton, MA 01720</p>
                        <p className="text-slate-600">Email: anointedworshipcenter@gmail.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sms;
