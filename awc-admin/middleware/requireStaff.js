export default (req, res, next) => {
    // Expected roles that have staff access
    const staffRoles = ['admin', 'pastor', 'staff', 'ministry_leader', 'finance', 'first_lady', 'administrator', 'checkin_team'];

    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Unauthorized: No user role found' });
    }

    if (!staffRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied: Staff privileges required' });
    }

    next();
};
