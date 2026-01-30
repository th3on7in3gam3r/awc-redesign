import express from "express";
import dotenv from "dotenv";
import pkg from "pg";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

dotenv.config();

const { Pool } = pkg;
const app = express();

app.use(cors());
app.use(express.json());

// Legacy JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_change_this_later';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

/* ------------------------
   AUTH HELPER (Hybrid: Neon Auth + Legacy JWT)
   ------------------------ */
async function getUserFromAuth(req) {
    // 1. Try Neon Auth Header
    const authUserId = req.headers["x-auth-user-id"];
    if (authUserId) {
        const { rows } = await pool.query(
            "SELECT * FROM user_profiles WHERE auth_user_id = $1",
            [authUserId]
        );
        return rows[0] || null;
    }

    // 2. Try Legacy JWT (Authorization: Bearer <token>)
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            // decoded should have userId
            if (decoded && decoded.userId) {
                const { rows } = await pool.query(
                    "SELECT * FROM user_profiles WHERE id = $1",
                    [decoded.userId]
                );
                return rows[0] || null;
            }
        } catch (e) {
            // Token invalid or expired
            return null;
        }
    }

    return null;
}

/* ------------------------
   ADMIN ENDPOINTS (Ministry Requests)
   ------------------------ */
// GET pending requests (Admin only)
app.get("/api/admin/ministry-requests", async (req, res) => {
    const user = await getUserFromAuth(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (user.role !== 'admin' && user.role !== 'pastor') {
        return res.status(403).json({ error: "Forbidden" });
    }

    const { status } = req.query;
    const { rows } = await pool.query(`
        SELECT mr.*, 
               u.first_name, u.last_name, u.email 
        FROM ministry_requests mr
        JOIN user_profiles u ON mr.user_id = u.id
        WHERE mr.status = $1
        ORDER BY mr.created_at ASC
    `, [status || 'pending']);

    res.json(rows);
});

// GET user notes (Admin only)
app.get("/api/admin/notes/:targetUserId", async (req, res) => {
    const user = await getUserFromAuth(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (user.role !== 'admin' && user.role !== 'pastor') {
        return res.status(403).json({ error: "Forbidden" });
    }

    const { targetUserId } = req.params;
    try {
        const { rows } = await pool.query(
            "SELECT * FROM user_notes WHERE user_id = $1 ORDER BY created_at DESC",
            [targetUserId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch notes" });
    }
});

// POST new note (Admin only)
app.post("/api/admin/notes/:targetUserId", async (req, res) => {
    const user = await getUserFromAuth(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (user.role !== 'admin' && user.role !== 'pastor') {
        return res.status(403).json({ error: "Forbidden" });
    }

    const { targetUserId } = req.params;
    const { note } = req.body;

    try {
        await pool.query(
            "INSERT INTO user_notes (user_id, admin_id, note) VALUES ($1, $2, $3)",
            [targetUserId, user.id, note]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add note" });
    }
});

// PATCH approve/deny request
app.patch("/api/admin/ministry-requests/:id", async (req, res) => {
    const user = await getUserFromAuth(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (user.role !== 'admin' && user.role !== 'pastor') {
        return res.status(403).json({ error: "Forbidden" });
    }

    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'deny'

    if (!['approve', 'deny'].includes(action)) {
        return res.status(400).json({ error: "Invalid action" });
    }

    const { rows } = await pool.query("SELECT * FROM ministry_requests WHERE id = $1", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Request not found" });
    const request = rows[0];

    try {
        await pool.query('BEGIN');

        if (action === 'approve') {
            // 1. Add to user_ministries (if not exists)
            await pool.query(`
                INSERT INTO user_ministries (user_id, ministry_id, role)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, ministry_id) DO NOTHING
            `, [request.user_id, request.ministry_id, request.interest_role]);

            // 2. Update status
            await pool.query("UPDATE ministry_requests SET status = 'approved' WHERE id = $1", [id]);
        } else {
            // Deny
            await pool.query("UPDATE ministry_requests SET status = 'denied' WHERE id = $1", [id]);
        }

        await pool.query('COMMIT');
        res.json({ success: true, status: action === 'approve' ? 'approved' : 'denied' });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error("Admin action failed:", err);
        res.status(500).json({ error: "Action failed" });
    }
});

/* ------------------------
   LEGACY ENDPOINTS (Ported)
   ------------------------ */

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM user_profiles WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        // Update last login
        await pool.query('UPDATE user_profiles SET last_login = NOW() WHERE id = $1', [user.id]);

        res.json({ token, user: { ...user, password_hash: undefined } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/members
app.get('/api/members', async (req, res) => {
    // Ideally check role here, but keeping logic simpler for "make it work"
    const user = await getUserFromAuth(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    try {
        // Return minimal view for directory
        const result = await pool.query(`
            SELECT id, concat(first_name, ' ', last_name) as name, email, role, avatar, created_at
            FROM user_profiles 
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching members' });
    }
});

// GET /api/me (Profile)
app.get('/api/me', async (req, res) => {
    const user = await getUserFromAuth(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // Return the user we already fetched, but scrub password
    const safeUser = { ...user };
    delete safeUser.password_hash;
    res.json(safeUser);
});

// PUT /api/me (Update Profile)
app.put('/api/me', async (req, res) => {
    const user = await getUserFromAuth(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { firstName, lastName, phone, preferred_contact, address, bio, avatar } = req.body;
    try {
        const result = await pool.query(`
            UPDATE user_profiles 
            SET first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                phone = COALESCE($3, phone),
                preferred_contact = COALESCE($4, preferred_contact),
                address = COALESCE($5, address),
                bio = COALESCE($6, bio),
                avatar = COALESCE($7, avatar),
                updated_at = NOW()
            WHERE id = $8
            RETURNING id, first_name, last_name, email, phone, preferred_contact, address, bio, avatar`,
            [firstName, lastName, phone, preferred_contact, address, bio, avatar, user.id]
        );
        res.json({ message: 'Profile updated', user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

/* ------------------------
   ENGAGEMENT SUMMARY STUBS
   ------------------------ */
// GET /api/me/attendance-summary
app.get('/api/me/attendance-summary', async (req, res) => {
    const user = await getUserFromAuth(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // Returning stub 0s for now to match interface
    res.json({
        lastCheckIn: null,
        stats: { last30Days: 0, last90Days: 0 }
    });
});

// GET /api/me/prayers
app.get('/api/me/prayers', async (req, res) => {
    const user = await getUserFromAuth(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // Basic stub
    res.json({
        requests: [],
        summary: { activeCount: 0, lastRequest: null }
    });
});

/* ------------------------
   ORIGINAL USER REQUESTS
   ------------------------ */

/* ------------------------
   MINISTRIES (Rest of file...)
   ------------------------ */

// List all ministries
app.get("/api/ministries", async (_req, res) => {
    const { rows } = await pool.query(
        "SELECT id, name, description FROM ministries ORDER BY name"
    );
    res.json(rows);
});

// Get my ministries
app.get("/api/me/ministries", async (req, res) => {
    const user = await getUserFromAuth(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { rows } = await pool.query(
        `
    SELECT m.id, m.name, um.role
    FROM user_ministries um
    JOIN ministries m ON m.id = um.ministry_id
    WHERE um.user_id = $1
    `,
        [user.id]
    );

    res.json(rows);
});

// Request to join a ministry
app.post("/api/me/ministry-request", async (req, res) => {
    const user = await getUserFromAuth(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { ministry_id, ministry_name, interest_role, availability, note } = req.body;

    try {
        await pool.query(
            `
        INSERT INTO ministry_requests (user_id, ministry_id, ministry_name, interest_role, availability, note, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        `,
            [user.id, ministry_id || null, ministry_name, interest_role, availability, note]
        );

        res.json({ success: true });
    } catch (err) {
        // Unique constraint violation code is usually 23505
        if (err.code === '23505') {
            return res.status(409).json({ error: "You have already requested to join this ministry." });
        }
        console.error(err);
        res.status(500).json({ error: "Failed to submit request" });
    }
});

// Get pending requests
app.get("/api/me/ministry-requests", async (req, res) => {
    const user = await getUserFromAuth(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { rows } = await pool.query(
        `SELECT * FROM ministry_requests WHERE user_id = $1 ORDER BY created_at DESC`,
        [user.id]
    );

    // Filter to return helpful shape
    res.json(rows.map(r => ({
        ministry_id: r.ministry_id,
        ministry_name: r.ministry_name,
        status: r.status
    })));
});

/* ------------------------
   START SERVER
   ------------------------ */
const PORT = 5050;
app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
});
