import React, { useState, useEffect } from 'react';
import { Baby, Users, UserCheck, Plus, AlertCircle, Check, X, Edit2, Calendar } from 'lucide-react';

interface Child {
    id: string;
    first_name: string;
    last_name: string;
    dob: string;
    age: number;
    allergies: string | null;
    notes: string | null;
    eligible_program: string;
    authorized_pickup_names: string[];
}

interface Session {
    id: string;
    program: string;
    status: string;
    opened_at: string;
}

interface Checkin {
    id: string;
    child_id: string;
    child_name: string;
    pickup_code: string | null;
    checked_in_at: string;
}

type TabType = 'daycare' | 'youth' | 'teen';

const calculateAgeDisplay = (dob: string): string => {
    const birthDate = new Date(dob);
    const today = new Date();
    const ageInMs = today.getTime() - birthDate.getTime();
    const ageInYears = ageInMs / (365.25 * 24 * 60 * 60 * 1000);

    const years = Math.floor(ageInYears);
    const months = Math.floor((ageInYears - years) * 12);

    if (years === 0) {
        return `${months} months`;
    } else if (months === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
        return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
    }
};

export const KidsCheckin: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('daycare');
    const [children, setChildren] = useState<Child[]>([]);
    const [sessions, setSessions] = useState<Record<string, Session | null>>({
        daycare: null,
        youth: null,
        teen: null
    });
    const [selectedChildren, setSelectedChildren] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [checkins, setCheckins] = useState<Checkin[]>([]);
    const [showPickupCodes, setShowPickupCodes] = useState(false);
    const [showAddChild, setShowAddChild] = useState(false);
    const [emergencyContact, setEmergencyContact] = useState({ name: '', phone: '' });
    const [notes, setNotes] = useState('');
    const [newChild, setNewChild] = useState({
        first_name: '',
        last_name: '',
        dob: '',
        allergies: '',
        notes: ''
    });

    const handleCreateChild = async () => {
        if (!newChild.first_name || !newChild.last_name || !newChild.dob) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/programs/children', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newChild)
            });

            if (response.ok) {
                const child = await response.json();
                setChildren([...children, child]);
                setShowAddChild(false);
                setNewChild({
                    first_name: '',
                    last_name: '',
                    dob: '',
                    allergies: '',
                    notes: ''
                });
                alert('Child profile created successfully!');
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to create child profile');
            }
        } catch (err) {
            console.error('Error creating child:', err);
            alert('Error creating child profile');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const [childrenRes, sessionsRes] = await Promise.all([
                fetch('/api/programs/my-children', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/programs/active-sessions', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (childrenRes.ok) {
                const childrenData = await childrenRes.json();
                setChildren(childrenData);
            }

            if (sessionsRes.ok) {
                const sessionsData = await sessionsRes.json();
                setSessions(sessionsData);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (selectedChildren.size === 0) return;

        try {
            const token = localStorage.getItem('token');
            const childIds = Array.from(selectedChildren);

            let endpoint = '';
            let body: any = { child_ids: childIds };

            if (activeTab === 'daycare') {
                endpoint = '/api/programs/checkin/daycare';
                body.emergency_contact_name = emergencyContact.name;
                body.emergency_contact_phone = emergencyContact.phone;
                body.notes = notes;
            } else if (activeTab === 'youth') {
                endpoint = '/api/programs/checkin/youth';
                body.notes = notes;
                body.generate_pickup_code = false;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const data = await response.json();
                setCheckins(data.checkins);
                if (activeTab === 'daycare') {
                    setShowPickupCodes(true);
                }
                setSelectedChildren(new Set());
                setNotes('');
            } else {
                const error = await response.json();
                alert(error.message || 'Check-in failed');
            }
        } catch (err) {
            console.error('Error checking in:', err);
            alert('Error processing check-in');
        }
    };

    const handleTeenCheckIn = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/programs/checkin/teen', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });

            if (response.ok) {
                alert('Successfully checked in!');
            } else {
                const error = await response.json();
                alert(error.message || 'Check-in failed');
            }
        } catch (err) {
            console.error('Error checking in:', err);
            alert('Error processing check-in');
        }
    };

    const filteredChildren = children.filter(child => child.eligible_program === activeTab);

    const renderSessionStatus = () => {
        const session = sessions[activeTab];

        if (!session) {
            return (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-800 mb-2">Check-In Closed</h3>
                    <p className="text-sm text-slate-600">
                        Check-in for this program is currently closed. Check-in typically opens Sunday mornings.
                    </p>
                </div>
            );
        }

        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="font-bold text-emerald-800">Check-In Open</span>
                </div>
            </div>
        );
    };

    const renderDaycareTab = () => {
        if (!sessions.daycare) return renderSessionStatus();

        return (
            <div>
                {renderSessionStatus()}

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">My Children (3 months - 9 years)</h3>
                        <button
                            onClick={() => setShowAddChild(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-church-gold text-white rounded-lg hover:bg-amber-600 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Child
                        </button>
                    </div>

                    {filteredChildren.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <p>No children in this age group.</p>
                            <button
                                onClick={() => setShowAddChild(true)}
                                className="text-church-gold hover:underline mt-2"
                            >
                                Add a child profile
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredChildren.map(child => (
                                <div
                                    key={child.id}
                                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${selectedChildren.has(child.id)
                                        ? 'border-church-gold bg-amber-50'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                    onClick={() => {
                                        const newSelected = new Set(selectedChildren);
                                        if (newSelected.has(child.id)) {
                                            newSelected.delete(child.id);
                                        } else {
                                            newSelected.add(child.id);
                                        }
                                        setSelectedChildren(newSelected);
                                    }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-800">
                                                    {child.first_name} {child.last_name}
                                                </h4>
                                                {child.allergies && (
                                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                                        ALLERGIES
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 mt-1">
                                                Age: {calculateAgeDisplay(child.dob)}
                                            </p>
                                            {child.allergies && (
                                                <p className="text-xs text-red-600 mt-2">
                                                    <strong>Allergies:</strong> {child.allergies}
                                                </p>
                                            )}
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedChildren.has(child.id)
                                            ? 'border-church-gold bg-church-gold'
                                            : 'border-slate-300'
                                            }`}>
                                            {selectedChildren.has(child.id) && (
                                                <Check className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {selectedChildren.size > 0 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Emergency Contact Name
                            </label>
                            <input
                                type="text"
                                value={emergencyContact.name}
                                onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-church-gold focus:border-transparent"
                                placeholder="Contact name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Emergency Contact Phone
                            </label>
                            <input
                                type="tel"
                                value={emergencyContact.phone}
                                onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-church-gold focus:border-transparent"
                                placeholder="Phone number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-church-gold focus:border-transparent"
                                rows={3}
                                placeholder="Any special instructions..."
                            />
                        </div>
                        <button
                            onClick={handleCheckIn}
                            className="w-full py-4 bg-church-burgundy text-white font-bold rounded-xl hover:bg-red-800 transition-colors"
                        >
                            Check In {selectedChildren.size} Child{selectedChildren.size !== 1 ? 'ren' : ''}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderYouthTab = () => {
        if (!sessions.youth) return renderSessionStatus();

        return (
            <div>
                {renderSessionStatus()}

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">My Youth (10 - 15 years)</h3>
                        <button
                            onClick={() => setShowAddChild(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-church-gold text-white rounded-lg hover:bg-amber-600 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Youth
                        </button>
                    </div>

                    {filteredChildren.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <p>No youth in this age group.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredChildren.map(child => (
                                <div
                                    key={child.id}
                                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${selectedChildren.has(child.id)
                                        ? 'border-church-gold bg-amber-50'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                    onClick={() => {
                                        const newSelected = new Set(selectedChildren);
                                        if (newSelected.has(child.id)) {
                                            newSelected.delete(child.id);
                                        } else {
                                            newSelected.add(child.id);
                                        }
                                        setSelectedChildren(newSelected);
                                    }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800">
                                                {child.first_name} {child.last_name}
                                            </h4>
                                            <p className="text-sm text-slate-600 mt-1">
                                                Age: {calculateAgeDisplay(child.dob)}
                                            </p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedChildren.has(child.id)
                                            ? 'border-church-gold bg-church-gold'
                                            : 'border-slate-300'
                                            }`}>
                                            {selectedChildren.has(child.id) && (
                                                <Check className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {selectedChildren.size > 0 && (
                    <button
                        onClick={handleCheckIn}
                        className="w-full py-4 bg-church-burgundy text-white font-bold rounded-xl hover:bg-red-800 transition-colors"
                    >
                        Check In {selectedChildren.size} Youth
                    </button>
                )}
            </div>
        );
    };

    const renderTeenTab = () => {
        if (!sessions.teen) return renderSessionStatus();

        return (
            <div>
                {renderSessionStatus()}

                <div className="text-center py-12">
                    <UserCheck className="w-20 h-20 text-church-gold mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Teen Ministry Check-In</h3>
                    <p className="text-slate-600 mb-8">
                        Ages 16-21 • Tap below to check in for today's service
                    </p>
                    <button
                        onClick={handleTeenCheckIn}
                        className="px-12 py-4 bg-church-burgundy text-white font-bold text-lg rounded-xl hover:bg-red-800 transition-colors shadow-lg"
                    >
                        Check In Now
                    </button>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-gold"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Kids & Youth Check-In</h1>
                    <p className="text-slate-600">Check in your children for today's programs</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('daycare')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'daycare'
                            ? 'bg-church-burgundy text-white shadow-lg'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <Baby className="w-5 h-5" />
                        Daycare (3mo-9yrs)
                    </button>
                    <button
                        onClick={() => setActiveTab('youth')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'youth'
                            ? 'bg-church-burgundy text-white shadow-lg'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <Users className="w-5 h-5" />
                        Youth (10-15yrs)
                    </button>
                    <button
                        onClick={() => setActiveTab('teen')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'teen'
                            ? 'bg-church-burgundy text-white shadow-lg'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <UserCheck className="w-5 h-5" />
                        Teen (16-21yrs)
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    {activeTab === 'daycare' && renderDaycareTab()}
                    {activeTab === 'youth' && renderYouthTab()}
                    {activeTab === 'teen' && renderTeenTab()}
                </div>

                {/* Pickup Code Modal */}
                {showPickupCodes && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Pickup Codes</h2>
                            <div className="space-y-4 mb-6">
                                {checkins.map(checkin => (
                                    <div key={checkin.id} className="border-2 border-church-gold rounded-xl p-6 text-center">
                                        <p className="text-sm text-slate-600 mb-2">{checkin.child_name}</p>
                                        <p className="text-5xl font-bold text-church-burgundy tracking-wider">
                                            {checkin.pickup_code}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-slate-600 text-center mb-4">
                                Save or screenshot these codes. You'll need them to pick up your children.
                            </p>
                            <button
                                onClick={() => setShowPickupCodes(false)}
                                className="w-full py-3 bg-church-burgundy text-white font-bold rounded-xl hover:bg-red-800 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}

                {/* Add Child Modal */}
                {showAddChild && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-800">Add Child Profile</h2>
                                <button
                                    onClick={() => setShowAddChild(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-slate-500" />
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">First Name *</label>
                                        <input
                                            type="text"
                                            value={newChild.first_name}
                                            onChange={(e) => setNewChild({ ...newChild, first_name: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-church-gold focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Last Name *</label>
                                        <input
                                            type="text"
                                            value={newChild.last_name}
                                            onChange={(e) => setNewChild({ ...newChild, last_name: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-church-gold focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Date of Birth *</label>
                                    <input
                                        type="date"
                                        value={newChild.dob}
                                        onChange={(e) => setNewChild({ ...newChild, dob: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-church-gold focus:border-transparent"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Used to determine eligible program</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Allergies (Optional)</label>
                                    <input
                                        type="text"
                                        value={newChild.allergies}
                                        onChange={(e) => setNewChild({ ...newChild, allergies: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-church-gold focus:border-transparent"
                                        placeholder="e.g. Peanuts, Dairy, Penicillin"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Medical Notes (Optional)</label>
                                    <textarea
                                        value={newChild.notes}
                                        onChange={(e) => setNewChild({ ...newChild, notes: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-church-gold focus:border-transparent"
                                        rows={3}
                                        placeholder="Any other medical conditions or special needs"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleCreateChild}
                                className="w-full py-3 bg-church-burgundy text-white font-bold rounded-xl hover:bg-red-800 transition-colors"
                            >
                                Create Profile
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
