import React from 'react';

interface LoadingPageProps {
    loadingText: string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ loadingText }) => {
    const logoUrl = "https://anointedworshipcenter.com/logo.png";

    return (
        <div className="fixed inset-0 z-[110] bg-white flex flex-col items-center justify-center">
            <div className="relative">
                <div className="w-24 h-24 border-2 border-church-gold/10 rounded-full animate-ping absolute inset-0"></div>
                <div className="w-24 h-24 bg-white shadow-2xl rounded-full flex items-center justify-center relative z-10 overflow-hidden p-2">
                    <img
                        src={logoUrl}
                        className="w-full h-full object-contain rounded-full animate-bounce"
                        alt="AWC Logo Loading"
                    />
                </div>
            </div>
            <div className="mt-12 text-center h-8">
                <p className="text-church-burgundy font-black uppercase tracking-[0.3em] text-[11px] animate-fade-in key={loadingText}">
                    {loadingText}
                </p>
            </div>
            <div className="w-32 h-[2px] bg-gray-100 mt-6 rounded-full overflow-hidden">
                <div className="h-full bg-church-gold animate-loading-bar"></div>
            </div>
        </div>
    );
};

export default LoadingPage;
