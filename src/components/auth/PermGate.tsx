import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/permissions';

interface PermGateProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Permission-based gate component
 * Shows children only if user has the required permission
 */
export const PermGate: React.FC<PermGateProps> = ({
    permission,
    children,
    fallback = null
}) => {
    const { user } = useAuth();

    if (!hasPermission(user?.role, permission)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
