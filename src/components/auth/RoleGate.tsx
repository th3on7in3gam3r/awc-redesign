import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface RoleGateProps {
    children: React.ReactNode;
    allowedRoles: string[];
    fallback?: React.ReactNode;
    redirectTo?: string;
}

const STAFF_ROLES = ['admin', 'pastor', 'staff', 'ministry_leader', 'checkin_team'];

export const RoleGate: React.FC<RoleGateProps> = ({
    children,
    allowedRoles,
    fallback,
    redirectTo
}) => {
    const { user } = useAuth();

    // Not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check if user's role is in allowed roles
    const hasAccess = allowedRoles.includes(user.role);

    if (!hasAccess) {
        // If redirect specified, navigate there
        if (redirectTo) {
            return <Navigate to={redirectTo} replace />;
        }

        // If custom fallback provided, show it
        if (fallback) {
            return <>{fallback}</>;
        }

        // Default access denied UI
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="max-w-md w-full mx-4">
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
                        <p className="text-slate-600 mb-6">
                            You don't have permission to access this area.
                        </p>
                        <div className="bg-slate-50 rounded-xl p-4 mb-6">
                            <p className="text-sm text-slate-500 mb-1">Your Role:</p>
                            <p className="font-bold text-slate-900 capitalize">{user.role}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <a
                                href="/dashboard"
                                className="px-6 py-3 bg-church-gold text-white rounded-xl font-bold hover:bg-church-gold/90 transition-colors"
                            >
                                Go to Dashboard
                            </a>
                            <a
                                href="/"
                                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                            >
                                Back to Home
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

// Helper component for inline role checking
export const RequireRole: React.FC<{ roles: string[]; children: React.ReactNode }> = ({ roles, children }) => {
    const { user } = useAuth();

    if (!user || !roles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
};

// Helper hook for role checking
export const useHasRole = (roles: string[]): boolean => {
    const { user } = useAuth();
    return user ? roles.includes(user.role) : false;
};

// Helper hook for staff access
export const useIsStaff = (): boolean => {
    const { user } = useAuth();
    return user ? STAFF_ROLES.includes(user.role) : false;
};
