
import React from 'react';
import { Button } from '../../components/ui/Button';

const Visit: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative h-[60vh] min-h-[500px] mb-20">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=2000"
                        className="w-full h-full object-cover"
                        alt="Welcome to Church"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-church-burgundy/40 to-church-burgundy/60"></div>
                </div>
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                    <span className="text-church-gold font-black tracking-[0.4em] uppercase text-xs mb-6 animate-fade-in">Experience AWC</span>
                    <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 serif tracking-tight shadow-sm">Plan Your Visit</h1>
                    <p className="text-xl md:text-2xl text-gray-200 fnont-light max-w-2xl leading-relaxed mb-10 shimmer">
                        We can't wait to meet you! Let us know you're coming, and we'll have a VIP gift ready for you.
                    </p>
                    <Button className="bg-church-gold hover:bg-white text-white hover:text-church-burgundy px-10 py-5 text-sm font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
                        Let Us Know You're Coming
                    </Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pb-20">
                {/* Service Times & Location */}
                <div className="grid md:grid-cols-2 gap-12 mb-32">
                    <div className="bg-white rounded-[3rem] p-12 shadow-xl border border-gray-100 flex flex-col justify-center">
                        <h2 className="text-4xl font-bold text-church-burgundy serif mb-8">Service Times</h2>
                        <div className="space-y-8">
                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 bg-church-gold/10 rounded-2xl flex items-center justify-center text-church-gold text-2xl group-hover:bg-church-gold group-hover:text-white transition-colors duration-500">
                                    <i className="fa-solid fa-sun"></i>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-church-burgundy mb-1">Sunday Celebration</h3>
                                    <p className="text-slate-500 font-medium">10:00 AM </p>
                                    <p className="text-sm text-slate-400 mt-2">In-Person & Online</p>
                                </div>
                            </div>
                            <div className="w-full h-[1px] bg-gray-100"></div>
                            <div className="flex items-start gap-6 group">
                                <div className="w-14 h-14 bg-church-burgundy/5 rounded-2xl flex items-center justify-center text-church-burgundy text-2xl group-hover:bg-church-burgundy group-hover:text-white transition-colors duration-500">
                                    <i className="fa-solid fa-moon"></i>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-church-burgundy mb-1">Wednesday Bible Study</h3>
                                    <p className="text-slate-500 font-medium">7:00 PM</p>
                                    <p className="text-sm text-slate-400 mt-2">Online via Zoom & Facebook Live</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-church-burgundy rounded-[3rem] overflow-hidden shadow-2xl relative min-h-[400px]">
                        {/* Placeholder Map Image/Embed */}
                        <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover grayscale" alt="Map Background" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-church-burgundy to-transparent"></div>

                        <div className="absolute bottom-0 left-0 p-12 w-full z-10">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-church-burgundy text-2xl mb-6 shadow-xl animate-bounce">
                                <i className="fa-solid fa-location-dot"></i>
                            </div>
                            <h2 className="text-4xl font-bold text-white serif mb-4">Our Location</h2>
                            <p className="text-white/80 text-lg mb-8 max-w-sm">
                                4 School St<br />Acton, MA 01720
                            </p>
                            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-church-burgundy w-full sm:w-auto">
                                Get Directions <i className="fa-solid fa-arrow-right ml-2"></i>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* What to Expect */}
                <div className="mb-32">
                    <div className="text-center mb-16">
                        <span className="text-church-gold font-bold tracking-[0.3em] uppercase text-xs">First Time?</span>
                        <h2 className="text-5xl font-bold text-church-burgundy mt-4 serif">What to Expect</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: "fa-shirt",
                                title: "Come As You Are",
                                description: "Whether you prefer a suit and tie or jeans and a tee, you'll fit right in. We care about your heart, not your clothes."
                            },
                            {
                                icon: "fa-music",
                                title: "Authentic Worship",
                                description: "Our services feature passionate, contemporary worship that invites you to encounter God's presence freely."
                            },
                            {
                                icon: "fa-mug-hot",
                                title: "Warm Fellowship",
                                description: "Expect a warm welcome! Join us before service for coffee and connection in the foyer."
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-10 rounded-[2.5rem] text-center border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-church-gold text-3xl">
                                    <i className={`fa-solid ${item.icon}`}></i>
                                </div>
                                <h3 className="text-xl font-bold text-church-burgundy mb-4 serif">{item.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Kids & Youth */}
                <div className="rounded-[4rem] overflow-hidden shadow-2xl relative bg-church-burgundy text-white">
                    <div className="grid lg:grid-cols-2">
                        <div className="p-16 md:p-24 flex flex-col justify-center relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold mb-8 serif">Next Gen</h2>
                            <p className="text-white/80 text-lg mb-12 leading-relaxed">
                                We believe in raising up the next generation of Kingdom leaders. Our safe, fun, and engaging environments are designed just for them.
                            </p>
                            <div className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-church-gold text-xl">
                                        <i className="fa-solid fa-child-reaching"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl">Kingdom Kids</h4>
                                        <p className="text-white/60 text-sm">Ages 6 months - 5th Grade</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-church-gold text-xl">
                                        <i className="fa-solid fa-fire"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl">AWC Youth</h4>
                                        <p className="text-white/60 text-sm">Middle & High School</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative min-h-[400px] lg:h-full">
                            <img
                                src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1000"
                                className="absolute inset-0 w-full h-full object-cover"
                                alt="Kids Ministry"
                            />
                            <div className="absolute inset-0 bg-church-burgundy/20"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Visit;
