import React from 'react';

interface IntroPageProps {
    onEnter: () => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ onEnter }) => {
    const logoUrl = "https://anointedworshipcenter.com/logo.png";

    return (
        <div className="fixed inset-0 z-[100] bg-church-burgundy flex items-center justify-center overflow-hidden">
            {/* Immersive Background */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1545628237-f142c1efc913?auto=format&fit=crop&q=80&w=2000"
                    className="w-full h-full object-cover filter brightness-[0.25] blur-[2px] scale-110 animate-slow-zoom"
                    alt="Church Sanctuary Atmosphere"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-church-burgundy via-church-burgundy/60 to-transparent"></div>
            </div>

            <div className="relative z-10 text-center px-6 animate-slide-up">
                {/* Updated Circular Logo */}
                <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_60px_rgba(212,175,55,0.4)] animate-pulse-gentle overflow-hidden border-4 border-church-gold/30 p-2">
                    <img
                        src={logoUrl}
                        className="w-full h-full object-contain rounded-full"
                        alt="Anointed Worship Center Logo"
                    />
                </div>

                <div className="mb-12">
                    <span className="text-church-gold font-black tracking-[0.6em] uppercase text-[10px] md:text-xs mb-6 block">Anointed Worship Center</span>
                    <h1 className="text-white text-6xl md:text-8xl font-black mb-6 serif tracking-tight">
                        The Sanctuary
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl font-light italic serif tracking-widest">
                        "Where Everybody Is Somebody"
                    </p>
                </div>

                <button
                    onClick={onEnter}
                    className="group relative px-16 py-6 overflow-hidden bg-transparent border border-church-gold/40 rounded-full transition-all duration-700 hover:border-church-gold"
                >
                    <div className="absolute inset-0 bg-church-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    <span className="relative z-10 text-church-gold group-hover:text-white font-black uppercase tracking-[0.3em] text-[11px] transition-colors duration-500">
                        Enter The Sanctuary
                    </span>
                </button>
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/20 text-[9px] font-black uppercase tracking-[0.4em]">
                Grace City • Established in Faith
            </div>
        </div>
    );
};

export default IntroPage;
