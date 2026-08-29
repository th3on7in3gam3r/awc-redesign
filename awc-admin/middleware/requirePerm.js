/**
 * Middleware factory to require specific permissions
 * Usage: app.get('/api/staff/finance', auth, requirePerm('FINANCE_READ'), ...)
 */

import { hasPermission } from './permissions.js';

function requirePerm(permission) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!hasPermission(req.user.role, permission)) {
            return res.status(403).json({
                message: 'Insufficient permissions',
                required: permission,
                role: req.user.role
            });
        }

        next();
    };
}

export default requirePerm;
