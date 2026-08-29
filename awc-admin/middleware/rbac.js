// Role-Based Access Control (RBAC) Middleware

const STAFF_ROLES = ['admin', 'pastor', 'staff', 'ministry_leader', 'checkin_team'];
const ADMIN_ROLES = ['admin', 'pastor'];

/**
 * Middleware to require staff-level access
 * Allows: admin, pastor, staff, ministry_leader, checkin_team
 */
export const requireStaffRole = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (!STAFF_ROLES.includes(req.user.role)) {
        return res.status(403).json({
            message: 'Staff access required',
            requiredRoles: STAFF_ROLES,
            userRole: req.user.role
        });
    }

    next();
};

/**
 * Middleware to require admin-level access
 * Allows: admin, pastor
 */
export const requireAdminRole = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (!ADMIN_ROLES.includes(req.user.role)) {
        return res.status(403).json({
            message: 'Admin access required',
            requiredRoles: ADMIN_ROLES,
            userRole: req.user.role
        });
    }

    next();
};

/**
 * Higher-order middleware to require specific roles
 * Usage: requireRole(['admin', 'pastor'])
 */
export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Insufficient permissions',
                requiredRoles: allowedRoles,
                userRole: req.user.role
            });
        }

        next();
    };
};

/**
 * Check if user has staff-level access (utility function)
 */
export const isStaff = (role) => {
    return STAFF_ROLES.includes(role);
};

/**
 * Check if user has admin-level access (utility function)
 */
export const isAdmin = (role) => {
    return ADMIN_ROLES.includes(role);
};

export default {
    requireStaffRole,
    requireAdminRole,
    requireRole,
    isStaff,
    isAdmin,
    STAFF_ROLES,
    ADMIN_ROLES
};
