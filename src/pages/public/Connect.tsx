import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

const Connect: React.FC = () => {
    const { login, register, isAuthenticated, user, error } = useAuth();
    const navigate = useNavigate();
    const [view, setView] = useState<'register' | 'member' | 'admin'>('register');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Registration State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [localError, setLocalError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setLocalError('Invalid email or password');
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');

        if (regPassword !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        try {
            await register(firstName, lastName, regEmail, regPassword);
            navigate('/dashboard');
        } catch (err: any) {
            setLocalError(err.message || 'Registration failed');
        }
    };

    const clearForms = () => {
        setEmail(''); setPassword('');
        setFirstName(''); setLastName(''); setRegEmail(''); setRegPassword(''); setConfirmPassword('');
        setLocalError('');
    };

    if (isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 text-center">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Welcome back, {user?.name}
                        </h2>
                        <Button onClick={() => navigate('/dashboard')} className="mt-8 w-full flex justify-center py-4 px-8 border border-transparent text-sm font-medium rounded-md text-white bg-church-gold hover:bg-church-burgundy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-church-gold">
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white">
            {/* Left Side - Image & Text */}
            <div className="md:w-1/2 relative bg-church-burgundy min-h-[400px] md:min-h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&q=80&w=2000"
                        alt="Worship Atmosphere"
                        className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-church-burgundy/80 to-transparent"></div>
                </div>

                <div className="relative z-10 p-12 md:p-20 text-white max-w-2xl">
                    <span className="text-church-gold font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Connected Fellowship</span>
                    <h1 className="text-5xl md:text-7xl font-bold serif leading-tight mb-8">
                        Welcome home to <br />
                        <span className="italic">the fold.</span>
                    </h1>
                    <p className="text-white/80 text-lg leading-relaxed max-w-md font-light">
                        Access your spiritual vitals, connect with your small groups, and track your kingdom impact.
                    </p>
                </div>
            </div>

            {/* Right Side - Forms */}
            <div className="md:w-1/2 flex items-center justify-center p-8 md:p-20 bg-white">
                <div className="max-w-md w-full">
                    {view === 'register' ? (
                        <div className="animate-fade-in">
                            <div className="mb-10">
                                <h2 className="text-4xl font-bold text-church-burgundy serif mb-2">Join the Family</h2>
                                <p className="text-slate-400">Create your account to start your journey.</p>
                            </div>

                            <form onSubmit={handleRegister} className="space-y-6">
                                <div>
                                    <label className="block text-church-gold text-xs font-bold uppercase tracking-widest mb-2">Full Name</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="First Name" // Corrected from screenshot "e.g Sarah Williams" to two fields for backend compatibility
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-800 placeholder-gray-300 focus:ring-2 focus:ring-church-gold/20"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Last Name"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-800 placeholder-gray-300 focus:ring-2 focus:ring-church-gold/20"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-church-gold text-xs font-bold uppercase tracking-widest mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="email@example.com"
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-800 placeholder-gray-300 focus:ring-2 focus:ring-church-gold/20"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-church-gold text-xs font-bold uppercase tracking-widest mb-2">Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-800 placeholder-gray-300 focus:ring-2 focus:ring-church-gold/20"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-church-gold text-xs font-bold uppercase tracking-widest mb-2">Confirm Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-800 placeholder-gray-300 focus:ring-2 focus:ring-church-gold/20"
                                        required
                                    />
                                </div>

                                {(error || localError) && (
                                    <div className="text-red-500 text-sm bg-red-50 p-4 rounded-xl">
                                        {error || localError}
                                    </div>
                                )}

                                <Button type="submit" className="w-full py-5 bg-church-burgundy text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-church-gold hover:shadow-xl transition-all duration-300">
                                    Create Sanctuary Account
                                </Button>
                            </form>

                            <div className="mt-8 text-center">
                                <p className="text-slate-400 text-sm mb-4">Already a member of the fold?</p>
                                <div className="flex gap-4 justify-center">
                                    <button onClick={() => { setView('member'); clearForms(); }} className="text-church-gold font-bold text-xs uppercase tracking-widest hover:text-church-burgundy transition-colors">
                                        Member Sign In
                                    </button>
                                    <span className="text-slate-300">•</span>
                                    <button onClick={() => { setView('admin'); clearForms(); }} className="text-church-gold font-bold text-xs uppercase tracking-widest hover:text-church-burgundy transition-colors">
                                        Staff Access
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <div className="mb-10 relative">
                                <button
                                    onClick={() => { setView('register'); clearForms(); }}
                                    className="absolute -top-12 left-0 text-slate-400 hover:text-church-gold text-sm font-bold flex items-center gap-2 transition-colors"
                                >
                                    <i className="fa-solid fa-arrow-left"></i> Back to Join
                                </button>
                                <h2 className="text-4xl font-bold text-church-burgundy serif mb-2">
                                    {view === 'member' ? 'Member Portal' : 'Staff Portal'}
                                </h2>
                                <p className="text-slate-400">Welcome back. Please enter your credentials.</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div>
                                    <label className="block text-church-gold text-xs font-bold uppercase tracking-widest mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="email@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-800 placeholder-gray-300 focus:ring-2 focus:ring-church-gold/20"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-church-gold text-xs font-bold uppercase tracking-widest mb-2">Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-800 placeholder-gray-300 focus:ring-2 focus:ring-church-gold/20"
                                        required
                                    />
                                </div>

                                {(error || localError) && (
                                    <div className="text-red-500 text-sm bg-red-50 p-4 rounded-xl">
                                        {error || localError}
                                    </div>
                                )}

                                <Button type="submit" className="w-full py-5 bg-church-burgundy text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-church-gold hover:shadow-xl transition-all duration-300">
                                    {view === 'member' ? 'Sign In as Member' : 'Sign In as Staff'}
                                </Button>
                            </form>

                            {view === 'member' && (
                                <div className="mt-8 text-center">
                                    <p className="text-slate-400 text-sm">
                                        Need to manage the church? <span onClick={() => { setView('admin'); clearForms(); }} className="text-church-gold font-bold cursor-pointer hover:underline">Staff Login</span>
                                    </p>
                                </div>
                            )}
                            {view === 'admin' && (
                                <div className="mt-8 text-center">
                                    <p className="text-slate-400 text-sm">
                                        Not a staff member? <span onClick={() => { setView('member'); clearForms(); }} className="text-church-gold font-bold cursor-pointer hover:underline">Member Login</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-12 text-center text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">
                        SECURE SPIRITUAL PORTAL • AWC
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Connect;
