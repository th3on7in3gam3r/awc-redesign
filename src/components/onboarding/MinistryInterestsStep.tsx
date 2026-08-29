import React, { useState } from 'react';
import { Heart, Users, Music, BookOpen, Handshake, Baby, UserCheck, HeartHandshake } from 'lucide-react';

interface MinistryInterestsStepProps {
    onNext: (data: any) => void;
    onBack: () => void;
    initialData?: any;
}

const MINISTRIES = [
    { id: 'worship', name: 'Worship Team', icon: Music, description: 'Lead worship through music' },
    { id: 'youth', name: 'Youth Ministry', icon: Users, description: 'Mentor young people' },
    { id: 'children', name: "Children's Ministry", icon: Baby, description: 'Teach and care for kids' },
    { id: 'mens', name: "Men's Ministry", icon: UserCheck, description: 'Fellowship and growth for men' },
    { id: 'womens', name: "Women's Ministry", icon: UserCheck, description: 'Fellowship and growth for women' },
    { id: 'married', name: "Married's Ministry", icon: HeartHandshake, description: 'Support for married couples' },
    { id: 'prayer', name: 'Prayer Team', icon: Heart, description: 'Intercede for others' },
    { id: 'outreach', name: 'Community Outreach', icon: Handshake, description: 'Serve the community' },
    { id: 'teaching', name: 'Bible Study', icon: BookOpen, description: 'Study and teach the Word' },
];

export const MinistryInterestsStep: React.FC<MinistryInterestsStepProps> = ({ onNext, onBack, initialData }) => {
    const [selected, setSelected] = useState<string[]>(initialData?.ministry_interests || []);

    const toggleMinistry = (id: string) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleNext = () => {
        onNext({ ministry_interests: selected });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Heart className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">What interests you?</h2>
                <p className="text-slate-600 max-w-md mx-auto">
                    Select the ministries you'd like to learn more about. You can always update this later.
                </p>
            </div>

            {/* Ministry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {MINISTRIES.map((ministry) => {
                    const Icon = ministry.icon;
                    const isSelected = selected.includes(ministry.id);

                    return (
                        <button
                            key={ministry.id}
                            onClick={() => toggleMinistry(ministry.id)}
                            className={`p-6 rounded-2xl border-2 text-left transition-all ${isSelected
                                ? 'border-church-gold bg-church-gold/5'
                                : 'border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? 'bg-church-gold text-white' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 mb-1">{ministry.name}</h3>
                                    <p className="text-sm text-slate-500">{ministry.description}</p>
                                </div>
                                {isSelected && (
                                    <div className="w-6 h-6 bg-church-gold rounded-full flex items-center justify-center text-white text-sm">
                                        ✓
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Navigation */}
            <div className="flex justify-between max-w-2xl mx-auto">
                <button
                    onClick={onBack}
                    className="px-8 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                    ← Back
                </button>
                <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-church-gold text-white rounded-xl font-bold hover:bg-church-gold/90 transition-colors"
                >
                    Continue →
                </button>
            </div>
        </div>
    );
};
