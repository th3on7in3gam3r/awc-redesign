/**
 * Navigation System for AWC-Connect Staff Portal
 * Provides role-based navigation with permission checks
 */

import { hasPermission, isStaffRole, PERMISSIONS } from './permissions';

export interface NavItem {
    id: string;
    label: string;
    icon: string;
    path: string;
    permission?: string;
    roles?: string[];
    children?: NavItem[];
}

// All available navigation items
const ALL_NAV_ITEMS: NavItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'LayoutDashboard',
        path: '/staff',
        roles: ['all']
    },
    {
        id: 'people',
        label: 'People Directory',
        icon: 'Users',
        path: '/staff/people',
        permission: PERMISSIONS.PEOPLE_READ
    },
    {
        id: 'households',
        label: 'Households',
        icon: 'Home',
        path: '/staff/households',
        permission: PERMISSIONS.HOUSEHOLDS_READ
    },
    {
        id: 'ministries',
        label: 'Ministries',
        icon: 'Heart',
        path: '/staff/ministries',
        permission: PERMISSIONS.MINISTRIES_READ
    },
    {
        id: 'events',
        label: 'Events',
        icon: 'Calendar',
        path: '/staff/events',
        permission: PERMISSIONS.EVENTS_READ
    },
    {
        id: 'checkin',
        label: 'Check-In',
        icon: 'CheckCircle',
        path: '/staff/checkin',
        permission: PERMISSIONS.CHECKIN_READ
    },
    {
        id: 'finance',
        label: 'Finance',
        icon: 'DollarSign',
        path: '/staff/finance',
        permission: PERMISSIONS.FINANCE_READ
    },
    {
        id: 'chat',
        label: 'Team Chat',
        icon: 'MessageSquare',
        path: '/staff/chat',
        permission: PERMISSIONS.CHAT_READ
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: 'Settings',
        path: '/staff/settings',
        roles: ['all']
    }
];

/**
 * Get navigation items for a specific role
 * @param role - User's role
 * @param ministryScopes - Optional array of ministry IDs the user leads
 * @returns Filtered navigation items based on role permissions
 */
export function getNavForRole(
    role: string | undefined,
    ministryScopes?: string[]
): NavItem[] {
    if (!role || !isStaffRole(role)) return [];

    return ALL_NAV_ITEMS.filter(item => {
        // Check role-based access
        if (item.roles) {
            if (item.roles.includes('all')) return true;
            if (!item.roles.includes(role)) return false;
        }

        // Check permission-based access
        if (item.permission) {
            if (!hasPermission(role, item.permission)) return false;
        }

        // Filter children if they exist
        if (item.children) {
            item.children = item.children.filter(child => {
                if (child.permission) {
                    return hasPermission(role, child.permission);
                }
                if (child.roles) {
                    if (child.roles.includes('all')) return true;
                    return child.roles.includes(role);
                }
                return true;
            });

            // Remove parent if no children remain
            if (item.children.length === 0) return false;
        }

        return true;
    });
}

/**
 * Check if user can access a specific path
 * @param role - User's role
 * @param path - Path to check
 * @returns boolean indicating if user can access the path
 */
export function canAccessPath(role: string | undefined, path: string): boolean {
    if (!role || !isStaffRole(role)) return false;

    const navItems = getNavForRole(role);

    // Check if path matches any nav item or its children
    return navItems.some(item => {
        if (item.path === path) return true;
        if (item.children) {
            return item.children.some(child => child.path === path);
        }
        return false;
    });
}

/**
 * Get dashboard variant for role
 * @param role - User's role
 * @returns Dashboard type
 */
export function getDashboardType(role: string | undefined): string {
    const dashboardMap: Record<string, string> = {
        pastor: 'executive',
        first_lady: 'executive',
        administrator: 'operations',
        finance: 'finance',
        ministry_leader: 'ministry',
        staff: 'staff',
        checkin_team: 'checkin',
        admin: 'executive'
    };

    return dashboardMap[role || ''] || 'staff';
}
