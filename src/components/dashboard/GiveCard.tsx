import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HandHeart, ExternalLink, Copy } from 'lucide-react';

interface GivingOption {
    id: string;
    title: string;
    url: string | null;
    handle: string | null;
    provider: string;
    is_primary: boolean;
}

export const GiveCard: React.FC = () => {
    const [primaryOption, setPrimaryOption] = useState<GivingOption | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPrimaryOption();
    }, []);

    const fetchPrimaryOption = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/giving/options', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const options = await res.json();
            const primary = options.find((opt: GivingOption) => opt.is_primary);
            setPrimaryOption(primary || options[0]);
        } catch (err) {
            console.error('Error fetching giving options:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGiveNow = async () => {
        if (!primaryOption) return;

        // Handle Cash App - copy handle if no URL
        if (primaryOption.provider === 'cashapp' && !primaryOption.url && primaryOption.handle) {
            try {
                await navigator.clipboard.writeText(primaryOption.handle);

                const toast = document.createElement('div');
                toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in';
                toast.textContent = `Copied ${primaryOption.handle} to clipboard!`;
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);

                return;
            } catch (err) {
                console.error('Error copying to clipboard:', err);
                alert(`Cash App: ${primaryOption.handle}`);
                return;
            }
        }

        // Handle regular URL-based giving
        if (!primaryOption.url) return;

        try {
            const token = localStorage.getItem('token');
            await fetch('/api/giving/intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    giving_option_id: primaryOption.id,
                    frequency: 'one-time'
                })
            });

            window.open(primaryOption.url, '_blank');
        } catch (err) {
            console.error('Error logging intent:', err);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            </div>
        );
    }

    // Determine button text and icon based on provider
    const getButtonContent = () => {
        if (!primaryOption) return { text: 'Give Now', icon: <ExternalLink className="w-4 h-4" /> };

        if (primaryOption.provider === 'cashapp') {
            if (primaryOption.url) {
                return { text: 'Open Cash App', icon: <ExternalLink className="w-4 h-4" /> };
            } else if (primaryOption.handle) {
                return { text: 'Copy Cash App', icon: <Copy className="w-4 h-4" /> };
            }
        }

        if (primaryOption.provider === 'vanco') {
            return { text: 'Give via Vanco', icon: <ExternalLink className="w-4 h-4" /> };
        }

        return { text: 'Give Now', icon: <ExternalLink className="w-4 h-4" /> };
    };

    const buttonContent = getButtonContent();
    const isDisabled = primaryOption?.provider === 'cashapp'
        ? (!primaryOption.url && !primaryOption.handle)
        : !primaryOption?.url;

    return (
        <div className="bg-gradient-to-br from-church-burgundy to-purple-900 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <HandHeart className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Give</h3>
                    <p className="text-white/80 text-sm mb-4">
                        {primaryOption?.title || 'Support our ministry'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={handleGiveNow}
                            disabled={isDisabled}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-church-gold text-church-burgundy rounded-xl font-bold hover:bg-church-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {buttonContent.text}
                            {buttonContent.icon}
                        </button>
                        <Link
                            to="/dashboard/giving"
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors border border-white/20"
                        >
                            View giving options
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
