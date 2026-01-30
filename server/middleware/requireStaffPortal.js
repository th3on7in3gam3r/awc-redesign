/**
 * Middleware to require staff portal access
 * Blocks members from accessing /staff/* routes
 */

import { isStaffRole } from './permissions.js';

function requireStaffPortal(req, res, next) {
    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (!isStaffRole(req.user.role)) {
        return res.status(403).json({
            message: 'Staff portal access required',
            detail: 'This area is restricted to staff members only'
        });
    }

    next();
}

export default requireStaffPortal;
