/**
 * Server-side Route Guards for AWC-Connect
 * Provides permission and ministry scope checking middleware
 */

import { hasPermission, isStaffRole } from './permissions.js';
import { query } from '../db.mjs';

/**
 * Require specific permission middleware
 * @param {string} permission - Required permission
 * @returns {Function} Express middleware
 */
export function requirePermission(permission) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!hasPermission(req.user.role, permission)) {
            return res.status(403).json({
                message: 'Insufficient permissions',
                required: permission,
                userRole: req.user.role
            });
        }

        next();
    };
}

/**
 * Require ministry scope middleware
 * Checks if user is a leader of the specified ministry
 * Admins and pastors bypass this check
 * @param {Function} getMinistryId - Function to extract ministry ID from request
 * @returns {Function} Express middleware
 */
export function requireMinistryScope(getMinistryId) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Admins, pastors, and administrators bypass scope checks
        if (['admin', 'pastor', 'administrator'].includes(req.user.role)) {
            return next();
        }

        // Get ministry ID from request
        const ministryId = typeof getMinistryId === 'function'
            ? getMinistryId(req)
            : req.params.ministryId || req.body.ministryId;

        if (!ministryId) {
            return res.status(400).json({ message: 'Ministry ID required' });
        }

        try {
            // Check if user is leader of this ministry
            const result = await query(`
                SELECT 1 FROM ministry_leaders
                WHERE ministry_id = $1 AND person_id = $2
            `, [ministryId, req.user.userId]);

            if (result.rows.length === 0) {
                return res.status(403).json({
                    message: 'Not authorized for this ministry',
                    ministryId
                });
            }

            next();
        } catch (err) {
            console.error('Ministry scope check error:', err);
            res.status(500).json({ message: 'Error checking ministry access' });
        }
    };
}

/**
 * Require one of multiple permissions
 * @param {string[]} permissions - Array of acceptable permissions
 * @returns {Function} Express middleware
 */
export function requireAnyPermission(permissions) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const hasAny = permissions.some(perm => hasPermission(req.user.role, perm));

        if (!hasAny) {
            return res.status(403).json({
                message: 'Insufficient permissions',
                required: `One of: ${permissions.join(', ')}`,
                userRole: req.user.role
            });
        }

        next();
    };
}

/**
 * Require specific roles
 * @param {string[]} roles - Array of allowed roles
 * @returns {Function} Express middleware
 */
export function requireRoles(roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Access denied',
                required: `One of: ${roles.join(', ')}`,
                userRole: req.user.role
            });
        }

        next();
    };
}
