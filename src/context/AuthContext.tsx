import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load user from local storage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        } else {
            // Explicitly set null if not found, to indicate init is done
            setToken(null);
        }
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            const userData: User = {
                id: data.user.id,
                name: `${data.user.firstName} ${data.user.lastName}`,
                email: data.user.email,
                role: data.user.role as Role,
                joinedAt: data.user.created_at,
                lastLogin: data.user.last_login,
                status: 'active'
            };

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            setToken(data.token);
            return userData; // Return for role validation in login pages
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (firstName: string, lastName: string, email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            const userData: User = {
                id: data.user.id,
                name: `${data.user.firstName} ${data.user.lastName}`,
                email: data.user.email,
                role: data.user.role as Role,
                joinedAt: data.user.created_at,
                lastLogin: data.user.last_login,
                status: 'active'
            };

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, loading, error, token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
