import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasPermission, isStaffRole } from '../../utils/permissions';

interface PermissionGuardProps {
    permission?: string;
    roles?: string[];
    children: React.ReactNode;
    fallback?: string;
}

/**
 * Permission Guard Component
 * Protects routes based on permissions or roles
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    permission,
    roles,
    children,
    fallback = '/staff'
}) => {
    const { user } = useAuth();

    // Not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Not a staff role
    if (!isStaffRole(user.role)) {
        return <Navigate to="/" replace />;
    }

    // Check role-based access
    if (roles && roles.length > 0 && !roles.includes('all')) {
        if (!roles.includes(user.role)) {
            return <Navigate to={fallback} replace />;
        }
    }

    // Check permission-based access
    if (permission) {
        if (!hasPermission(user.role, permission)) {
            return <Navigate to={fallback} replace />;
        }
    }

    return <>{children}</>;
};

interface StaffGuardProps {
    children: React.ReactNode;
}

/**
 * Staff Portal Guard
 * Ensures only staff roles can access staff portal
 */
export const StaffGuard: React.FC<StaffGuardProps> = ({ children }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!isStaffRole(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
