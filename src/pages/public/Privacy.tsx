import * as React from 'react';

const Privacy: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden">
                <div className="bg-church-burgundy py-16 px-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                    <h1 className="text-4xl md:text-5xl font-serif text-white relative z-10">Privacy Policy</h1>
                    <p className="text-white/60 mt-4 font-bold uppercase tracking-widest text-xs relative z-10">Last Updated: February 17, 2026</p>
                </div>

                <div className="p-8 md:p-16 prose prose-slate max-w-none">
                    <p className="lead text-lg text-slate-600 mb-8">
                        At Anointed Worship Center, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                    </p>

                    <h2 className="text-2xl font-serif text-church-burgundy mt-12 mb-6">1. Information We Collect</h2>
                    <p>
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                    </p>
                    <ul>
                        <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                        <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
                        <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
                    </ul>

                    <h2 className="text-2xl font-serif text-church-burgundy mt-12 mb-6">2. How We Use Your Information</h2>
                    <p>
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    </p>
                    <ul>
                        <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                        <li>Where it is necessary for our legitimate interests (or those of a third party).</li>
                        <li>Where we need to comply with a legal or regulatory obligation.</li>
                    </ul>

                    <h2 className="text-2xl font-serif text-church-burgundy mt-12 mb-6">3. Data Security</h2>
                    <p>
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                    </p>

                    <h2 className="text-2xl font-serif text-church-burgundy mt-12 mb-6">4. Contact Us</h2>
                    <p>
                        If you have any questions about this privacy policy or our privacy practices, please contact us at:
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

export default Privacy;
