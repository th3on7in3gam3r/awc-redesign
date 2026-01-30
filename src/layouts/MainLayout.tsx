import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FaithAssistant from '../../components/FaithAssistant';
import CookieBanner from '../../components/CookieBanner';

const MainLayout: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col font-sans selection:bg-church-gold selection:text-white scroll-smooth relative">
            <Header />

            <main className="flex-grow overflow-x-hidden">
                <Outlet />
            </main>

            <Footer />
            <FaithAssistant />
            <CookieBanner />
        </div>
    );
};

export default MainLayout;
