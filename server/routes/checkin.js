const express = require('express');
const router = express.Router();
const { query } = require('../db.mjs');
const { authenticateToken } = require('../middleware/auth.js');

// GET /api/checkin/active - Get currently active event and session
router.get('/active', async (req, res) => {
    try {
        const sql = `
            SELECT 
                e.*,
                json_build_object(
                    'id', es.id,
                    'code', es.code,
                    'started_at', es.started_at,
                    'started_by', es.started_by
                ) as session
            FROM events e
            JOIN event_sessions es ON e.id = es.event_id
            WHERE e.status = 'live' AND es.status = 'active'
            LIMIT 1
        `;

        const result = await query(sql);

        if (result.rows.length === 0) {
            return res.json(null);
        }

        const data = result.rows[0];
        res.json({
            event: {
                id: data.id,
                title: data.title,
                description: data.description,
                location: data.location,
                starts_at: data.starts_at,
                status: data.status
            },
            session: data.session
        });
    } catch (error) {
        console.error('Error fetching active session:', error);
        res.status(500).json({ message: 'Error fetching active session' });
    }
});

// POST /api/checkin - Member check-in with code
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.id;

        if (!code) {
            return res.status(400).json({ message: 'Check-in code is required' });
        }

        // Find active session by code
        const sessionSql = `
            SELECT es.*, e.* 
            FROM event_sessions es
            JOIN events e ON es.event_id = e.id
            WHERE es.code = $1 AND es.status = 'active'
        `;

        const sessionResult = await query(sessionSql, [code]);

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ message: 'Invalid or expired check-in code' });
        }

        const session = sessionResult.rows[0];

        // Check if user already checked in
        const checkSql = `
            SELECT * FROM checkins 
            WHERE session_id = $1 AND user_id = $2
        `;

        const checkResult = await query(checkSql, [session.id, userId]);

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ message: 'You have already checked in for this event' });
        }

        // Create check-in
        const checkinSql = `
            INSERT INTO checkins (session_id, event_id, user_id, type)
            VALUES ($1, $2, $3, 'member')
            RETURNING *
        `;

        const checkinResult = await query(checkinSql, [session.id, session.event_id, userId]);

        res.json({
            success: true,
            event: {
                id: session.event_id,
                title: session.title,
                location: session.location
            },
            checked_in_at: checkinResult.rows[0].created_at
        });
    } catch (error) {
        console.error('Error checking in:', error);
        res.status(500).json({ message: 'Error processing check-in' });
    }
});

// POST /api/checkin/guest - Guest check-in
router.post('/guest', async (req, res) => {
    try {
        const {
            code,
            full_name,
            phone,
            email,
            adults = 1,
            children = 0,
            first_time = false,
            contact_ok = true,
            prayer_request
        } = req.body;

        if (!full_name || !phone) {
            return res.status(400).json({ message: 'Name and phone are required' });
        }

        let session;

        if (code) {
            // Find session by code
            const sessionSql = `
                SELECT es.*, e.* 
                FROM event_sessions es
                JOIN events e ON es.event_id = e.id
                WHERE es.code = $1 AND es.status = 'active'
            `;

            const sessionResult = await query(sessionSql, [code]);

            if (sessionResult.rows.length === 0) {
                return res.status(404).json({ message: 'Invalid or expired check-in code' });
            }

            session = sessionResult.rows[0];
        } else {
            // Find currently live event
            const liveSql = `
                SELECT es.*, e.* 
                FROM event_sessions es
                JOIN events e ON es.event_id = e.id
                WHERE e.status = 'live' AND es.status = 'active'
                LIMIT 1
            `;

            const liveResult = await query(liveSql);

            if (liveResult.rows.length === 0) {
                return res.status(404).json({ message: 'No active check-in session available' });
            }

            session = liveResult.rows[0];
        }

        // Create guest check-in
        const checkinSql = `
            INSERT INTO checkins (
                session_id, 
                event_id, 
                guest_name, 
                guest_phone, 
                guest_email, 
                adults, 
                children, 
                first_time, 
                contact_ok, 
                type,
                prayer_request
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'guest', $10)
            RETURNING *
        `;

        const checkinResult = await query(checkinSql, [
            session.id,
            session.event_id,
            full_name,
            phone,
            email,
            adults,
            children,
            first_time,
            contact_ok,
            prayer_request
        ]);

        res.json({
            success: true,
            event: {
                id: session.event_id,
                title: session.title,
                location: session.location
            },
            checked_in_at: checkinResult.rows[0].created_at
        });
    } catch (error) {
        console.error('Error processing guest check-in:', error);
        res.status(500).json({ message: 'Error processing check-in' });
    }
});

module.exports = router;
