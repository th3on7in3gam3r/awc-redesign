import * as React from 'react';

const DailyDevotional: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-church-burgundy/90"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-black/30 to-transparent"></div>

                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                    <span className="text-church-gold font-bold uppercase tracking-[0.4em] text-xs md:text-sm block mb-6 animate-fade-in">Daily Inspiration</span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-8 leading-tight">Walking in Divine Purpose</h1>
                    <p className="text-white/80 text-lg md:text-xl font-light max-w-2xl mx-auto">February 17, 2026</p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto bg-white rounded-[3rem] shadow-xl p-8 md:p-16 -mt-32 relative z-20">
                    {/* Scripture Card */}
                    <div className="bg-church-gold/5 rounded-3xl p-8 md:p-12 mb-12 border border-church-gold/10 text-center relative">
                        <i className="fa-solid fa-quote-left text-4xl text-church-gold/20 absolute top-8 left-8"></i>
                        <h2 className="text-2xl md:text-3xl font-serif italic text-church-burgundy leading-relaxed mb-6 relative z-10">
                            "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."
                        </h2>
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-px w-8 bg-church-gold/30"></div>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Jeremiah 29:11</p>
                            <div className="h-px w-8 bg-church-gold/30"></div>
                        </div>
                    </div>

                    {/* Devotional Text */}
                    <div className="prose prose-lg prose-slate mx-auto mb-12">
                        <p className="first-letter:text-5xl first-letter:font-serif first-letter:text-church-gold first-letter:mr-3 first-letter:float-left">
                            Life often takes us on unexpected detours. We plan for one destination but arrive at another. In moments of uncertainty, it's easy to feel lost or forgotten. But today's scripture reminds us of a powerful truth: God is never surprised by our circumstances.
                        </p>
                        <p>
                            Before you were even born, God had a blueprint for your life. His plans aren't just for your survival; they are for your thriving. When the world offers confusion, God offers hope. When your future seems unclear, God promises a future filled with purpose.
                        </p>
                        <p>
                            Trusting in His plan doesn't mean we'll always understand the 'why' or the 'how' right now. It means resting in the 'Who'. We serve a God who weaves every thread of our lives—the joys, the sorrows, the triumphs, and the trials—into a beautiful tapestry of grace.
                        </p>
                    </div>

                    {/* Prayer Section */}
                    <div className="bg-slate-50 rounded-3xl p-8 md:p-10 border-l-4 border-church-burgundy">
                        <h3 className="text-church-burgundy font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-hands-praying"></i> Today's Prayer
                        </h3>
                        <p className="text-slate-600 italic leading-relaxed text-lg">
                            "Lord, thank You that my life is held in Your hands. When I cannot trace Your hand, help me to trust Your heart. Open my eyes to see the hope You have set before me, and give me the courage to walk confidently in the plans You have for my life. In Jesus' name, Amen."
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-16 pt-16 border-t border-slate-100">
                        <button className="bg-church-burgundy hover:bg-church-gold text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3">
                            <i className="fa-solid fa-share-nodes"></i> Share Devotional
                        </button>
                        <button
                            onClick={() => {
                                const btn = document.getElementById('save-btn');
                                if (btn) {
                                    const isSaved = btn.getAttribute('data-saved') === 'true';
                                    if (isSaved) {
                                        btn.innerHTML = '<i class="fa-solid fa-bookmark"></i> Save for Later';
                                        btn.setAttribute('data-saved', 'false');
                                        btn.classList.remove('bg-church-gold', 'text-white', 'border-transparent');
                                        btn.classList.add('bg-white', 'text-slate-600', 'border-slate-200');
                                    } else {
                                        btn.innerHTML = '<i class="fa-solid fa-check"></i> Saved';
                                        btn.setAttribute('data-saved', 'true');
                                        btn.classList.remove('bg-white', 'text-slate-600', 'border-slate-200');
                                        btn.classList.add('bg-church-gold', 'text-white', 'border-transparent');
                                    }
                                }
                            }}
                            id="save-btn"
                            data-saved="false" // Initialize attribute
                            className="bg-white border border-slate-200 hover:border-church-gold text-slate-600 hover:text-church-gold px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3"
                        >
                            <i className="fa-solid fa-bookmark"></i> Save for Later
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DailyDevotional;
