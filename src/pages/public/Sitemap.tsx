import * as React from 'react';
import { Link } from 'react-router-dom';

const Sitemap: React.FC = () => {
    const sitemapLinks = [
        {
            title: "General",
            links: [
                { name: "Home", path: "/" },
                { name: "About Us", path: "/about" },
                { name: "Daily Devotional", path: "/daily-devotional" },
                { name: "Plan A Visit", path: "/visit" },
            ]
        },
        {
            title: "Media & Resources",
            links: [
                { name: "Ministries", path: "/ministries" },
                { name: "Sermon Archive", path: "/sermons" },
                { name: "Gallery", path: "/gallery" },
            ]
        },
        {
            title: "Community",
            links: [
                { name: "Events", path: "/events" },
                { name: "Community Center", path: "/community" },
            ]
        },
        {
            title: "Legal",
            links: [
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms of Service", path: "/terms" },
                { name: "Sitemap", path: "/sitemap" },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif text-church-burgundy mb-4">Sitemap</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">A comprehensive map of our digital home</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {sitemapLinks.map((section, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-3xl shadow-lg border-t-4 border-church-gold hover:translate-y-[-4px] transition-transform">
                            <h3 className="text-xl font-serif text-church-burgundy mb-6 pb-2 border-b border-slate-100">{section.title}</h3>
                            <ul className="space-y-4">
                                {section.links.map((link, lIdx) => (
                                    <li key={lIdx}>
                                        <Link to={link.path} className="text-slate-600 hover:text-church-gold transition-colors flex items-center gap-2 group">
                                            <i className="fa-solid fa-chevron-right text-[10px] text-church-gold opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0"></i>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-slate-400 text-sm">Can't find what you're looking for? <Link to="/visit" className="text-church-burgundy font-bold underline">Contact us directly</Link>.</p>
                </div>
            </div>
        </div>
    );
};

export default Sitemap;
