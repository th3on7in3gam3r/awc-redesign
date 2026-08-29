import * as React from 'react';

const Terms: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden">
                <div className="bg-church-burgundy py-16 px-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                    <h1 className="text-4xl md:text-5xl font-serif text-white relative z-10">Terms of Service</h1>
                    <p className="text-white/60 mt-4 font-bold uppercase tracking-widest text-xs relative z-10">Last Updated: February 17, 2026</p>
                </div>

                <div className="p-8 md:p-16 prose prose-slate max-w-none">
                    <h2 className="text-2xl font-serif text-church-burgundy mt-8 mb-6">1. Agreement to Terms</h2>
                    <p>
                        By accessing our website, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
                    </p>

                    <h2 className="text-2xl font-serif text-church-burgundy mt-12 mb-6">2. Use License</h2>
                    <p>
                        Permission is granted to temporarily download one copy of the materials (information or software) on Anointed Worship Center's website for personal, non-commercial transitory viewing only.
                    </p>

                    <h2 className="text-2xl font-serif text-church-burgundy mt-12 mb-6">3. Disclaimer</h2>
                    <p>
                        The materials on Anointed Worship Center's website are provided on an 'as is' basis. Anointed Worship Center makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                    </p>

                    <h2 className="text-2xl font-serif text-church-burgundy mt-12 mb-6">4. Limitations</h2>
                    <p>
                        In no event shall Anointed Worship Center or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Anointed Worship Center's website.
                    </p>

                    <h2 className="text-2xl font-serif text-church-burgundy mt-12 mb-6">5. Revisions</h2>
                    <p>
                        The materials appearing on Anointed Worship Center's website could include technical, typographical, or photographic errors. Anointed Worship Center does not warrant that any of the materials on its website are accurate, complete or current.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Terms;
