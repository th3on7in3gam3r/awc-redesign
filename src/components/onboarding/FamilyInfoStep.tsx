import React, { useState } from 'react';
import { Users, Plus, Trash2, Baby } from 'lucide-react';

interface FamilyInfoStepProps {
    onNext: (data: any) => void;
    onBack: () => void;
    initialData?: any;
}

interface Child {
    id: string; // temp id
    firstName: string;
    lastName: string;
    dob: string;
    allergies: string;
}

export const FamilyInfoStep: React.FC<FamilyInfoStepProps> = ({ onNext, onBack, initialData }) => {
    const [householdName, setHouseholdName] = useState(initialData?.household_name || '');
    const [children, setChildren] = useState<Child[]>([]);

    // Form for new child
    const [newChild, setNewChild] = useState<Child>({
        id: '',
        firstName: '',
        lastName: '',
        dob: '',
        allergies: ''
    });
    const [showAddForm, setShowAddForm] = useState(false);

    const handleAddChild = () => {
        if (!newChild.firstName || !newChild.lastName) return; // Basic validation

        setChildren([...children, { ...newChild, id: Date.now().toString() }]);
        setNewChild({ id: '', firstName: '', lastName: '', dob: '', allergies: '' });
        setShowAddForm(false);
    };

    const removeChild = (id: string) => {
        setChildren(prev => prev.filter(c => c.id !== id));
    };

    const handleNext = () => {
        // Send data
        onNext({
            household_name: householdName,
            children: children
        });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Users className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Tell us about your family</h2>
                <p className="text-slate-600 max-w-md mx-auto">
                    We'd love to welcome your whole family! Add your children here to get started with Kids Check-in.
                </p>
            </div>

            <div className="max-w-xl mx-auto space-y-6">

                {/* Household Name */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        Household Name
                    </label>
                    <input
                        type="text"
                        value={householdName}
                        onChange={(e) => setHouseholdName(e.target.value)}
                        placeholder="e.g. The Smith Family"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-church-gold focus:border-transparent outline-none transition-all"
                    />
                </div>

                {/* Children List */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-bold text-slate-700">
                            Children ({children.length})
                        </label>
                        {!showAddForm && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="text-sm font-bold text-church-gold hover:text-amber-600 flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Child
                            </button>
                        )}
                    </div>

                    <div className="space-y-3 mb-4">
                        {children.map(child => (
                            <div key={child.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
                                        <Baby className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">{child.firstName} {child.lastName}</div>
                                        <div className="text-xs text-slate-500">Born: {child.dob || 'N/A'} {child.allergies && `• Allergies: ${child.allergies}`}</div>
                                    </div>
                                </div>
                                <button onClick={() => removeChild(child.id)} className="text-slate-400 hover:text-red-500 p-2">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {showAddForm && (
                        <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl animate-fade-in">
                            <h4 className="text-sm font-bold text-slate-700 mb-3">New Child Details</h4>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={newChild.firstName}
                                    onChange={e => setNewChild({ ...newChild, firstName: e.target.value })}
                                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={newChild.lastName}
                                    onChange={e => setNewChild({ ...newChild, lastName: e.target.value })}
                                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                />
                                <input
                                    type="date"
                                    placeholder="Date of Birth"
                                    value={newChild.dob}
                                    onChange={e => setNewChild({ ...newChild, dob: e.target.value })}
                                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Allergies / Notes"
                                    value={newChild.allergies}
                                    onChange={e => setNewChild({ ...newChild, allergies: e.target.value })}
                                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddChild}
                                    className="px-3 py-1.5 text-sm font-bold text-white bg-church-gold rounded-lg shadow-sm hover:bg-amber-600"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between max-w-xl mx-auto pt-6">
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
