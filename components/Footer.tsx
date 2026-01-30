import React from 'react';
import { Link } from 'react-router-dom';
import { CHURCH_NAME } from '../src/constants';

const Footer: React.FC = () => {
    const logoUrl = "https://anointedworshipcenter.com/logo.png";

    return (
        <footer className="bg-church-burgundy text-white py-16">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-12 gap-12 border-b border-white/5 pb-12 mb-12">
                    {/* Brand Section */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-lg p-1">
                                <img src={logoUrl} className="w-full h-full object-contain" alt="Footer Logo" />
                            </div>
                            <h3 className="text-2xl font-bold uppercase tracking-tight">{CHURCH_NAME}</h3>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed italic max-w-xs">
                            "Transforming lives through the radical power of God's Word and the warmth of a loving community."
                        </p>
                        <div className="flex gap-4">
                            <i className="fa-brands fa-facebook-f text-white/50 hover:text-white transition-colors cursor-pointer"></i>
                            <i className="fa-brands fa-instagram text-white/50 hover:text-white transition-colors cursor-pointer"></i>
                            <i className="fa-brands fa-youtube text-white/50 hover:text-white transition-colors cursor-pointer"></i>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="md:col-span-2 space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-church-gold/60">Navigation</h4>
                        <ul className="text-xs space-y-3 text-gray-400">
                            <li><Link to="/about" className="hover:text-white transition-colors cursor-pointer">Our Beliefs</Link></li>
                            <li><Link to="/sermons" className="hover:text-white transition-colors cursor-pointer">Digital Sermons</Link></li>
                            <li><Link to="/ministries" className="hover:text-white transition-colors cursor-pointer">Leadership Team</Link></li>
                        </ul>
                    </div>

                    {/* Visit Us */}
                    <div className="md:col-span-3 space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-church-gold/60">Visit Us</h4>
                        <div className="space-y-4 text-xs text-gray-400">
                            <div className="flex items-start gap-3">
                                <i className="fa-solid fa-location-dot text-church-gold"></i>
                                <span>4 School St<br />Acton, MA 01720</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <i className="fa-solid fa-phone text-church-gold"></i>
                                <span>+1 (508) 454-3599</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <i className="fa-solid fa-envelope text-church-gold"></i>
                                <span>anointedworshipcenter@gmail.com</span>
                            </div>
                        </div>
                    </div>

                    {/* Mailing List */}
                    <div className="md:col-span-3 space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-church-gold/60">Mailing List</h4>
                        <p className="text-gray-400 text-[10px]">Encouragement delivered weekly to your inbox.</p>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-church-gold/50"
                            />
                            <button className="absolute right-2 top-2 bottom-2 bg-church-gold text-white px-3 rounded flex items-center justify-center">
                                <i className="fa-solid fa-arrow-right text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em]">
                    <p>© {new Date().getFullYear()} Anointed Worship Center. For His Glory.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <span>Privacy</span>
                        <span>Terms</span>
                        <span>Sitemap</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
