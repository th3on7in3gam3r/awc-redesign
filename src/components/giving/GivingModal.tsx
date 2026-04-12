import React, { useState, useEffect } from 'react';
import { X, HandHeart, DollarSign, Info, ChevronDown, ChevronUp, HelpCircle, User } from 'lucide-react';

interface GivingOption {
    id: string;
    title: string;
    category: string;
    url: string | null;
    handle: string | null;
    subtitle: string | null;
    provider: string;
    is_primary: boolean;
    sort_order: number;
}

interface GivingContent {
    why_we_give?: string;
    giving_help?: string;
}

interface GivingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FAQ_ITEMS = [
    {
        question: 'Is my giving tax-deductible?',
        answer: 'Yes! All gifts to Anointed Worship Center are tax-deductible. You will receive a giving statement at the end of the year.'
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

export const GivingModal: React.FC<GivingModalProps> = ({ isOpen, onClose }) => {
    const [givingOptions, setGivingOptions] = useState<GivingOption[]>([]);
    const [content, setContent] = useState<GivingContent>({});
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState('');
    const [giverName, setGiverName] = useState('');
    const [frequency, setFrequency] = useState<'one-time' | 'weekly' | 'monthly'>('one-time');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'give' | 'why' | 'faq'>('give');

    useEffect(() => {
        if (isOpen) {
            fetchGivingData();
        }
    }, [isOpen]);

    const fetchGivingData = async () => {
        setLoading(true);
        try {
            const [optionsRes, contentRes] = await Promise.all([
                fetch('/api/giving/public/options'),
                fetch('/api/giving/public/content')
            ]);
            const optionsData = await optionsRes.json();
            const contentData = await contentRes.json();
            setGivingOptions(Array.isArray(optionsData) ? optionsData : []);
            setContent(contentData);
        } catch (err) {
            console.error('Error fetching giving data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGivingClick = async (option: GivingOption) => {
        // Cash App — copy handle
        if (option.provider === 'cashapp' && !option.url && option.handle) {
            try {
                await navigator.clipboard.writeText(option.handle);
                showToast(`Copied ${option.handle} to clipboard!`, 'green');
            } catch {
                alert(`Cash App: ${option.handle}`);
            }
            logIntent(option.id);
            return;
        }

        if (!option.url) return;

        logIntent(option.id);
        showToast('Opening giving link...', 'green');
        window.open(option.url, '_blank');
    };

    const logIntent = async (givingOptionId: string) => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = token ? '/api/giving/intent' : '/api/giving/public/intent';
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    giving_option_id: givingOptionId,
                    amount: amount ? parseFloat(amount) : null,
                    frequency,
                    giver_name: giverName.trim() || null
                })
            });
        } catch (err) {
            console.error('Error logging giving intent:', err);
        }
    };

    const showToast = (message: string, color: 'green' | 'blue') => {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 bg-${color}-500 text-white px-6 py-3 rounded-xl shadow-lg z-[9999] animate-fade-in`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-church-burgundy to-[#7A1414] px-6 py-5 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-church-gold/20 rounded-xl flex items-center justify-center">
                            <HandHeart className="w-5 h-5 text-church-gold" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg">Tithes & Offerings</h2>
                            <p className="text-white/60 text-xs">Give generously as an act of worship</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 flex-shrink-0">
                    {(['give', 'why', 'faq'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                                activeTab === tab
                                    ? 'text-church-burgundy border-b-2 border-church-gold'
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {tab === 'give' ? 'Give Now' : tab === 'why' ? 'Why We Give' : 'FAQ'}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <div className="w-10 h-10 border-4 border-church-gold border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            {/* Give Tab */}
                            {activeTab === 'give' && (
                                <div className="space-y-5">
                                    {/* Name + Amount & Frequency */}
                                    <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Info & Amount</p>

                                        {/* Name */}
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={giverName}
                                                onChange={(e) => setGiverName(e.target.value)}
                                                placeholder="Your name (so we know who gave)"
                                                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-church-gold focus:border-transparent bg-white"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-church-gold focus:border-transparent bg-white"
                                                />
                                            </div>
                                            <div className="flex gap-1.5">
                                                {(['one-time', 'weekly', 'monthly'] as const).map((freq) => (
                                                    <button
                                                        key={freq}
                                                        onClick={() => setFrequency(freq)}
                                                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                                            frequency === freq
                                                                ? 'bg-church-gold text-white'
                                                                : 'bg-white border border-slate-200 text-slate-500 hover:border-church-gold'
                                                        }`}
                                                    >
                                                        {freq === 'one-time' ? '1x' : freq.charAt(0).toUpperCase() + freq.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Giving Options */}
                                    <div className="space-y-3">
                                        {givingOptions.length === 0 && (
                                            <p className="text-center text-slate-400 text-sm py-8">No giving options available at this time.</p>
                                        )}
                                        {givingOptions.map((option) => {
                                            const isDisabled = option.provider === 'cashapp'
                                                ? (!option.url && !option.handle)
                                                : !option.url;

                                            const buttonText = option.provider === 'vanco'
                                                ? 'Give via Vanco'
                                                : option.provider === 'cashapp'
                                                    ? (option.url ? 'Open Cash App' : 'Copy Handle')
                                                    : option.provider === 'stripe'
                                                        ? 'Coming Soon'
                                                        : 'Give Now';

                                            return (
                                                <button
                                                    key={option.id}
                                                    onClick={() => !isDisabled && handleGivingClick(option)}
                                                    disabled={isDisabled}
                                                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                                                        isDisabled
                                                            ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                                                            : option.is_primary
                                                                ? 'border-church-gold bg-church-gold/5 hover:shadow-lg hover:shadow-church-gold/20'
                                                                : 'border-slate-200 hover:border-church-gold hover:shadow-md'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                                option.is_primary ? 'bg-church-gold text-white' : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                                <HandHeart className="w-5 h-5" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="font-bold text-slate-900 text-sm">{option.title}</span>
                                                                    {option.is_primary && (
                                                                        <span className="px-2 py-0.5 bg-church-gold text-white text-[10px] font-bold rounded-full">PRIMARY</span>
                                                                    )}
                                                                </div>
                                                                {option.subtitle && (
                                                                    <p className="text-xs text-slate-500 truncate">{option.subtitle}</p>
                                                                )}
                                                                <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                                                                    option.provider === 'vanco' ? 'bg-blue-100 text-blue-700' :
                                                                    option.provider === 'cashapp' ? 'bg-green-100 text-green-700' :
                                                                    option.provider === 'stripe' ? 'bg-purple-100 text-purple-700' :
                                                                    'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                    {option.provider.charAt(0).toUpperCase() + option.provider.slice(1)}
                                                                    {option.provider === 'cashapp' && option.handle && ` · ${option.handle}`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className={`px-3 py-1.5 text-xs font-bold rounded-lg flex-shrink-0 ${
                                                            isDisabled
                                                                ? 'bg-slate-200 text-slate-400'
                                                                : 'bg-church-gold text-white'
                                                        }`}>
                                                            {isDisabled ? 'Coming Soon' : buttonText}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Why We Give Tab */}
                            {activeTab === 'why' && (
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-church-burgundy to-purple-900 rounded-2xl p-6 text-white">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Info className="w-5 h-5 text-church-gold" />
                                            <h3 className="font-bold">Why We Give</h3>
                                        </div>
                                        <p className="text-sm text-white/90 leading-relaxed">
                                            {content.why_we_give || 'Giving is an act of worship and obedience to God. Your generosity helps us spread the Gospel and support our community.'}
                                        </p>
                                    </div>
                                    {content.giving_help && (
                                        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                                            <div className="flex items-start gap-3">
                                                <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="font-bold text-blue-900 mb-1 text-sm">Need Help?</h4>
                                                    <p className="text-sm text-blue-800">{content.giving_help}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* FAQ Tab */}
                            {activeTab === 'faq' && (
                                <div className="space-y-1">
                                    {FAQ_ITEMS.map((item, index) => (
                                        <div key={index} className="border-b border-slate-100 last:border-0">
                                            <button
                                                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                                className="w-full py-4 flex items-center justify-between text-left hover:text-church-gold transition-colors"
                                            >
                                                <span className="font-medium text-sm text-slate-800">{item.question}</span>
                                                {expandedFaq === index
                                                    ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                    : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                }
                                            </button>
                                            {expandedFaq === index && (
                                                <p className="pb-4 text-sm text-slate-600 leading-relaxed">{item.answer}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
