import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HandHeart, DollarSign, Calendar, Info, HelpCircle, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { ManageGivingModal } from '../../components/giving/ManageGivingModal';

interface GivingOption {
    id: string;
    title: string;
    category: string;
    url: string | null;
    handle: string | null;
    subtitle: string | null;
    provider: string;
    is_primary: boolean;
    is_active: boolean;
    sort_order: number;
}

interface GivingContent {
    why_we_give?: string;
    giving_help?: string;
}

const FAQ_ITEMS = [
    {
        question: 'How do I give online?',
        answer: 'Click on any of the giving options above to be redirected to our secure giving portal. You can give one-time or set up recurring gifts.'
    },
    {
        question: 'Is my giving tax-deductible?',
        answer: 'Yes! All gifts to Anointed Worship Center are tax-deductible. You will receive a giving statement at the end of the year for tax purposes.'
    },
    {
        question: 'Can I give by check or cash?',
        answer: 'Absolutely! You can place your offering in the collection during service or drop it off at the church office during business hours.'
    },
    {
        question: 'What is the Building Fund?',
        answer: 'The Building Fund supports our facility improvements, maintenance, and future expansion projects to better serve our growing congregation.'
    }
];

export const GivingPage: React.FC = () => {
    const { user } = useAuth();
    const isStaff = user?.role === 'admin' || user?.role === 'pastor';

    const [givingOptions, setGivingOptions] = useState<GivingOption[]>([]);
    const [content, setContent] = useState<GivingContent>({});
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState('');
    const [frequency, setFrequency] = useState<'one-time' | 'weekly' | 'monthly'>('one-time');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [showManageModal, setShowManageModal] = useState(false);

    useEffect(() => {
        fetchGivingData();
    }, []);

    const fetchGivingData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [optionsRes, contentRes] = await Promise.all([
                fetch('/api/giving/options', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/giving/content', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const optionsData = await optionsRes.json();
            const contentData = await contentRes.json();

            setGivingOptions(optionsData);
            setContent(contentData);
        } catch (err) {
            console.error('Error fetching giving data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGivingClick = async (option: GivingOption) => {
        // Handle Cash App - copy handle if no URL
        if (option.provider === 'cashapp' && !option.url && option.handle) {
            try {
                await navigator.clipboard.writeText(option.handle);

                const toast = document.createElement('div');
                toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in';
                toast.textContent = `Copied ${option.handle} to clipboard!`;
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);

                return;
            } catch (err) {
                console.error('Error copying to clipboard:', err);
                alert(`Cash App: ${option.handle}`);
                return;
            }
        }

        // Handle regular URL-based giving
        if (!option.url) return;

        try {
            const token = localStorage.getItem('token');
            await fetch('/api/giving/intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    giving_option_id: option.id,
                    amount: amount ? parseFloat(amount) : null,
                    frequency
                })
            });

            // Show toast
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in';
            toast.textContent = 'Opening giving link...';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);

            // Open link
            window.open(option.url, '_blank');
        } catch (err) {
            console.error('Error logging intent:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-16 h-16 border-4 border-church-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Tithes & Offerings</h1>
                    <p className="text-slate-600">Give generously as an act of worship</p>
                </div>
                {isStaff && (
                    <button
                        onClick={() => setShowManageModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        Manage Giving
                    </button>
                )}
            </div>

            {/* Manage Giving Modal */}
            <ManageGivingModal
                isOpen={showManageModal}
                onClose={() => setShowManageModal(false)}
                onUpdate={fetchGivingData}
            />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Giving Options */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Amount & Frequency */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200">
                        <h3 className="font-bold text-slate-900 mb-4">Optional: Set Amount & Frequency</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Amount (Optional)
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-church-gold focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Frequency
                                </label>
                                <div className="flex gap-2">
                                    {(['one-time', 'weekly', 'monthly'] as const).map((freq) => (
                                        <button
                                            key={freq}
                                            onClick={() => setFrequency(freq)}
                                            className={`flex-1 py-3 rounded-xl font-medium transition-all ${frequency === freq
                                                ? 'bg-church-gold text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {freq === 'one-time' ? 'One-time' : freq.charAt(0).toUpperCase() + freq.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Giving Tiles */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-900">Choose Giving Method</h3>
                        {givingOptions.map((option) => {
                            // Determine if option is disabled
                            const isDisabled = option.provider === 'cashapp'
                                ? (!option.url && !option.handle) || !option.is_active
                                : !option.url || !option.is_active;

                            // Determine button text
                            let buttonText = 'Give Now';
                            if (option.provider === 'vanco') buttonText = 'Give via Vanco';
                            else if (option.provider === 'cashapp') {
                                buttonText = option.url ? 'Open Cash App' : 'Copy Cash App Handle';
                            }
                            else if (option.provider === 'stripe') buttonText = 'Coming Soon';

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => !isDisabled && handleGivingClick(option)}
                                    disabled={isDisabled}
                                    className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${isDisabled
                                        ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                                        : 'border-slate-200 hover:border-church-gold hover:shadow-lg'
                                        } ${option.is_primary ? 'border-church-gold bg-church-gold/5' : ''}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${option.is_primary ? 'bg-church-gold text-white' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                <HandHeart className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-slate-900">{option.title}</h4>
                                                    {option.is_primary && (
                                                        <span className="px-2 py-0.5 bg-church-gold text-white text-xs font-bold rounded-full">
                                                            PRIMARY
                                                        </span>
                                                    )}
                                                </div>
                                                {option.subtitle && (
                                                    <p className="text-sm text-slate-600 mb-2">{option.subtitle}</p>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${option.provider === 'vanco' ? 'bg-blue-100 text-blue-700' :
                                                            option.provider === 'cashapp' ? 'bg-green-100 text-green-700' :
                                                                option.provider === 'stripe' ? 'bg-purple-100 text-purple-700' :
                                                                    'bg-slate-100 text-slate-700'
                                                        }`}>
                                                        {option.provider.charAt(0).toUpperCase() + option.provider.slice(1)}
                                                    </span>
                                                    {option.provider === 'cashapp' && option.handle && (
                                                        <span className="text-xs text-slate-500">{option.handle}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {!isDisabled && (
                                                <span className="px-4 py-2 bg-church-gold text-white text-sm font-semibold rounded-lg">
                                                    {buttonText}
                                                </span>
                                            )}
                                            {isDisabled && (
                                                <span className="px-4 py-2 bg-slate-200 text-slate-500 text-sm font-semibold rounded-lg">
                                                    Coming Soon
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Info Panel */}
                <div className="space-y-6">
                    {/* Why We Give */}
                    <div className="bg-gradient-to-br from-church-burgundy to-purple-900 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="w-5 h-5" />
                            <h3 className="font-bold">Why We Give</h3>
                        </div>
                        <p className="text-sm text-white/90 leading-relaxed">
                            {content.why_we_give || 'Loading...'}
                        </p>
                    </div>

                    {/* FAQ */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200">
                        <h3 className="font-bold text-slate-900 mb-4">Frequently Asked Questions</h3>
                        <div className="space-y-2">
                            {FAQ_ITEMS.map((item, index) => (
                                <div key={index} className="border-b border-slate-100 last:border-0">
                                    <button
                                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                        className="w-full py-3 flex items-center justify-between text-left hover:text-church-gold transition-colors"
                                    >
                                        <span className="font-medium text-sm">{item.question}</span>
                                        {expandedFaq === index ? (
                                            <ChevronUp className="w-4 h-4 text-slate-400" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                        )}
                                    </button>
                                    {expandedFaq === index && (
                                        <p className="pb-3 text-sm text-slate-600 leading-relaxed">
                                            {item.answer}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Help */}
                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                        <div className="flex items-start gap-3">
                            <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-blue-900 mb-1">Need Help?</h4>
                                <p className="text-sm text-blue-800">
                                    {content.giving_help || 'Loading...'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
