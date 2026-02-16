const express = require('express');
const router = express.Router();
const { query } = require('../db.mjs');
const { authenticateToken, requireRole } = require('../middleware/auth.js');

// Helper function to generate unique 4-digit code
async function generateUniqueCode() {
    let code;
    let isUnique = false;

    while (!isUnique) {
        code = Math.floor(1000 + Math.random() * 9000).toString();

        // Check if code is already in use by an active session
        const checkSql = `SELECT id FROM event_sessions WHERE code = $1 AND status = 'active'`;
        const result = await query(checkSql, [code]);

        if (result.rows.length === 0) {
            isUnique = true;
        }
    }

    return code;
}

// POST /api/events/:id/session/start - Start check-in session for event
router.post('/:id/session/start', authenticateToken, requireRole(['admin', 'pastor']), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if event exists
        const eventCheck = await query('SELECT * FROM events WHERE id = $1', [id]);
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const event = eventCheck.rows[0];

        // Check if this event already has an active session
        const sessionCheck = await query(
            'SELECT * FROM event_sessions WHERE event_id = $1 AND status = $\'active\'',
            [id]
        );

        if (sessionCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Event already has an active session' });
        }

        // Check if ANY other event has an active session (enforce one live event rule)
        const globalCheck = await query(
            `SELECT e.title, es.* 
             FROM event_sessions es 
             JOIN events e ON es.event_id = e.id 
             WHERE es.status = 'active' AND es.event_id != $1`,
            [id]
        );

        if (globalCheck.rows.length > 0) {
            const otherEvent = globalCheck.rows[0];
            // Option A: Return error
            return res.status(400).json({
                message: `Another event "${otherEvent.title}" is already live. Please stop that session first.`,
                activeEvent: otherEvent
            });

            // Option B: Auto-end other sessions (uncomment to use)
            // await query(
            //     `UPDATE event_sessions SET status = 'ended', ended_at = NOW() WHERE status = 'active' AND event_id != $1`,
            //     [id]
            // );
            // await query(`UPDATE events SET status = 'completed' WHERE status = 'live' AND id != $1`, [id]);
        }

        // Generate unique code
        const code = await generateUniqueCode();

        // Start transaction
        await query('BEGIN');

        try {
            // Create session
            const sessionSql = `
                INSERT INTO event_sessions (event_id, code, started_by)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const sessionResult = await query(sessionSql, [id, code, userId]);
            const session = sessionResult.rows[0];

            // Update event status to 'live'
            await query(`UPDATE events SET status = 'live' WHERE id = $1`, [id]);

            // Commit transaction
            await query('COMMIT');

            // Get updated event
            const updatedEvent = await query('SELECT * FROM events WHERE id = $1', [id]);

            res.json({
                event: updatedEvent.rows[0],
                session: session
            });
        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error starting session:', error);
        res.status(500).json({ message: 'Error starting session' });
    }
});

// POST /api/events/:id/session/stop - Stop check-in session for event
router.post('/:id/session/stop', authenticateToken, requireRole(['admin', 'pastor']), async (req, res) => {
    try {
        const { id } = req.params;

        // Find active session for this event
        const sessionCheck = await query(
            'SELECT * FROM event_sessions WHERE event_id = $1 AND status = \'active\'',
            [id]
        );

        if (sessionCheck.rows.length === 0) {
            return res.status(404).json({ message: 'No active session found for this event' });
        }

        // Start transaction
        await query('BEGIN');

        try {
            // End session
            await query(
                `UPDATE event_sessions SET status = 'ended', ended_at = NOW() WHERE event_id = $1 AND status = 'active'`,
                [id]
            );

            // Update event status to 'completed'
            await query(`UPDATE events SET status = 'completed' WHERE id = $1`, [id]);

            // Commit transaction
            await query('COMMIT');

            res.json({ success: true, message: 'Session ended successfully' });
        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error stopping session:', error);
        res.status(500).json({ message: 'Error stopping session' });
    }
});

// GET /api/events/:id/roster - Get roster for event's active or latest session
router.get('/:id/roster', authenticateToken, requireRole(['admin', 'pastor']), async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query; // 'all', 'member', 'guest'

        // Find active or latest session
        const sessionSql = `
            SELECT * FROM event_sessions 
            WHERE event_id = $1 
            ORDER BY started_at DESC 
            LIMIT 1
        `;
        const sessionResult = await query(sessionSql, [id]);

        if (sessionResult.rows.length === 0) {
            return res.json([]);
        }

        const session = sessionResult.rows[0];

        // Get checkins with user details
        let rosterSql = `
            SELECT 
                c.*,
                CASE 
                    WHEN c.type = 'member' THEN up.full_name
                    ELSE c.guest_name
                END as name,
                CASE 
                    WHEN c.type = 'member' THEN up.phone
                    ELSE c.guest_phone
                END as phone,
                CASE 
                    WHEN c.type = 'member' THEN up.email
                    ELSE c.guest_email
                END as email
            FROM checkins c
            LEFT JOIN user_profiles up ON c.user_id = up.id
            WHERE c.session_id = $1
        `;

        const params = [session.id];

        if (type && type !== 'all') {
            rosterSql += ` AND c.type = $2`;
            params.push(type);
        }

        rosterSql += ` ORDER BY c.created_at DESC`;

        const rosterResult = await query(rosterSql, params);

        res.json(rosterResult.rows);
    } catch (error) {
        console.error('Error fetching roster:', error);
        res.status(500).json({ message: 'Error fetching roster' });
    }
});

// GET /api/events/:id/roster.csv - Export roster as CSV
router.get('/:id/roster.csv', authenticateToken, requireRole(['admin', 'pastor']), async (req, res) => {
    try {
        const { id } = req.params;

        // Get roster
        const sessionSql = `
            SELECT * FROM event_sessions 
            WHERE event_id = $1 
            ORDER BY started_at DESC 
            LIMIT 1
        `;
        const sessionResult = await query(sessionSql, [id]);

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ message: 'No session found for this event' });
        }

        const session = sessionResult.rows[0];

        const rosterSql = `
            SELECT 
                c.type,
                CASE 
                    WHEN c.type = 'member' THEN up.full_name
                    ELSE c.guest_name
                END as name,
                CASE 
                    WHEN c.type = 'member' THEN up.phone
                    ELSE c.guest_phone
                END as phone,
                CASE 
                    WHEN c.type = 'member' THEN up.email
                    ELSE c.guest_email
                END as email,
                c.adults,
                c.children,
                c.first_time,
                c.created_at
            FROM checkins c
            LEFT JOIN user_profiles up ON c.user_id = up.id
            WHERE c.session_id = $1
            ORDER BY c.created_at DESC
        `;

        const rosterResult = await query(rosterSql, [session.id]);

        // Build CSV
        const headers = ['Type', 'Name', 'Phone', 'Email', 'Adults', 'Children', 'First Time', 'Checked In At'];
        const rows = rosterResult.rows.map(row => [
            row.type,
            row.name || '',
            row.phone || '',
            row.email || '',
            row.adults || 0,
            row.children || 0,
            row.first_time ? 'Yes' : 'No',
            new Date(row.created_at).toLocaleString()
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Get event name for filename
        const eventResult = await query('SELECT title FROM events WHERE id = $1', [id]);
        const eventTitle = eventResult.rows[0]?.title || 'event';
        const filename = `${eventTitle.replace(/[^a-z0-9]/gi, '_')}_roster.csv`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csv);
    } catch (error) {
        console.error('Error exporting roster:', error);
        res.status(500).json({ message: 'Error exporting roster' });
    }
});

module.exports = router;
