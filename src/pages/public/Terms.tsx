import * as React from 'react';

const Terms: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden">
                <div className="bg-church-burgundy py-16 px-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                    <h1 className="text-4xl md:text-5xl font-serif text-white relative z-10">Terms of Service</h1>
                    <p className="text-white/60 mt-4 font-bold uppercase tracking-widest text-xs relative z-10">Last Updated: October 21, 2026</p>
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

                    <h2 className="text-2xl font-serif text-church-burgundy mt-12 mb-6">5. AWC Vault Text Messages (SMS)</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Program:</strong> Anointed Worship Center / AWC Vault sign-in codes. Messages contain a one-time code used to sign in to AWC Vault. No marketing or promotional messages are sent.</li>
                        <li><strong>How you opt in:</strong> by entering your mobile number on the AWC Vault sign-in page and checking the text-message consent box. Consent is optional and is not a condition of membership, attendance or any purchase.</li>
                        <li><strong>Message frequency:</strong> varies; one message each time you request a sign-in code.</li>
                        <li><strong>Cost:</strong> Message and data rates may apply.</li>
                        <li><strong>Opt out:</strong> reply STOP to any message. You will receive one confirmation and no further messages unless you opt in again.</li>
                        <li><strong>Help:</strong> reply HELP, or email anointedworshipcenter@gmail.com.</li>
                        <li>Carriers are not liable for delayed or undelivered messages.</li>
                        <li>See our <a href="/privacy" className="text-church-burgundy underline underline-offset-2">Privacy Policy</a> for how your mobile number is handled.</li>
                    </ul>

                    <h2 className="text-2xl font-serif text-church-burgundy mt-12 mb-6">6. Revisions</h2>
                    <p>
                        The materials appearing on Anointed Worship Center's website could include technical, typographical, or photographic errors. Anointed Worship Center does not warrant that any of the materials on its website are accurate, complete or current.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Terms;
