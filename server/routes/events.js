const express = require('express');
const router = express.Router();
const { query } = require('../db.mjs');
const { authenticateToken, requireRole } = require('../middleware/auth.js');

// GET /api/events - Get all events with optional status filter
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { status } = req.query;

        let sql = `
            SELECT 
                e.*,
                json_build_object(
                    'id', es.id,
                    'code', es.code,
                    'started_at', es.started_at,
                    'started_by', es.started_by
                ) as active_session,
                (
                    SELECT COUNT(*) 
                    FROM checkins c 
                    WHERE c.event_id = e.id
                ) as total_checkins
            FROM events e
            LEFT JOIN event_sessions es ON e.id = es.event_id AND es.status = 'active'
        `;

        const params = [];

        if (status && status !== 'all') {
            sql += ` WHERE e.status = $1`;
            params.push(status);
        }

        sql += ` ORDER BY e.starts_at DESC`;

        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events' });
    }
});

// GET /api/events/:id - Get event details with session and roster summary
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Get event with active session
        const eventSql = `
            SELECT 
                e.*,
                json_build_object(
                    'id', es.id,
                    'code', es.code,
                    'status', es.status,
                    'started_at', es.started_at,
                    'ended_at', es.ended_at,
                    'started_by', es.started_by
                ) as session
            FROM events e
            LEFT JOIN event_sessions es ON e.id = es.event_id 
                AND (es.status = 'active' OR es.id = (
                    SELECT id FROM event_sessions 
                    WHERE event_id = e.id 
                    ORDER BY started_at DESC 
                    LIMIT 1
                ))
            WHERE e.id = $1
        `;

        const eventResult = await query(eventSql, [id]);

        if (eventResult.rows.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const event = eventResult.rows[0];

        // Get roster summary if there's a session
        if (event.session && event.session.id) {
            const statsSql = `
                SELECT 
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE type = 'member') as members,
                    COUNT(*) FILTER (WHERE type = 'guest') as guests,
                    COUNT(*) FILTER (WHERE first_time = true) as first_time,
                    SUM(children) as total_children
                FROM checkins
                WHERE session_id = $1
            `;

            const statsResult = await query(statsSql, [event.session.id]);
            event.stats = statsResult.rows[0];
        }

        res.json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ message: 'Error fetching event' });
    }
});

// POST /api/events - Create new event (admin/pastor only)
router.post('/', authenticateToken, requireRole(['admin', 'pastor']), async (req, res) => {
    try {
        const { title, description, location, starts_at, ends_at } = req.body;
        const userId = req.user.id;

        if (!title || !starts_at) {
            return res.status(400).json({ message: 'Title and start time are required' });
        }

        const sql = `
            INSERT INTO events (title, description, location, starts_at, ends_at, created_by)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const result = await query(sql, [title, description, location, starts_at, ends_at, userId]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Error creating event' });
    }
});

// PATCH /api/events/:id - Update event (admin/pastor only)
router.patch('/:id', authenticateToken, requireRole(['admin', 'pastor']), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, location, starts_at, ends_at, status } = req.body;

        const updates = [];
        const params = [];
        let paramCount = 1;

        if (title !== undefined) {
            updates.push(`title = $${paramCount++}`);
            params.push(title);
        }
        if (description !== undefined) {
            updates.push(`description = $${paramCount++}`);
            params.push(description);
        }
        if (location !== undefined) {
            updates.push(`location = $${paramCount++}`);
            params.push(location);
        }
        if (starts_at !== undefined) {
            updates.push(`starts_at = $${paramCount++}`);
            params.push(starts_at);
        }
        if (ends_at !== undefined) {
            updates.push(`ends_at = $${paramCount++}`);
            params.push(ends_at);
        }
        if (status !== undefined) {
            updates.push(`status = $${paramCount++}`);
            params.push(status);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        params.push(id);
        const sql = `
            UPDATE events 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await query(sql, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Error updating event' });
    }
});

// DELETE /api/events/:id - Delete event (admin/pastor only)
router.delete('/:id', authenticateToken, requireRole(['admin', 'pastor']), async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `DELETE FROM events WHERE id = $1 RETURNING id`;
        const result = await query(sql, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ success: true, message: 'Event deleted' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Error deleting event' });
    }
});

module.exports = router;
