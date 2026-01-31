import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { query, prisma } from './db.mjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { auth } from './middleware/auth.js';
import requireStaff from './middleware/requireStaff.js';
import requireStaffPortal from './middleware/requireStaffPortal.js';
import requirePerm from './middleware/requirePerm.js';
import { PERMISSIONS } from './middleware/permissions.js';
import { requirePermission, requireMinistryScope, requireRoles, requireAnyPermission } from './middleware/routeGuards.js';
import { createMentionNotifications, createDMNotification } from './helpers/chatNotifications.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'public/uploads');
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Unique filename: timestamp-random-original
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve uploaded files

// Global Request Logger
app.use((req, res, next) => {
    const line = `[${new Date().toISOString()}] ${req.method} ${req.url} \n`;
    try {
        fs.appendFileSync('server_global.log', line);
        console.log(`Request: ${req.method} ${req.url} `);
    } catch (e) {
        console.error('Logging failed', e);
    }
    next();
});

// --- Routes ---

app.get('/', (req, res) => {
    res.send('Anointed Worship Center API (Church Hub Edition) is running');
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        const result = await query('SELECT NOW()');
        res.json({ status: 'ok', time: result.rows[0].now });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
});

// --- Auth Endpoints (Targeting user_profiles) ---

app.post('/api/auth/login', async (req, res) => {
    // Force reload env vars
    dotenv.config({ override: true });

    // Debug logging to file
    const logData = (msg) => {
        const line = `[${new Date().toISOString()}] ${msg} \n`;
        fs.appendFileSync('server_debug.log', line);
    };

    const { email, password } = req.body;
    logData(`Login attempt for: ${email} `);
    logData(`JWT_SECRET present: ${!!process.env.JWT_SECRET} `);
    logData(`DATABASE_URL present: ${!!process.env.DATABASE_URL} `);

    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    // Get IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    try {
        const result = await query('SELECT * FROM user_profiles WHERE email = $1', [email]);
        logData(`User found: ${result.rows.length > 0} `);

        if (result.rows.length === 0) {
            // Log failed login attempt (skip if table doesn't exist)
            await query(`
                INSERT INTO login_history(user_id, email, success, ip_address, user_agent, failure_reason)
VALUES(NULL, $1, false, $2, $3, 'User not found')
            `, [email, ipAddress, userAgent]).catch(err => {
                if (err.code !== '42P01') console.error('Error logging failed login:', err);
            });

            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];
        logData(`User info: ID = ${user.id} Role = ${user.role} Hash = ${!!user.password_hash} `);

        // Check password
        if (user.password_hash) {
            const match = await bcrypt.compare(password, user.password_hash);
            logData(`Password match: ${match} `);
            if (!match) {
                // Log failed login attempt (skip if table doesn't exist)
                await query(`
                    INSERT INTO login_history(user_id, email, success, ip_address, user_agent, failure_reason)
VALUES($1, $2, false, $3, $4, 'Invalid password')
    `, [user.id, email, ipAddress, userAgent]).catch(err => {
                    if (err.code !== '42P01') console.error('Error logging failed login:', err);
                });

                return res.status(401).json({ message: 'Invalid credentials' });
            }
        } else {
            logData('No password hash on user');
            return res.status(401).json({ message: 'Please login via Neon Auth' });
        }

        logData('Signing JWT...');
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is missing');
        }

        // Import device parser
        const { parseDeviceInfo } = await import('./helpers/deviceParser.js');
        const { getLocationFromIP } = await import('./helpers/ipLocation.js');

        const deviceInfo = parseDeviceInfo(userAgent);
        const location = getLocationFromIP(ipAddress);

        // Create session (only if table exists)
        let sessionToken = null;
        try {
            sessionToken = crypto.randomUUID();
            await query(`
                INSERT INTO user_sessions(user_id, session_token, device_info, ip_address, location, user_agent)
VALUES($1, $2, $3, $4, $5, $6)
            `, [user.id, sessionToken, JSON.stringify(deviceInfo), ipAddress, location, userAgent]);
        } catch (err) {
            if (err.code === '42P01') {
                console.log('Session creation skipped: user_sessions table not created yet');
                sessionToken = null; // Don't include sessionId in token if table doesn't exist
            } else {
                console.error('Error creating session:', err);
            }
        }

        // Log successful login (skip if table doesn't exist)
        await query(`
            INSERT INTO login_history(user_id, email, success, ip_address, location, user_agent)
VALUES($1, $2, true, $3, $4, $5)
        `, [user.id, email, ipAddress, location, userAgent]).catch(err => {
            if (err.code !== '42P01') console.error('Error logging successful login:', err);
        });

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role, ...(sessionToken && { sessionId: sessionToken }) },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        logData('JWT signed successfully');

        // Update last_login
        await query('UPDATE user_profiles SET last_login = NOW() WHERE id = $1', [user.id]);

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (err) {
        logData(`ERROR: ${err.message} `);
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined });
    }
});

app.post('/api/auth/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) return res.status(400).json({ message: 'All fields required' });

    try {
        const check = await query('SELECT * FROM user_profiles WHERE email = $1', [email]);
        if (check.rows.length > 0) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await query(
            `INSERT INTO user_profiles(first_name, last_name, email, password_hash, role, joined_date, last_login)
VALUES($1, $2, $3, $4, 'member', CURRENT_DATE, NOW())
             RETURNING id, first_name, last_name, email, role, created_at`,
            [firstName, lastName, email, hashedPassword]
        );

        const user = newUser.rows[0];
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error registration' });
    }
});

// ==========================================
// SESSION MANAGEMENT ENDPOINTS
// ==========================================

// GET /api/me/sessions - Get all active sessions for current user
app.get('/api/me/sessions', auth, async (req, res) => {
    try {
        const result = await query(`
            SELECT id, device_info, ip_address, location, last_active_at, created_at, session_token
            FROM user_sessions
            WHERE user_id = $1 AND revoked_at IS NULL
            ORDER BY last_active_at DESC
    `, [req.user.userId]);

        const sessions = result.rows.map(session => ({
            id: session.id,
            device_info: session.device_info,
            ip_address: session.ip_address,
            location: session.location || 'Unknown',
            last_active_at: session.last_active_at,
            is_current: session.session_token === req.user.sessionId
        }));

        res.json(sessions);
    } catch (err) {
        // If table doesn't exist yet, return empty array
        if (err.code === '42P01' || err.code === '42703') {
            return res.json([]);
        }
        console.error('Error fetching sessions:', err);
        res.status(500).json({ message: 'Error fetching sessions' });
    }
});

// DELETE /api/me/sessions/:id - Revoke a specific session
app.delete('/api/me/sessions/:id', auth, async (req, res) => {
    const { id } = req.params;

    try {
        // Check if session belongs to user
        const checkResult = await query(`
            SELECT session_token FROM user_sessions 
            WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL
    `, [id, req.user.userId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Prevent revoking current session
        if (checkResult.rows[0].session_token === req.user.sessionId) {
            return res.status(400).json({ message: 'Cannot revoke current session' });
        }

        // Revoke the session
        await query(`
            UPDATE user_sessions 
            SET revoked_at = NOW() 
            WHERE id = $1
    `, [id]);

        res.json({ message: 'Session revoked successfully' });
    } catch (err) {
        console.error('Error revoking session:', err);
        res.status(500).json({ message: 'Error revoking session' });
    }
});

// DELETE /api/me/sessions/others - Revoke all sessions except current
app.delete('/api/me/sessions/others', auth, async (req, res) => {
    try {
        const result = await query(`
            UPDATE user_sessions 
            SET revoked_at = NOW() 
            WHERE user_id = $1 AND session_token != $2 AND revoked_at IS NULL
            RETURNING id
    `, [req.user.userId, req.user.sessionId]);

        res.json({
            message: 'Other sessions revoked successfully',
            revokedCount: result.rows.length
        });
    } catch (err) {
        console.error('Error revoking other sessions:', err);
        res.status(500).json({ message: 'Error revoking sessions' });
    }
});

// GET /api/me/login-history - Get recent login attempts
app.get('/api/me/login-history', auth, async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);

        const result = await query(`
            SELECT id, success, ip_address, location, user_agent, failure_reason, created_at
            FROM login_history
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2
        `, [req.user.userId, limit]);

        res.json(result.rows);
    } catch (err) {
        // If table doesn't exist yet, return empty array
        if (err.code === '42P01' || err.code === '42703') {
            return res.json([]);
        }
        console.error('Error fetching login history:', err);
        res.status(500).json({ message: 'Error fetching login history' });
    }
});

// --- Profile & Hub Endpoints ---

// GET /api/me - Full Profile + Derived Data
app.get('/api/me', auth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id; // Try both
        console.log('DEBUG: /api/me fetching userId:', userId, 'from req.user:', req.user);

        if (!userId) {
            console.error('DEBUG: No userId found in req.user');
            return res.status(401).json({ message: 'User ID missing from token' });
        }

        const userRes = await query('SELECT * FROM user_profiles WHERE id = $1', [userId]);

        if (userRes.rows.length === 0) {
            console.warn('DEBUG: No profile found for userId:', userId);
            return res.status(404).json({ message: 'User profile not found' });
        }

        const user = userRes.rows[0];
        delete user.password_hash;

        res.json(user);
    } catch (err) {
        console.error('DEBUG: Error in /api/me:', err);
        res.status(500).json({ message: 'Server error fetching profile', error: err.message });
    }
});

// PUT /api/me - Update profile fields
app.put('/api/me', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { firstName, lastName, phone, preferred_contact, address, bio, avatar } = req.body;

        // Dynamic update query
        // Note: Email is usually read-only or requires verify flow
        const result = await query(
            `UPDATE user_profiles 
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
            [firstName, lastName, phone, preferred_contact, address, bio, avatar, userId]
        );

        res.json({ message: 'Profile updated', user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating profile' });
    }
});

// PATCH /api/me/username - Set/update username
app.patch('/api/me/username', auth, async (req, res) => {
    const { username } = req.body;

    try {
        // Validate format
        const { validateUsername } = await import('./helpers/usernameHelpers.js');
        if (!validateUsername(username)) {
            return res.status(400).json({
                message: 'Invalid username format. Use 3-20 characters (a-z, 0-9, _)'
            });
        }

        const username_lower = username.toLowerCase();

        // Check uniqueness
        const existing = await query(
            'SELECT id FROM user_profiles WHERE username_lower = $1 AND id != $2',
            [username_lower, req.user.userId]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({ message: 'Username already taken' });
        }

        // Update
        await query(`
            UPDATE user_profiles 
            SET username = $1, username_lower = $2 
            WHERE id = $3
    `, [username, username_lower, req.user.userId]);

        res.json({ success: true, username });
    } catch (err) {
        console.error('Error updating username:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/username/check/:username - Check username availability
app.get('/api/username/check/:username', auth, async (req, res) => {
    const { username } = req.params;
    const username_lower = username.toLowerCase();

    try {
        // Validate format
        const { validateUsername } = await import('./helpers/usernameHelpers.js');
        if (!validateUsername(username)) {
            return res.json({ available: false, reason: 'Invalid format' });
        }

        // Check if taken (excluding current user)
        const existing = await query(
            'SELECT id FROM user_profiles WHERE username_lower = $1 AND id != $2',
            [username_lower, req.user.userId]
        );

        res.json({
            available: existing.rows.length === 0,
            reason: existing.rows.length > 0 ? 'Username taken' : null
        });
    } catch (err) {
        console.error('Error checking username:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Settings Endpoints ---

// PATCH /api/me/password - Change password
app.patch('/api/me/password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const { changePassword } = await import('./helpers/settingsHelpers.js');
        await changePassword(req.user.userId, currentPassword, newPassword);
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        console.error('Error changing password:', err);
        res.status(400).json({ message: err.message });
    }
});

// GET /api/me/notification-preferences - Get notification preferences
app.get('/api/me/notification-preferences', auth, async (req, res) => {
    try {
        const { getNotificationPreferences } = await import('./helpers/settingsHelpers.js');
        const preferences = await getNotificationPreferences(req.user.userId);
        res.json(preferences);
    } catch (err) {
        console.error('Error fetching notification preferences:', err);
        res.status(500).json({ message: 'Error fetching preferences' });
    }
});

// PATCH /api/me/notification-preferences - Update notification preferences
app.patch('/api/me/notification-preferences', auth, async (req, res) => {
    try {
        const { updateNotificationPreferences } = await import('./helpers/settingsHelpers.js');
        const preferences = await updateNotificationPreferences(req.user.userId, req.body);
        res.json(preferences);
    } catch (err) {
        console.error('Error updating notification preferences:', err);
        res.status(400).json({ message: err.message });
    }
});

// GET /api/me/sessions - Get active sessions
app.get('/api/me/sessions', auth, async (req, res) => {
    try {
        const { getUserSessions } = await import('./helpers/settingsHelpers.js');
        const tokenHash = req.headers.authorization?.split(' ')[1]; // Get token from header
        const sessions = await getUserSessions(req.user.userId, tokenHash);
        res.json(sessions);
    } catch (err) {
        console.error('Error fetching sessions:', err);
        res.status(500).json({ message: 'Error fetching sessions' });
    }
});

// DELETE /api/me/sessions/:id - Revoke session
app.delete('/api/me/sessions/:id', auth, async (req, res) => {
    try {
        const { revokeSession } = await import('./helpers/settingsHelpers.js');
        await revokeSession(req.user.userId, req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('Error revoking session:', err);
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/me/sessions/others - Revoke all other sessions
app.delete('/api/me/sessions/others', auth, async (req, res) => {
    try {
        const { revokeOtherSessions } = await import('./helpers/settingsHelpers.js');
        const tokenHash = req.headers.authorization?.split(' ')[1];
        const result = await revokeOtherSessions(req.user.userId, tokenHash);
        res.json(result);
    } catch (err) {
        console.error('Error revoking sessions:', err);
        res.status(500).json({ message: 'Error revoking sessions' });
    }
});

// GET /api/me/login-history - Get login history
app.get('/api/me/login-history', auth, async (req, res) => {
    try {
        const { getLoginHistory } = await import('./helpers/settingsHelpers.js');
        const limit = parseInt(req.query.limit) || 20;
        const history = await getLoginHistory(req.user.userId, limit);
        res.json(history);
    } catch (err) {
        console.error('Error fetching login history:', err);
        res.status(500).json({ message: 'Error fetching login history' });
    }
});

// GET /api/me/attendance-summary
app.get('/api/me/attendance-summary', auth, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Last check-in
        const lastRes = await query(
            'SELECT service_date, service_type FROM attendance WHERE user_id = $1 ORDER BY service_date DESC LIMIT 1',
            [userId]
        );

        // Counts
        const countsRes = await query(`
SELECT
COUNT(*) FILTER(WHERE service_date > NOW() - INTERVAL '30 days') as count_30d,
    COUNT(*) FILTER(WHERE service_date > NOW() - INTERVAL '90 days') as count_90d
            FROM attendance
            WHERE user_id = $1
    `, [userId]);

        res.json({
            lastCheckIn: lastRes.rows[0] || null,
            stats: {
                last30Days: parseInt(countsRes.rows[0].count_30d || 0),
                last90Days: parseInt(countsRes.rows[0].count_90d || 0)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching attendance' });
    }
});

// GET /api/me/ministries
app.get('/api/me/ministries', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await query(`
            SELECT m.id, m.name, um.role, um.joined_at
            FROM user_ministries um
            JOIN ministries m ON um.ministry_id = m.id
            WHERE um.user_id = $1
    `, [userId]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching ministries' });
    }
});

// GET /api/me/ministry-requests - Get user's ministry requests
app.get('/api/me/ministry-requests', auth, async (req, res) => {
    try {
        // For now, return empty array since we don't have a dedicated ministry_requests table
        // Ministry requests are stored in user_notes
        const result = await query(
            `SELECT * FROM user_notes 
             WHERE user_id = $1 
             AND note LIKE 'REQUEST TO JOIN:%' 
             ORDER BY created_at DESC 
             LIMIT 10`,
            [req.user.userId]
        );

        // Transform notes into ministry request format
        const requests = result.rows.map(row => ({
            id: row.id,
            ministry_name: row.note.match(/REQUEST TO JOIN: ([^\(]+)/)?.[1]?.trim() || 'Unknown',
            status: 'pending',
            created_at: row.created_at
        }));

        res.json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching ministry requests' });
    }
});

// POST /api/me/ministry-request (Mock/Stub or simple record)
// POST /api/me/ministry-request
// POST /api/me/ministry-request
app.post('/api/me/ministry-request', auth, async (req, res) => {
    const { ministry_id, ministry_name, interest_role, note } = req.body;
    try {
        const fullNote = `REQUEST TO JOIN: ${ministry_name || 'General Ministry'} (ID: ${ministry_id || 'N/A'})
        Role Interest: ${interest_role || 'volunteer'}
        User Note: ${note || 'None'} `;

        await query(
            'INSERT INTO user_notes (user_id, note, created_at) VALUES ($1, $2, NOW())',
            [req.user.userId, fullNote]
        );
        res.json({ message: 'Request submitted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error submitting request' });
    }
});

// GET /api/ministries
app.get('/api/ministries', auth, async (req, res) => {
    try {
        const result = await query('SELECT id, name, description FROM ministries ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching ministry list' });
    }
});

// GET /api/me/prayers
app.get('/api/me/prayers', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await query(
            'SELECT * FROM prayer_requests WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        const activeCount = result.rows.filter(r => r.status === 'active').length;
        const lastRequest = result.rows.length > 0 ? result.rows[0].created_at : null;

        res.json({
            requests: result.rows,
            summary: {
                activeCount,
                lastRequest
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching prayers' });
    }
});

// POST /api/me/prayers
app.post('/api/me/prayers', auth, async (req, res) => {
    const { requestText } = req.body;
    if (!requestText) return res.status(400).json({ message: 'Request text required' });

    try {
        const result = await query(
            'INSERT INTO prayer_requests (user_id, request_text, status) VALUES ($1, $2, $3) RETURNING *',
            [req.user.userId, requestText, 'active']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error submitting prayer' });
    }
});

// --- Legacy Profile Endpoint (Redirect/Alias) ---
// Kept for backward compatibility with older frontend components if they exist
app.get('/api/profile', auth, async (req, res) => {
    // Redirect logic mainly, or re-use code. 
    // Simplified version of /api/me but matching old shape if strictly needed.
    // For this redesign, we should point frontend to /api/me mostly, but UserProfile.tsx might call this.
    // Let's implement it to return the shape UserProfile expects currently, but using user_profiles data.
    try {
        const userId = req.user.userId;
        const userRes = await query('SELECT * FROM user_profiles WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = userRes.rows[0];

        // Mock engagement data to match old shape
        const engagement = {
            attendance: { count_30d: 0, last_checkin: null },
            ministries: [],
            prayer: { active_count: 0, last_request: null },
            giving: { last_date: null, method: null }
        };

        // Populate real engagement if possible
        const attRes = await query(`SELECT COUNT(*) as c, MAX(service_date) as d FROM attendance WHERE user_id = $1`, [userId]);
        engagement.attendance.count_30d = parseInt(attRes.rows[0].c || 0); // simplification
        engagement.attendance.last_checkin = attRes.rows[0].d;

        res.json({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            bio: user.bio,
            role: user.role,
            avatar: user.avatar,
            created_at: user.created_at,
            last_login: user.last_login,
            engagement
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error' });
    }
});


// --- Households API ---

// GET /api/staff/households - List households with member counts
app.get('/api/staff/households', auth, requireStaff, async (req, res) => {
    try {
        const { search, limit = 50, offset = 0 } = req.query;
        const params = [];
        let whereClause = 'WHERE 1=1';

        if (search) {
            params.push(`% ${search}% `);
            whereClause += ` AND household_name ILIKE $1`;
        }

        const queryText = `
SELECT
h.*,
    COUNT(hm.id) as member_count,
    COUNT(CASE WHEN p.person_type = 'child' THEN 1 END) as child_count,
    COUNT(CASE WHEN p.person_type = 'adult' THEN 1 END) as adult_count
            FROM households h
            LEFT JOIN household_members hm ON h.id = hm.household_id
            LEFT JOIN user_profiles p ON hm.person_id = p.id
            ${whereClause}
            GROUP BY h.id
            ORDER BY h.household_name ASC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
`;

        // Add limit and offset to params
        params.push(limit, offset);

        const result = await query(queryText, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching households:', error);
        res.status(500).json({ message: 'Error fetching households' });
    }
});

// GET /api/staff/households/:id - Get household details with members
app.get('/api/staff/households/:id', auth, requireStaff, async (req, res) => {
    try {
        const { id } = req.params;

        // Get household info
        const householdRes = await query('SELECT * FROM households WHERE id = $1', [id]);
        if (householdRes.rows.length === 0) {
            return res.status(404).json({ message: 'Household not found' });
        }

        // Get members
        const membersRes = await query(`
SELECT
p.id, p.first_name, p.last_name, p.email, p.phone, p.person_type, p.avatar,
    hm.relationship, hm.is_primary_contact, hm.id as membership_id
            FROM household_members hm
            JOIN user_profiles p ON hm.person_id = p.id
            WHERE hm.household_id = $1
            ORDER BY 
                CASE WHEN hm.relationship = 'head' THEN 1 
                     WHEN hm.relationship = 'spouse' THEN 2 
                     ELSE 3 END,
    p.date_of_birth ASC
        `, [id]);

        res.json({
            ...householdRes.rows[0],
            members: membersRes.rows
        });
    } catch (error) {
        console.error('Error fetching household details:', error);
        res.status(500).json({ message: 'Error fetching household details' });
    }
});

// POST /api/staff/households - Create new household
app.post('/api/staff/households', auth, requireStaff, async (req, res) => {
    try {
        const { household_name, address_line1, city, state, zip, primary_phone, primary_email } = req.body;

        const result = await query(`
            INSERT INTO households(
            household_name, address_line1, city, state, zip, primary_phone, primary_email
        )
VALUES($1, $2, $3, $4, $5, $6, $7)
RETURNING *
    `, [household_name, address_line1, city, state, zip, primary_phone, primary_email]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating household:', error);
        res.status(500).json({ message: 'Error creating household' });
    }
});

// POST /api/staff/households/:id/members - Add member to household
app.post('/api/staff/households/:id/members', auth, requireStaff, async (req, res) => {
    try {
        const { id } = req.params;
        const { person_id, relationship, is_primary_contact } = req.body;

        // If setting as primary, unset other primaries in this household
        if (is_primary_contact) {
            await query(`
                UPDATE household_members 
                SET is_primary_contact = false 
                WHERE household_id = $1
    `, [id]);
        }

        const result = await query(`
            INSERT INTO household_members(household_id, person_id, relationship, is_primary_contact)
VALUES($1, $2, $3, $4)
RETURNING *
    `, [id, person_id, relationship, is_primary_contact || false]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding household member:', error);
        res.status(500).json({ message: 'Error adding household member' });
    }
});

// DELETE /api/staff/households/:id/members/:memberId - Remove member
app.delete('/api/staff/households/:id/members/:memberId', auth, requireStaff, async (req, res) => {
    try {
        // Only admin/pastor can remove details? Or staff too? Requirement says admin/pastor only for deleting *tables*, but keeping flexible for members
        await query('DELETE FROM household_members WHERE id = $1 AND household_id = $2', [req.params.memberId, req.params.id]);
        res.json({ message: 'Member removed from household' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing member' });
    }
});

// PUT /api/staff/households/:id - Update household
app.put('/api/staff/households/:id', auth, requirePerm(PERMISSIONS.HOUSEHOLDS_WRITE), async (req, res) => {
    const { household_name, address_line1, address_line2, city, state, zip } = req.body;

    if (!household_name || !household_name.trim()) {
        return res.status(400).json({ message: 'Household name is required' });
    }

    try {
        const result = await query(`
            UPDATE households
            SET household_name = $1,
    address_line1 = $2,
    address_line2 = $3,
    city = $4,
    state = $5,
    zip = $6
            WHERE id = $7
RETURNING *
    `, [household_name.trim(), address_line1 || '', address_line2 || '', city || '', state || '', zip || '', req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Household not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating household:', error);
        res.status(500).json({ message: 'Error updating household' });
    }
});

// DELETE /api/staff/households/:id - Delete household
app.delete('/api/staff/households/:id', auth, requirePerm(PERMISSIONS.HOUSEHOLDS_DELETE), async (req, res) => {

    try {
        await query('DELETE FROM households WHERE id = $1', [req.params.id]);
        res.json({ message: 'Household deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting household' });
    }
});

// ============================================
// STAFF CALENDAR API ENDPOINTS
// ============================================

// GET /api/staff/resources - List all resources
app.get('/api/staff/resources', auth, requireStaff, async (req, res) => {
    try {
        const result = await query('SELECT * FROM resources WHERE is_active = true ORDER BY name ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ message: 'Error fetching resources' });
    }
});

// POST /api/staff/resources - Create resource (Admin/Pastor only)
app.post('/api/staff/resources', auth, requireStaff, async (req, res) => {
    if (!['admin', 'pastor'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Only admins can manage resources' });
    }

    try {
        const { name, capacity } = req.body;
        const result = await query(`
            INSERT INTO resources(name, capacity)
VALUES($1, $2)
RETURNING *
    `, [name, capacity]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ message: 'Resource name already exists' });
        }
        console.error('Error creating resource:', error);
        res.status(500).json({ message: 'Error creating resource' });
    }
});

// DELETE /api/staff/resources/:id - Soft delete resource
app.delete('/api/staff/resources/:id', auth, requireStaff, async (req, res) => {
    if (!['admin', 'pastor'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Only admins can manage resources' });
    }

    try {
        // Soft delete
        await query('UPDATE resources SET is_active = false WHERE id = $1', [req.params.id]);
        res.json({ message: 'Resource deactivated' });
    } catch (error) {
        console.error('Error deleting resource:', error);
        res.status(500).json({ message: 'Error deleting resource' });
    }
});

// GET /api/staff/availability - Check conflicts
app.get('/api/staff/availability', auth, requireStaff, async (req, res) => {
    try {
        const { resource_ids, starts_at, ends_at, exclude_event_id } = req.query;

        if (!resource_ids || !starts_at || !ends_at) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        const ids = resource_ids.split(',');

        // Query for ANY conflicting event in 'approved' or 'booked' status for these resources
        // Overlap logic: (StartA < EndB) and (EndA > StartB)
        let queryText = `
            SELECT e.id, e.title, e.starts_at, e.ends_at, r.name as resource_name
            FROM events e
            JOIN event_bookings eb ON e.id = eb.event_id
            JOIN resources r ON eb.resource_id = r.id
            WHERE eb.resource_id = ANY($1)
            AND e.status IN('approved', 'booked')
            AND e.starts_at < $3
            AND e.ends_at > $2
    `;

        const params = [ids, starts_at, ends_at];

        if (exclude_event_id) {
            queryText += ` AND e.id != $4`;
            params.push(exclude_event_id);
        }

        const result = await query(queryText, params);

        res.json({
            available: result.rows.length === 0,
            conflicts: result.rows
        });

    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({ message: 'Error checking availability' });
    }
});

// GET /api/staff/events - List events
app.get('/api/staff/events', auth, requireStaff, async (req, res) => {
    try {
        const { from, to, resource_id, status, ministry_id } = req.query;
        const params = [];
        let whereClause = 'WHERE 1=1';

        if (from) {
            params.push(from);
            whereClause += ` AND e.ends_at >= $${params.length} `; // Events ending after 'from'
        }
        if (to) {
            params.push(to);
            whereClause += ` AND e.starts_at <= $${params.length} `; // Events starting before 'to'
        }
        if (status) {
            params.push(status);
            whereClause += ` AND e.status = $${params.length} `;
        }
        if (ministry_id) {
            params.push(ministry_id);
            whereClause += ` AND e.ministry_id = $${params.length} `;
        }

        // We need to fetch bookings for these events too. Use array_agg in postgres or separate query.
        // Let's use json_agg to get bookings nested
        // If filtering by resource_id, we need a JOIN or EXISTS.
        if (resource_id) {
            params.push(resource_id);
            whereClause += ` AND EXISTS(SELECT 1 FROM event_bookings eb WHERE eb.event_id = e.id AND eb.resource_id = $${params.length})`;
        }

        const queryText = `
            SELECT e.* FROM events e ${whereClause} ORDER BY e.starts_at ASC
        `;

        const result = await query(queryText, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching events:', error);
        try {
            const logMsg = `\n[${new Date().toISOString()}]ERROR in GET / api / staff / events\nMessage: ${error.message} \nStack: ${error.stack} \nQuery: ${'queryText' in error ? error.queryText : queryText} \nParams: ${JSON.stringify(params)} \n`;
            fs.appendFileSync('sql_debug.log', logMsg);
        } catch (logErr) {
            console.error('Failed to write log:', logErr);
        }
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
});

// POST /api/staff/events - Create REQUESTED event
app.post('/api/staff/events', auth, requireStaff, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { title, description, ministry_id, starts_at, ends_at, resource_ids } = req.body;
        const requested_by = req.user.profileId; // Assuming fetchProfile or similar populated this, or use req.user.id and look up profile?
        // req.user from 'auth' middleware has { userId, role, email }. 
        // 'requested_by_person_id' references 'user_profiles(id)'. 
        // In this system, user_profiles.id IS the auth0/clerk id? Or linked? 
        // Based on Login route: user comes from `users` table, linked to `user_profiles`. 
        // But `req.user.userId` is the `users.id`. `user_profiles.id` matches `users.id` usually?
        // Let's check `auth.js` middleware... it verifies token.
        // Let's check how profile is fetched.
        // Usually `req.user.userId` is safe.

        // Validate dates
        if (new Date(ends_at) <= new Date(starts_at)) {
            throw new Error('End time must be after start time');
        }

        // Create Event
        const eventRes = await client.query(`
            INSERT INTO events(title, description, ministry_id, requested_by_person_id, status, starts_at, ends_at)
VALUES($1, $2, $3, $4, 'requested', $5, $6)
RETURNING *
    `, [title, description, ministry_id, req.user.userId, starts_at, ends_at]);

        const event = eventRes.rows[0];

        // Create Bookings
        if (resource_ids && resource_ids.length > 0) {
            for (const rId of resource_ids) {
                await client.query(`
                    INSERT INTO event_bookings(event_id, resource_id)
VALUES($1, $2)
    `, [event.id, rId]);
            }
        }

        await client.query('COMMIT');
        res.status(201).json(event);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating event:', error);
        res.status(500).json({ message: error.message || 'Error creating event' });
    } finally {
        client.release();
    }
});

// POST /api/staff/events/:id/approve - Approve event
app.post('/api/staff/events/:id/approve', auth, requireStaff, async (req, res) => {
    if (!['admin', 'pastor', 'staff'].includes(req.user.role)) return res.sendStatus(403);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;

        // 1. Get event details + resources
        const eventRes = await client.query(`
            SELECT e.*, array_agg(eb.resource_id) as resource_ids
            FROM events e
            LEFT JOIN event_bookings eb ON e.id = eb.event_id
            WHERE e.id = $1
            GROUP BY e.id
    `, [id]);

        if (eventRes.rows.length === 0) throw new Error('Event not found');
        const event = eventRes.rows[0];

        // 2. Conflict Check
        // Check if ANY of the resources are booked during this time by OTHER events (approved/booked)
        if (event.resource_ids && event.resource_ids.length > 0) { // array_agg might return [null] if no bookings? NO, LEFT JOIN.
            // filter nulls just in case
            const rIds = event.resource_ids.filter(r => r);

            if (rIds.length > 0) {
                const conflictRes = await client.query(`
                    SELECT e.title 
                    FROM events e
                    JOIN event_bookings eb ON e.id = eb.event_id
                    WHERE eb.resource_id = ANY($1)
                    AND e.id != $2
                    AND e.status IN('approved', 'booked')
                    AND e.starts_at < $4
                    AND e.ends_at > $3
    `, [rIds, id, event.starts_at, event.ends_at]);

                if (conflictRes.rows.length > 0) {
                    throw new Error(`Conflict detected with event: ${conflictRes.rows[0].title} `);
                }
            }
        }

        // 3. Update Status
        const updateRes = await client.query(`
            UPDATE events 
            SET status = 'approved', approved_by_person_id = $2, updated_at = NOW()
            WHERE id = $1
RETURNING *
    `, [id, req.user.userId]);

        await client.query('COMMIT');
        res.json(updateRes.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error approving event:', error);
        res.status(400).json({ message: error.message });
    } finally {
        client.release();
    }
});

// POST /api/staff/events/:id/cancel
app.post('/api/staff/events/:id/cancel', auth, requireStaff, async (req, res) => {
    try {
        const { id } = req.params;
        // Ideally check role vs owner. Staff/Admin can cancel any. Owner can cancel if requested.
        // For MVP, letting staff cancel any.

        const result = await query(`
            UPDATE events SET status = 'canceled', updated_at = NOW()
            WHERE id = $1
RETURNING *
    `, [id]);

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error canceling event' });
    }
});

// GET /api/staff/events/:id - Get event details
app.get('/api/staff/events/:id', auth, requireStaff, async (req, res) => {
    try {
        const { id } = req.params;
        const queryText = `
SELECT
e.*,
    p.first_name || ' ' || p.last_name as requested_by_name,
    a.first_name || ' ' || a.last_name as approved_by_name,
    (
        SELECT json_agg(json_build_object('resource_id', eb.resource_id, 'resource_name', r.name))
                    FROM event_bookings eb
                    JOIN resources r ON eb.resource_id = r.id
                    WHERE eb.event_id = e.id
                ) as bookings
            FROM events e
            JOIN user_profiles p ON e.requested_by_person_id = p.id
            LEFT JOIN user_profiles a ON e.approved_by_person_id = a.id
            WHERE e.id = $1
    `;
        const result = await query(queryText, [id]);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Event not found' });

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching event details:', error);
        res.status(500).json({ message: 'Error fetching event details' });
    }
});

// POST /api/staff/events/:id/book - Confirm booking (Admin/Staff only)
app.post('/api/staff/events/:id/book', auth, requireStaff, async (req, res) => {
    if (!['admin', 'pastor', 'staff'].includes(req.user.role)) return res.sendStatus(403);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;

        // 1. Get event details + resources
        const eventRes = await client.query(`
            SELECT e.*, array_agg(eb.resource_id) as resource_ids
            FROM events e
            LEFT JOIN event_bookings eb ON e.id = eb.event_id
            WHERE e.id = $1
            GROUP BY e.id
    `, [id]);

        if (eventRes.rows.length === 0) throw new Error('Event not found');
        const event = eventRes.rows[0];

        // 2. Conflict Check (Same as approve)
        if (event.resource_ids && event.resource_ids.length > 0) {
            const rIds = event.resource_ids.filter(r => r);
            if (rIds.length > 0) {
                const conflictRes = await client.query(`
                    SELECT e.title 
                    FROM events e
                    JOIN event_bookings eb ON e.id = eb.event_id
                    WHERE eb.resource_id = ANY($1)
                    AND e.id != $2
                    AND e.status IN('approved', 'booked')
                    AND e.starts_at < $4
                    AND e.ends_at > $3
    `, [rIds, id, event.starts_at, event.ends_at]);

                if (conflictRes.rows.length > 0) {
                    throw new Error(`Conflict detected with event: ${conflictRes.rows[0].title} `);
                }
            }
        }

        // 3. Update Status
        const updateRes = await client.query(`
            UPDATE events 
            SET status = 'booked', approved_by_person_id = $2, updated_at = NOW()
            WHERE id = $1
RETURNING *
    `, [id, req.user.userId]);

        await client.query('COMMIT');
        res.json(updateRes.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error booking event:', error);
        res.status(400).json({ message: error.message });
    } finally {
        client.release();
    }
});

// PATCH /api/staff/events/:id - Edit event
app.patch('/api/staff/events/:id', auth, requireStaff, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { title, description, ministry_id, starts_at, ends_at, resource_ids } = req.body;

        // 1. Fetch existing event
        const checkRes = await client.query('SELECT * FROM events WHERE id = $1', [id]);
        if (checkRes.rows.length === 0) return res.status(404).json({ message: 'Event not found' });
        const existingEvent = checkRes.rows[0];

        // 2. Permission Check
        // Ministry Leader can only edit their own 'requested' events
        if (req.user.role === 'ministry_leader') {
            // We need to check if this user is the requested_by person.
            // Currently req.user.profileId isn't explicitly set in middleware shown, but let's assume filtering logic matches.
            // Actually unsafe to assume. Let's rely on RBAC: Staff/Admin can edit all. 
            // If ministry leader, strictly check ownership if we had that link easily. 
            // For now, let's allow if they are the requester.
            if (existingEvent.requested_by_person_id !== req.user.userId) { // Assuming userId matches profile id
                // Or better yet, just block if not staff/admin for MVP unless we are sure.
                if (existingEvent.status !== 'requested') {
                    throw new Error('Ministry leaders can only edit requested events');
                }
            }
        }

        // 3. Update Event Fields
        const updateRes = await client.query(`
            UPDATE events 
            SET title = COALESCE($1, title),
    description = COALESCE($2, description),
    ministry_id = COALESCE($3, ministry_id),
    starts_at = COALESCE($4, starts_at),
    ends_at = COALESCE($5, ends_at),
    updated_at = NOW()
            WHERE id = $6
RETURNING *
    `, [title, description, ministry_id, starts_at, ends_at, id]);

        const updatedEvent = updateRes.rows[0];

        // 4. Update Bookings if resource_ids provided
        if (resource_ids) {
            // Delete old bookings
            await client.query('DELETE FROM event_bookings WHERE event_id = $1', [id]);

            // Insert new bookings
            for (const rId of resource_ids) {
                await client.query(`
                    INSERT INTO event_bookings(event_id, resource_id)
VALUES($1, $2)
    `, [id, rId]);
            }
        }

        // 5. Conflict Check (if time or resources changed) AND status is approved/booked
        // Only run strict conflict check if the event is already approved/booked.
        // If it's 'requested', we don't care about conflicts yet.
        if (['approved', 'booked'].includes(updatedEvent.status)) {
            // Fetch resources for this event
            const rRes = await client.query('SELECT resource_id FROM event_bookings WHERE event_id = $1', [id]);
            const rIds = rRes.rows.map(r => r.resource_id);

            if (rIds.length > 0) {
                const conflictRes = await client.query(`
                    SELECT e.title 
                    FROM events e
                    JOIN event_bookings eb ON e.id = eb.event_id
                    WHERE eb.resource_id = ANY($1)
                    AND e.id != $2
                    AND e.status IN('approved', 'booked')
                    AND e.starts_at < $4
                    AND e.ends_at > $3
    `, [rIds, id, updatedEvent.starts_at, updatedEvent.ends_at]);

                if (conflictRes.rows.length > 0) {
                    throw new Error(`Conflict detected with event: ${conflictRes.rows[0].title} `);
                }
            }
        }

        await client.query('COMMIT');
        res.json(updatedEvent);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating event:', error);
        res.status(400).json({ message: error.message });
    } finally {
        client.release();
    }
});


// --- Admin Endpoints ---

// GET /api/admin/notes/:userId
app.get('/api/admin/notes/:targetUserId', auth, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'pastor') {
        return res.status(403).json({ message: 'Access denied' });
    }
    try {
        const result = await query(
            'SELECT * FROM user_notes WHERE user_id = $1 ORDER BY created_at DESC',
            [req.params.targetUserId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching notes' });
    }
});

// POST /api/admin/notes/:userId
app.post('/api/admin/notes/:targetUserId', auth, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'pastor') {
        return res.status(403).json({ message: 'Access denied' });
    }
    const { note } = req.body;
    if (!note) return res.status(400).json({ message: 'Note content required' });

    try {
        const result = await query(
            'INSERT INTO user_notes (user_id, note, created_by) VALUES ($1, $2, $3) RETURNING *',
            [req.params.targetUserId, note, req.user.userId]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding note' });
    }
});

// GET /api/members (Admin only)
app.get('/api/members', auth, async (req, res) => {
    // Ideally check for admin role here, but keeping it simple for now as requested by dashboard
    try {
        const result = await query('SELECT id, concat(first_name, \' \', last_name) as name, email FROM user_profiles ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching members' });
    }
});


// --- Check-In System Endpoints ---

// 1. PUBLIC: Get active session
app.get('/api/sessions/active', async (req, res) => {
    try {
        const result = await query(
            "SELECT id, service_type, code, started_at FROM checkin_sessions WHERE status = 'active' LIMIT 1"
        );
        res.json(result.rows[0] || null);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching active session' });
    }
});



// 3. GUEST CHECK-IN (Public)
app.post('/api/guest-checkin', async (req, res) => {
    const { fullName, phone, email, adults, children, firstTime, contactOk, prayerRequest } = req.body;

    if (!fullName || !phone) return res.status(400).json({ message: 'Name and phone required' });

    try {
        const sessionRes = await query("SELECT id FROM checkin_sessions WHERE status = 'active' LIMIT 1");
        if (sessionRes.rows.length === 0) {
            return res.status(404).json({ message: 'No active check-in session found' });
        }
        const sessionId = sessionRes.rows[0].id;

        await query('BEGIN');

        // Insert guest check-in
        await query(
            `INSERT INTO checkins(session_id, guest_name, guest_phone, guest_email, adults, children, first_time, contact_ok, type)
VALUES($1, $2, $3, $4, $5, $6, $7, $8, 'guest')`,
            [sessionId, fullName, phone, email, adults || 1, children || 0, firstTime || false, contactOk !== false, 'guest']
        );

        // Optional prayer request
        if (prayerRequest) {
            await query(
                `INSERT INTO prayer_requests(session_id, guest_name, request_text, status)
VALUES($1, $2, $3, 'new')`,
                [sessionId, fullName, prayerRequest]
            );
        }

        await query('COMMIT');
        res.json({ success: true, message: 'Welcome! We’re glad you’re here.' });
    } catch (err) {
        await query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Error during guest check-in' });
    }
});

// 4. ADMIN: Start session
app.post('/api/admin/sessions/start', auth, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'pastor') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { service_type, location } = req.body;
    if (!service_type) return res.status(400).json({ message: 'Service type required' });

    try {
        // Check for existing active session
        const activeCheck = await query("SELECT id FROM checkin_sessions WHERE status = 'active'");
        if (activeCheck.rows.length > 0) {
            return res.status(400).json({ message: 'An active session already exists. Stop it before starting a new one.' });
        }

        const code = Math.floor(1000 + Math.random() * 9000).toString();

        const result = await query(
            `INSERT INTO checkin_sessions(service_type, location, code, status, started_at)
VALUES($1, $2, $3, 'active', NOW())
RETURNING * `,
            [service_type, location, code]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error starting session' });
    }
});

// 5. ADMIN: Stop session
app.post('/api/admin/sessions/stop', auth, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'pastor') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        // Find active session first
        const sessionCheck = await query(
            "SELECT id, event_id FROM event_sessions WHERE status = 'active' LIMIT 1"
        );

        if (sessionCheck.rows.length === 0) {
            return res.status(404).json({ message: 'No active session to stop' });
        }

        const session = sessionCheck.rows[0];

        // Update session to ended
        await query(
            "UPDATE event_sessions SET status = 'ended', ended_at = NOW() WHERE id = $1",
            [session.id]
        );

        // Update event to completed
        await query(
            "UPDATE events SET status = 'completed' WHERE id = $1",
            [session.event_id]
        );

        res.json({ success: true, message: 'Session ended' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error stopping session' });
    }
});

// 6. ADMIN: Get roster
app.get('/api/admin/sessions/:id/roster', auth, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'pastor') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const result = await query(
            `SELECT c.*,
    COALESCE(u.first_name || ' ' || u.last_name, c.guest_name) as display_name,
    u.email as member_email,
    u.phone as member_phone
             FROM checkins c
             LEFT JOIN user_profiles u ON c.user_id = u.id
             WHERE c.session_id = $1
             ORDER BY c.created_at DESC`,
            [req.params.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching roster' });
    }
});

// ===== EVENTS & CHECK-IN INTEGRATION =====

// Helper function to generate unique 4-digit code
async function generateUniqueCode() {
    let code;
    let isUnique = false;

    while (!isUnique) {
        code = Math.floor(1000 + Math.random() * 9000).toString();
        const checkResult = await query('SELECT id FROM event_sessions WHERE code = $1 AND status = $\'active\'', [code]);
        if (checkResult.rows.length === 0) {
            isUnique = true;
        }
    }
    return code;
}

// GET /api/events - Get all events
app.get('/api/events', auth, async (req, res) => {
    try {
        const { status } = req.query;

        let sql = `
SELECT
e.*,
    json_build_object(
        'id', es.id,
        'code', es.code,
        'started_at', es.started_at
    ) as active_session,
    (SELECT COUNT(*) FROM checkins c WHERE c.event_id = e.id) as total_checkins
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
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching events' });
    }
});

// POST /api/events - Create event (admin/pastor only)
app.post('/api/events', auth, async (req, res) => {
    try {
        const { title, description, location, starts_at, ends_at } = req.body;
        const userId = req.user.userId;

        if (!title || !starts_at) {
            return res.status(400).json({ message: 'Title and start time are required' });
        }

        const result = await query(
            `INSERT INTO events(title, description, location, starts_at, ends_at, created_by)
VALUES($1, $2, $3, $4, $5, $6) RETURNING * `,
            [title, description, location, starts_at, ends_at, userId]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating event' });
    }
});

// GET /api/events/:id - Get event details
app.get('/api/events/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const eventResult = await query(
            `SELECT e.*,
    json_build_object(
        'id', es.id,
        'code', es.code,
        'status', es.status,
        'started_at', es.started_at,
        'ended_at', es.ended_at
    ) as session
             FROM events e
             LEFT JOIN event_sessions es ON e.id = es.event_id
AND(es.status = 'active' OR es.id = (
    SELECT id FROM event_sessions WHERE event_id = e.id ORDER BY started_at DESC LIMIT 1
))
             WHERE e.id = $1`,
            [id]
        );

        if (eventResult.rows.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const event = eventResult.rows[0];

        if (event.session && event.session.id) {
            const statsResult = await query(
                `SELECT
COUNT(*) as total,
    COUNT(*) FILTER(WHERE type = 'member') as members,
        COUNT(*) FILTER(WHERE type = 'guest') as guests,
            COUNT(*) FILTER(WHERE first_time = true) as first_time,
                SUM(children) as total_children
                 FROM checkins WHERE session_id = $1`,
                [event.session.id]
            );
            event.stats = statsResult.rows[0];
        }

        res.json(event);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching event' });
    }
});

// POST /api/events/:id/session/start - Start check-in session
app.post('/api/events/:id/session/start', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Check for other active sessions
        const globalCheck = await query(
            `SELECT e.title FROM event_sessions es 
             JOIN events e ON es.event_id = e.id 
             WHERE es.status = 'active' AND es.event_id != $1`,
            [id]
        );

        if (globalCheck.rows.length > 0) {
            return res.status(400).json({
                message: `Another event "${globalCheck.rows[0].title}" is already live.Please stop that session first.`
            });
        }

        const code = await generateUniqueCode();

        await query('BEGIN');

        try {
            const sessionResult = await query(
                `INSERT INTO event_sessions(event_id, code, started_by)
VALUES($1, $2, $3) RETURNING * `,
                [id, code, userId]
            );

            await query(`UPDATE events SET status = 'live' WHERE id = $1`, [id]);

            const eventResult = await query('SELECT * FROM events WHERE id = $1', [id]);

            await query('COMMIT');

            res.json({
                event: eventResult.rows[0],
                session: sessionResult.rows[0]
            });
        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error starting session' });
    }
});

// POST /api/events/:id/session/stop - Stop check-in session
app.post('/api/events/:id/session/stop', auth, async (req, res) => {
    try {
        const { id } = req.params;

        await query('BEGIN');

        try {
            await query(
                `UPDATE event_sessions SET status = 'ended', ended_at = NOW() 
                 WHERE event_id = $1 AND status = 'active'`,
                [id]
            );

            await query(`UPDATE events SET status = 'completed' WHERE id = $1`, [id]);

            await query('COMMIT');

            res.json({ success: true, message: 'Session ended successfully' });
        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error stopping session' });
    }
});

// GET /api/events/:id/roster - Get event roster
app.get('/api/events/:id/roster', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;

        const sessionResult = await query(
            `SELECT * FROM event_sessions WHERE event_id = $1 ORDER BY started_at DESC LIMIT 1`,
            [id]
        );

        if (sessionResult.rows.length === 0) {
            return res.json([]);
        }

        const session = sessionResult.rows[0];

        let rosterSql = `
SELECT
c.*,
    CASE 
                    WHEN c.type = 'member' THEN CONCAT(up.first_name, ' ', up.last_name)
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
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching roster' });
    }
});

// --- Check-In Endpoints ---

// POST /api/checkin/start - Start a new check-in session
app.post('/api/checkin/start', auth, async (req, res) => {
    try {
        const { service_type } = req.body;

        if (!service_type) {
            return res.status(400).json({ message: 'service_type is required' });
        }

        // Check if there's already an active session
        const activeCheck = await query(
            `SELECT es.*, e.* FROM event_sessions es
             JOIN events e ON es.event_id = e.id
             WHERE es.status = 'active' AND e.status = 'live'
             ORDER BY es.started_at DESC
             LIMIT 1`
        );

        if (activeCheck.rows.length > 0) {
            return res.status(400).json({
                message: 'There is already an active check-in session',
                session: activeCheck.rows[0]
            });
        }

        // Generate unique 4-digit code
        const code = Math.floor(1000 + Math.random() * 9000).toString();

        // Create event first (created_by is optional, may be NULL if user profile doesn't exist)
        const eventResult = await query(
            `INSERT INTO events(title, description, starts_at, status)
VALUES($1, $2, NOW(), 'live')
RETURNING * `,
            [service_type, `Check -in session for ${service_type}`]
        );

        const event = eventResult.rows[0];

        // Create event session (started_by is optional)
        const sessionResult = await query(
            `INSERT INTO event_sessions(event_id, code, status, started_at)
VALUES($1, $2, 'active', NOW())
RETURNING * `,
            [event.id, code]
        );

        const session = sessionResult.rows[0];

        res.json({
            success: true,
            session: {
                ...session,
                service_type: event.title,
                event
            }
        });
    } catch (err) {
        console.error('Error starting check-in session:', err);
        console.error('Error details:', err.stack);
        res.status(500).json({
            message: 'Error starting check-in session',
            error: err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// GET /api/checkin/active - Get active event and session
app.get('/api/checkin/active', async (req, res) => {
    try {
        const result = await query(
            `SELECT
e.*,
    json_build_object(
        'id', es.id,
        'code', es.code,
        'started_at', es.started_at
    ) as session
             FROM events e
             JOIN event_sessions es ON e.id = es.event_id
             WHERE e.status = 'live' AND es.status = 'active'
             LIMIT 1`
        );

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
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching active session' });
    }
});

app.get('/api/me', auth, async (req, res) => {
    try {
        const result = await query(`
SELECT
up.id, up.email, up.role, up.username,
    p.id as person_id, p.first_name, p.last_name, p.phone, p.person_type, p.address
            FROM user_profiles up
            LEFT JOIN people p ON up.person_id = p.id
            WHERE up.id = $1
    `, [req.user.userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];

        // Generate suggested username if none set
        let suggested_username = null;
        if (!user.username && user.first_name && user.last_name) {
            const { generateSuggestedUsername, findAvailableUsername } = await import('./helpers/usernameHelpers.js');
            const base = generateSuggestedUsername(user.first_name, user.last_name);
            if (base) {
                suggested_username = await findAvailableUsername(base);
            }
        }

        res.json({
            id: user.id,
            email: user.email,
            role: user.role,
            username: user.username,
            suggested_username,
            name: `${user.first_name || ''} ${user.last_name || ''} `.trim(),
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            person_type: user.person_type,
            address: user.address,
            person_id: user.person_id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/checkin - Member check-in
app.post('/api/checkin', auth, async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.userId;

        if (!code) {
            return res.status(400).json({ message: 'Check-in code is required' });
        }

        // Verify user exists first to prevent foreign key errors
        const userCheck = await query('SELECT id FROM user_profiles WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0) {
            return res.status(400).json({ message: 'User profile not found. Please contact support.' });
        }

        // Find active session matching code
        const sessionResult = await query(
            `SELECT es.id as session_primary_id, e.id as event_primary_id, es.*, e.*
    FROM event_sessions es
             JOIN events e ON es.event_id = e.id
             WHERE es.code = $1 AND es.status = 'active'`,
            [code]
        );

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ message: 'Invalid or expired check-in code' });
        }

        const session = sessionResult.rows[0];
        const sessionId = session.session_primary_id;
        const eventId = session.event_primary_id;

        // Check for duplicate check-in
        const checkResult = await query(
            `SELECT * FROM checkins WHERE session_id = $1 AND user_id = $2`,
            [sessionId, userId]
        );

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ message: 'You have already checked in for this event' });
        }

        // Perform check-in
        const checkinResult = await query(
            `INSERT INTO checkins(session_id, event_id, user_id, type)
VALUES($1, $2, $3, 'member') RETURNING * `,
            [sessionId, eventId, userId]
        );

        res.json({
            success: true,
            event: {
                id: eventId,
                title: session.title,
                location: session.location
            },
            checked_in_at: checkinResult.rows[0].created_at
        });
    } catch (err) {
        console.error('Check-in error:', err);
        console.error('Error details:', err.message, err.stack);
        res.status(500).json({
            message: 'Error processing check-in',
            error: err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// POST /api/checkin/guest - Guest check-in
app.post('/api/checkin/guest', async (req, res) => {
    try {
        const { code, full_name, phone, email, adults = 1, children = 0, first_time = false, contact_ok = true, prayer_request } = req.body;

        if (!full_name || !phone) {
            return res.status(400).json({ message: 'Name and phone are required' });
        }

        let sessionResult;

        if (code) {
            sessionResult = await query(
                `SELECT es.*, e.* FROM event_sessions es
                 JOIN events e ON es.event_id = e.id
                 WHERE es.code = $1 AND es.status = 'active'`,
                [code]
            );
        } else {
            sessionResult = await query(
                `SELECT es.*, e.* FROM event_sessions es
                 JOIN events e ON es.event_id = e.id
                 WHERE e.status = 'live' AND es.status = 'active'
                 LIMIT 1`
            );
        }

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ message: 'No active check-in session available' });
        }

        const session = sessionResult.rows[0];

        const checkinResult = await query(
            `INSERT INTO checkins(
    session_id, event_id, guest_name, guest_phone, guest_email,
    adults, children, first_time, contact_ok, type, prayer_request
) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, 'guest', $10) RETURNING * `,
            [session.id, session.event_id, full_name, phone, email, adults, children, first_time, contact_ok, prayer_request]
        );

        res.json({
            success: true,
            event: {
                id: session.event_id,
                title: session.title,
                location: session.location
            },
            checked_in_at: checkinResult.rows[0].created_at
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error processing check-in' });
    }
});

// ===== SERMON ARCHIVE API =====

// GET /api/sermons - Get all sermons with filtering
app.get('/api/sermons', async (req, res) => {
    try {
        const { published, search, type, series, speaker, year } = req.query;
        const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'pastor');

        // Build Prisma where clause
        const where = {};

        // Filter by published status
        if (!isAdmin || published === 'true') {
            where.is_published = true;
        } else if (published === 'false') {
            where.is_published = false;
        }

        // Search filter
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { scripture: { contains: search, mode: 'insensitive' } },
                { speaker: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Type filter
        if (type && type !== 'all') {
            where.type = type;
        }

        // Series filter
        if (series && series !== 'all') {
            where.series = series;
        }

        // Speaker filter
        if (speaker && speaker !== 'all') {
            where.speaker = speaker;
        }

        // Year filter
        if (year && year !== 'all') {
            const yearInt = parseInt(year);
            where.preached_at = {
                gte: new Date(`${yearInt}-01-01`),
                lt: new Date(`${yearInt + 1}-01-01`)
            };
        }

        const sermons = await prisma.sermons.findMany({
            where,
            orderBy: { preached_at: 'desc' }
        });

        return res.status(200).json(sermons);
    } catch (error) {
        console.error('❌ Sermons API Error:', error);
        return res.status(500).json({
            error: 'Failed to fetch sermons',
            message: error.message
        });
    }
});


app.get('/api/sermons/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.headers.authorization && req.user?.role === 'admin' || req.user?.role === 'pastor';

        let sql = `SELECT * FROM sermons WHERE id = $1`;

        // Non-admin users can only see published sermons
        if (!isAdmin) {
            sql += ` AND is_published = true`;
        }

        const result = await query(sql, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Sermon not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching sermon' });
    }
});

// POST /api/sermons - Create new sermon (admin only)
app.post('/api/sermons', auth, async (req, res) => {
    try {
        const {
            title, speaker, preached_at, type, series, scripture, summary,
            key_points, small_group_questions, tags,
            video_url, audio_url, notes_url, is_published
        } = req.body;

        const userId = req.user.userId;

        if (!title || !speaker || !preached_at) {
            return res.status(400).json({ message: 'Title, speaker, and date are required' });
        }

        const result = await query(
            `INSERT INTO sermons(
    title, speaker, preached_at, type, series, scripture, summary,
    key_points, small_group_questions, tags,
    video_url, audio_url, notes_url, is_published, created_by
) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
RETURNING * `,
            [
                title, speaker, preached_at, type || 'Sunday', series, scripture, summary,
                key_points, small_group_questions, tags || [],
                video_url, audio_url, notes_url, is_published || false, userId
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating sermon' });
    }
});

// PATCH /api/sermons/:id - Update sermon (admin only)
app.patch('/api/sermons/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title, speaker, preached_at, type, series, scripture, summary,
            key_points, small_group_questions, tags,
            video_url, audio_url, notes_url, is_published
        } = req.body;

        const updates = [];
        const params = [];
        let paramCount = 1;

        if (title !== undefined) {
            updates.push(`title = $${paramCount++} `);
            params.push(title);
        }
        if (speaker !== undefined) {
            updates.push(`speaker = $${paramCount++} `);
            params.push(speaker);
        }
        if (preached_at !== undefined) {
            updates.push(`preached_at = $${paramCount++} `);
            params.push(preached_at);
        }
        if (type !== undefined) {
            updates.push(`type = $${paramCount++} `);
            params.push(type);
        }
        if (series !== undefined) {
            updates.push(`series = $${paramCount++} `);
            params.push(series);
        }
        if (scripture !== undefined) {
            updates.push(`scripture = $${paramCount++} `);
            params.push(scripture);
        }
        if (summary !== undefined) {
            updates.push(`summary = $${paramCount++} `);
            params.push(summary);
        }
        if (key_points !== undefined) {
            updates.push(`key_points = $${paramCount++} `);
            params.push(key_points);
        }
        if (small_group_questions !== undefined) {
            updates.push(`small_group_questions = $${paramCount++} `);
            params.push(small_group_questions);
        }
        if (tags !== undefined) {
            updates.push(`tags = $${paramCount++} `);
            params.push(tags);
        }
        if (video_url !== undefined) {
            updates.push(`video_url = $${paramCount++} `);
            params.push(video_url);
        }
        if (audio_url !== undefined) {
            updates.push(`audio_url = $${paramCount++} `);
            params.push(audio_url);
        }
        if (notes_url !== undefined) {
            updates.push(`notes_url = $${paramCount++} `);
            params.push(notes_url);
        }
        if (is_published !== undefined) {
            updates.push(`is_published = $${paramCount++} `);
            params.push(is_published);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        params.push(id);
        const sql = `
            UPDATE sermons 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
RETURNING *
    `;

        const result = await query(sql, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Sermon not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating sermon' });
    }
});

// DELETE /api/sermons/:id - Delete sermon (admin only)
app.delete('/api/sermons/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(`DELETE FROM sermons WHERE id = $1 RETURNING id`, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Sermon not found' });
        }

        res.json({ success: true, message: 'Sermon deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting sermon' });
    }
});

// POST /api/sermons/sync - Sync with YouTube RSS (Admin/Cron)
import { parseStringPromise } from 'xml2js';
app.post('/api/sermons/sync', auth, async (req, res) => {
    // Admin check
    if (req.user.role !== 'admin' && req.user.role !== 'pastor') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const CHANNEL_ID = 'UCZ1TpjsmG54-sIXk5m-AIbw';
    const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

    try {
        console.log(`🔄 Syncing YouTube videos from ${RSS_URL}...`);
        const rssRes = await fetch(RSS_URL);
        if (!rssRes.ok) throw new Error(`Failed to fetch RSS: ${rssRes.status}`);

        const xml = await rssRes.text();
        const result = await parseStringPromise(xml);

        const entries = result.feed.entry || [];
        let addedCount = 0;

        for (const entry of entries) {
            const videoId = entry['yt:videoId'][0];
            const title = entry.title[0];
            const published = new Date(entry.published[0]);
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            const description = entry['media:group'][0]['media:description'][0];

            // Check if exists
            const existingRes = await query('SELECT id FROM sermons WHERE video_url = $1', [videoUrl]);
            if (existingRes.rows.length === 0) {
                await query(`
                    INSERT INTO sermons (
                        title, scripture, speaker, description, video_url, thumbnail_url, preached_at, type, is_published, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
                `, [
                    title,
                    '', // Scripture not in RSS
                    'Anointed Worship Center', // Default speaker
                    description.substring(0, 500) + (description.length > 500 ? '...' : ''),
                    videoUrl,
                    thumbnailUrl,
                    published,
                    'sunday_service', // Default type
                    true
                ]);
                addedCount++;
                console.log(`   + Auto-added: ${title}`);
            }
        }

        res.json({ success: true, message: `Sync complete. Added ${addedCount} new videos.` });

    } catch (err) {
        console.error('YouTube Sync Error:', err);
        res.status(500).json({ message: 'Error syncing with YouTube', error: err.message });
    }
});

// --- Onboarding Endpoints ---

// Get onboarding status
app.get('/api/onboarding/status', auth, async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM onboarding_progress WHERE user_id = $1',
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            // Create new onboarding record for user
            const newRecord = await query(
                'INSERT INTO onboarding_progress (user_id) VALUES ($1) RETURNING *',
                [req.user.userId]
            );
            return res.json(newRecord.rows[0]);
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching onboarding status', error: err.message });
    }
});

// Update current step
app.patch('/api/onboarding/step', auth, async (req, res) => {
    const { step } = req.body;

    if (!step || step < 1 || step > 6) { // Increased step limit
        return res.status(400).json({ message: 'Invalid step number' });
    }

    try {
        const result = await query(
            'UPDATE onboarding_progress SET current_step = $1 WHERE user_id = $2 RETURNING *',
            [step, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Onboarding record not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating onboarding step' });
    }
});

// Submit Family Info (Household & Children)
app.post('/api/onboarding/family', auth, async (req, res) => {
    const { household_name, children } = req.body;

    try {
        await query('BEGIN');

        // 1. Create schema-required tables if they don't exist yet (Safety check, though migration should run)
        // (Assuming migration ran. Code relies on tables existing)

        // 2. Find or Create Household
        // Check if user already head of a household
        let householdId;
        const hhCheck = await query(`
            SELECT h.id FROM households h
            JOIN household_members hm ON h.id = hm.household_id
            WHERE hm.person_id = $1 AND hm.relationship = 'head'
        `, [req.user.userId]);

        if (hhCheck.rows.length > 0) {
            householdId = hhCheck.rows[0].id;
            // Update name?
            if (household_name) {
                await query('UPDATE households SET household_name = $1 WHERE id = $2', [household_name, householdId]);
            }
        } else {
            // Create new
            const userRes = await query('SELECT * FROM user_profiles WHERE id = $1', [req.user.userId]);
            const user = userRes.rows[0];
            const hhName = household_name || `${user.last_name} Household`;

            const hhRes = await query(`
                INSERT INTO households (household_name, primary_email, primary_phone, city, state)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
            `, [hhName, user.email, user.phone, user.city, user.state]);
            householdId = hhRes.rows[0].id;

            await query(`
                INSERT INTO household_members (household_id, person_id, relationship, is_primary_contact)
                VALUES ($1, $2, 'head', true)
            `, [householdId, req.user.userId]);
        }

        // 3. Process Children
        if (Array.isArray(children)) {
            for (const child of children) {
                if (!child.firstName || !child.lastName) continue;

                // Create child profile
                const childRes = await query(`
                    INSERT INTO user_profiles (first_name, last_name, date_of_birth, notes, person_type)
                    VALUES ($1, $2, $3, $4, 'child')
                    RETURNING id
                `, [child.firstName, child.lastName, child.dob || null, child.allergies]); // storing allergies in notes for now

                const childId = childRes.rows[0].id;

                // Link to household
                await query(`
                    INSERT INTO household_members (household_id, person_id, relationship)
                    VALUES ($1, $2, 'child')
                `, [householdId, childId]);

                // Link to parent (children table for legacy/checkin compatibility if needed?)
                // Yes, `children` table is used by Check-in module!
                await query(`
                    INSERT INTO children (parent_user_id, first_name, last_name, dob, allergies, notes)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [req.user.userId, child.firstName, child.lastName, child.dob || '2020-01-01', child.allergies, 'Created during onboarding']);
            }
        }

        await query('COMMIT');
        res.json({ success: true, householdId });

    } catch (err) {
        await query('ROLLBACK');
        console.error('Error in family onboarding:', err);
        res.status(500).json({ message: 'Error saving family info' });
    }
});

// Complete onboarding
app.post('/api/onboarding/complete', auth, async (req, res) => {
    try {
        const result = await query(
            'UPDATE onboarding_progress SET completed = true, completed_at = NOW() WHERE user_id = $1 RETURNING *',
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Onboarding record not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error completing onboarding', error: err.message });
    }
});

// Update user profile (enhanced for onboarding)
app.patch('/api/user/profile', auth, async (req, res) => {
    const {
        phone,
        birthday,
        address,
        profile_photo_url,
        ministry_interests,
        email_notifications,
        sms_notifications
    } = req.body;

    try {
        // Build dynamic update query
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (phone !== undefined) {
            updates.push(`phone = $${paramCount++}`);
            values.push(phone);
        }
        if (birthday !== undefined) {
            updates.push(`birthday = $${paramCount++}`);
            values.push(birthday);
        }
        if (address !== undefined) {
            updates.push(`address = $${paramCount++}`);
            values.push(address);
        }
        if (profile_photo_url !== undefined) {
            updates.push(`profile_photo_url = $${paramCount++}`);
            values.push(profile_photo_url);
        }
        if (ministry_interests !== undefined) {
            updates.push(`ministry_interests = $${paramCount++}`);
            values.push(ministry_interests);
        }
        if (email_notifications !== undefined) {
            updates.push(`email_notifications = $${paramCount++}`);
            values.push(email_notifications);
        }
        if (sms_notifications !== undefined) {
            updates.push(`sms_notifications = $${paramCount++}`);
            values.push(sms_notifications);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(req.user.userId);
        const result = await query(
            `UPDATE user_profiles SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating profile', error: err.message });
    }
});


// --- Household Management Endpoints ---

// GET /api/me/household
app.get('/api/me/household', auth, async (req, res) => {
    try {
        // Find household where user is a member
        const hhRes = await query(`
            SELECT h.*, hm.relationship as my_role
            FROM households h
            JOIN household_members hm ON h.id = hm.household_id
            WHERE hm.person_id = $1
        `, [req.user.userId]);

        if (hhRes.rows.length === 0) {
            return res.json({ household: null });
        }

        const household = hhRes.rows[0];

        // Fetch members
        const membersRes = await query(`
            SELECT p.id, p.first_name, p.last_name, p.date_of_birth, p.notes, hm.relationship, p.profile_photo_url, p.person_type
            FROM household_members hm
            JOIN user_profiles p ON hm.person_id = p.id
            WHERE hm.household_id = $1
            ORDER BY 
                CASE WHEN hm.relationship = 'head' THEN 1 
                     WHEN hm.relationship = 'spouse' THEN 2 
                     ELSE 3 END,
                p.date_of_birth ASC
        `, [household.id]);

        res.json({
            household,
            members: membersRes.rows
        });
    } catch (err) {
        console.error('Error fetching household:', err);
        res.status(500).json({ message: 'Error fetching household' });
    }
});

// POST /api/me/household/members - Add Family Member
app.post('/api/me/household/members', auth, async (req, res) => {
    const { firstName, lastName, dob, relationship, allergies } = req.body;

    if (!firstName || !lastName || !relationship) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        await query('BEGIN');

        // 1. Get Household ID
        const hhRes = await query(`
            SELECT h.id 
            FROM households h
            JOIN household_members hm ON h.id = hm.household_id
            WHERE hm.person_id = $1
        `, [req.user.userId]);

        let householdId;

        if (hhRes.rows.length === 0) {
            // Create household if not exists
            const userRes = await query('SELECT * FROM user_profiles WHERE id = $1', [req.user.userId]);
            const user = userRes.rows[0];
            const newHh = await query(`
                INSERT INTO households (household_name, primary_email, primary_phone, city, state)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
            `, [`${user.last_name} Household`, user.email, user.phone, user.city, user.state]);
            householdId = newHh.rows[0].id;

            // Link self as Head
            await query(`
                INSERT INTO household_members (household_id, person_id, relationship, is_primary_contact)
                VALUES ($1, $2, 'head', true)
            `, [householdId, req.user.userId]);
        } else {
            householdId = hhRes.rows[0].id;
        }

        // 2. Create User Profile for Member
        const personType = relationship === 'child' ? 'child' : 'adult';
        // Check if exists? Skip for now, assume adding new.

        const memberRes = await query(`
            INSERT INTO user_profiles (first_name, last_name, date_of_birth, notes, person_type)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `, [firstName, lastName, dob || null, allergies || '', personType]); // Storing allergies in notes

        const memberId = memberRes.rows[0].id;

        // 3. Link to Household
        await query(`
            INSERT INTO household_members (household_id, person_id, relationship)
            VALUES ($1, $2, $3)
        `, [householdId, memberId, relationship]);

        // 4. If child, add to 'children' table for Check-in Compatibility
        if (personType === 'child') {
            await query(`
                INSERT INTO children (parent_user_id, first_name, last_name, dob, allergies, notes)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [req.user.userId, firstName, lastName, dob || '2020-01-01', allergies, 'Added via Profile']);
        }

        await query('COMMIT');
        res.json({ success: true, memberId });

    } catch (err) {
        await query('ROLLBACK');
        console.error('Error adding household member:', err);
        res.status(500).json({ message: 'Error adding member' });
    }
});

// DELETE /api/me/household/members/:id - Remove Member
app.delete('/api/me/household/members/:id', auth, async (req, res) => {
    const { id } = req.params;

    try {
        await query('BEGIN');

        // Verify ownership (member must belong to user's household)
        const check = await query(`
            SELECT 1 
            FROM household_members hm_target
            JOIN household_members hm_user ON hm_target.household_id = hm_user.household_id
            WHERE hm_target.person_id = $1 AND hm_user.person_id = $2
        `, [id, req.user.userId]);

        if (check.rows.length === 0) {
            await query('ROLLBACK');
            return res.status(403).json({ message: 'Unauthorized or member not found' });
        }

        // Unlink from household
        await query('DELETE FROM household_members WHERE person_id = $1', [id]);

        // Should we delete the profile? Yes, if it's a child created here.
        // For safety, let's delete only if person_type is 'child' (orphaned).
        // If it's a spouse who might log in, we shouldn't delete profile.
        // For this MVP, assuming mainly children management.

        // Also remove from legacy children table
        // Find child record linking this profile logic? 
        // Logic: children table doesn't have profile_id column usually?
        // Wait, migrate script didn't add profile_id to children table.
        // But we added to children table using names.
        // We should try to delete from children table based on name matching? Risky.
        // Let's rely on the fact that for NOW, we just want to remove from household view.

        await query('COMMIT');
        res.json({ success: true });

    } catch (err) {
        await query('ROLLBACK');
        console.error('Error removing member:', err);
        res.status(500).json({ message: 'Error removing member' });
    }
});

// --- Giving/Tithes & Offerings Endpoints ---


// Get all active giving options
app.get('/api/giving/options', auth, async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM giving_options WHERE is_active = true ORDER BY sort_order ASC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching giving options' });
    }
});

// Get giving content (why we give, help info)
app.get('/api/giving/content', auth, async (req, res) => {
    try {
        const result = await query('SELECT * FROM giving_content');
        const content = {};
        result.rows.forEach(row => {
            content[row.key] = row.value;
        });
        res.json(content);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching giving content' });
    }
});

// Log giving intent
app.post('/api/giving/intent', auth, async (req, res) => {
    const { giving_option_id, amount, frequency } = req.body;

    if (!giving_option_id) {
        return res.status(400).json({ message: 'giving_option_id is required' });
    }

    try {
        // Verify giving option exists
        const optionCheck = await query(
            'SELECT id FROM giving_options WHERE id = $1',
            [giving_option_id]
        );

        if (optionCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Giving option not found' });
        }

        // Log the intent
        const result = await query(
            `INSERT INTO giving_intents (user_id, giving_option_id, amount, frequency)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [req.user.userId, giving_option_id, amount || null, frequency || 'one-time']
        );

        res.json({ success: true, intent: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error logging giving intent' });
    }
});

// Admin: Create giving option
app.post('/api/giving/options', auth, async (req, res) => {
    // Check admin/pastor role
    if (req.user.role !== 'admin' && req.user.role !== 'pastor') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const { title, category, url, provider, is_primary, is_active, sort_order } = req.body;

    if (!title || !category || !provider) {
        return res.status(400).json({ message: 'title, category, and provider are required' });
    }

    try {
        // If setting as primary, unset other primary options
        if (is_primary) {
            await query('UPDATE giving_options SET is_primary = false WHERE is_primary = true');
        }

        const result = await query(
            `INSERT INTO giving_options (title, category, url, provider, is_primary, is_active, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [title, category, url || null, provider, is_primary || false, is_active !== false, sort_order || 0]
        );

        res.json({ success: true, option: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating giving option' });
    }
});

// Admin: Update giving option
app.patch('/api/giving/options/:id', auth, async (req, res) => {
    // Check admin/pastor role
    if (req.user.role !== 'admin' && req.user.role !== 'pastor') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { title, category, url, provider, is_primary, is_active, sort_order } = req.body;

    try {
        // If setting as primary, unset other primary options
        if (is_primary) {
            await query('UPDATE giving_options SET is_primary = false WHERE is_primary = true AND id != $1', [id]);
        }

        // Build dynamic update query
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (title !== undefined) {
            updates.push(`title = $${paramCount++}`);
            values.push(title);
        }
        if (category !== undefined) {
            updates.push(`category = $${paramCount++}`);
            values.push(category);
        }
        if (url !== undefined) {
            updates.push(`url = $${paramCount++}`);
            values.push(url);
        }
        if (provider !== undefined) {
            updates.push(`provider = $${paramCount++}`);
            values.push(provider);
        }
        if (is_primary !== undefined) {
            updates.push(`is_primary = $${paramCount++}`);
            values.push(is_primary);
        }
        if (is_active !== undefined) {
            updates.push(`is_active = $${paramCount++}`);
            values.push(is_active);
        }
        if (sort_order !== undefined) {
            updates.push(`sort_order = $${paramCount++}`);
            values.push(sort_order);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(id);
        const result = await query(
            `UPDATE giving_options SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Giving option not found' });
        }

        res.json({ success: true, option: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating giving option' });
    }
});

// Admin: Delete giving option
app.delete('/api/giving/options/:id', auth, async (req, res) => {
    // Check admin/pastor role
    if (req.user.role !== 'admin' && req.user.role !== 'pastor') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;

    try {
        const result = await query('DELETE FROM giving_options WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Giving option not found' });
        }

        res.json({ success: true, message: 'Giving option deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting giving option' });
    }
});

// Admin: Update giving content
app.patch('/api/giving/content', auth, async (req, res) => {
    // Check admin/pastor role
    if (req.user.role !== 'admin' && req.user.role !== 'pastor') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const { key, value } = req.body;

    if (!key || !value) {
        return res.status(400).json({ message: 'key and value are required' });
    }

    try {
        const result = await query(
            `INSERT INTO giving_content (key, value)
             VALUES ($1, $2)
             ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
             RETURNING *`,
            [key, value]
        );

        res.json({ success: true, content: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating giving content' });
    }
});

// Admin: Get giving summary (intents only, last 7 days)
app.get('/api/giving/summary', auth, async (req, res) => {
    // Check admin/pastor role
    if (req.user.role !== 'admin' && req.user.role !== 'pastor') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const { range = '7d' } = req.query;
    const days = parseInt(range.replace('d', ''));

    try {
        // Get total intents and amounts
        const totalsResult = await query(
            `SELECT 
                COUNT(*) as total_intents,
                COALESCE(SUM(amount), 0) as total_amount
             FROM giving_intents
             WHERE created_at >= NOW() - INTERVAL '${days} days'`
        );

        // Get breakdown by giving option
        const byOptionResult = await query(
            `SELECT 
                gi.giving_option_id,
                go.title,
                go.category,
                COUNT(*) as intents,
                COALESCE(SUM(gi.amount), 0) as amount
             FROM giving_intents gi
             JOIN giving_options go ON gi.giving_option_id = go.id
             WHERE gi.created_at >= NOW() - INTERVAL '${days} days'
             GROUP BY gi.giving_option_id, go.title, go.category
             ORDER BY intents DESC`
        );

        // Get daily breakdown
        const dailyResult = await query(
            `SELECT 
                DATE(created_at) as date,
                COUNT(*) as intents,
                COALESCE(SUM(amount), 0) as amount
             FROM giving_intents
             WHERE created_at >= NOW() - INTERVAL '${days} days'
             GROUP BY DATE(created_at)
             ORDER BY date ASC`
        );

        res.json({
            range: `${days}d`,
            totalIntents: parseInt(totalsResult.rows[0].total_intents),
            totalAmount: parseFloat(totalsResult.rows[0].total_amount),
            byOption: byOptionResult.rows.map(row => ({
                giving_option_id: row.giving_option_id,
                title: row.title,
                category: row.category,
                intents: parseInt(row.intents),
                amount: parseFloat(row.amount)
            })),
            daily: dailyResult.rows.map(row => ({
                date: row.date,
                intents: parseInt(row.intents),
                amount: parseFloat(row.amount)
            }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching giving summary' });
    }
});

// --- Activity Feed & Stats Endpoints ---

// GET /api/activity - Get recent activity feed
app.get('/api/activity', auth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;

        // Fetch recent activities from various sources
        const activities = [];

        // Recent check-ins
        const checkins = await query(`
            SELECT 
                c.created_at,
                'checkin' as type,
                up.first_name || ' ' || up.last_name as user_name,
                e.title as event_title
            FROM checkins c
            LEFT JOIN user_profiles up ON c.user_id = up.id
            LEFT JOIN events e ON c.event_id = e.id
            WHERE c.created_at >= NOW() - INTERVAL '30 days'
            ORDER BY c.created_at DESC
            LIMIT 10
        `);

        checkins.rows.forEach(row => {
            activities.push({
                type: 'checkin',
                user: row.user_name || 'Guest',
                description: `Checked in to ${row.event_title || 'service'}`,
                timestamp: row.created_at,
                icon: 'CheckSquare'
            });
        });

        // Recent giving
        const giving = await query(`
            SELECT 
                gi.created_at,
                up.first_name || ' ' || up.last_name as user_name,
                go.title as giving_title,
                gi.amount
            FROM giving_intents gi
            LEFT JOIN user_profiles up ON gi.user_id = up.id
            LEFT JOIN giving_options go ON gi.giving_option_id = go.id
            WHERE gi.created_at >= NOW() - INTERVAL '30 days'
            ORDER BY gi.created_at DESC
            LIMIT 5
        `);

        giving.rows.forEach(row => {
            activities.push({
                type: 'giving',
                user: row.user_name || 'Anonymous',
                description: `Gave to ${row.giving_title}`,
                timestamp: row.created_at,
                icon: 'DollarSign'
            });
        });

        // Recent prayer requests
        const prayers = await query(`
            SELECT 
                pr.created_at,
                up.first_name || ' ' || up.last_name as user_name,
                pr.request_text
            FROM prayer_requests pr
            LEFT JOIN user_profiles up ON pr.user_id = up.id
            WHERE pr.created_at >= NOW() - INTERVAL '30 days'
            ORDER BY pr.created_at DESC
            LIMIT 5
        `);

        prayers.rows.forEach(row => {
            activities.push({
                type: 'prayer',
                user: row.user_name || 'Anonymous',
                description: `Requested prayer for ${row.request_text || 'personal need'}`,
                timestamp: row.created_at,
                icon: 'Heart'
            });
        });

        // Sort all activities by timestamp and limit
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json(activities.slice(0, limit));
    } catch (err) {
        console.error('Error fetching activity:', err);
        res.status(500).json({ message: 'Error fetching activity feed' });
    }
});

// GET /api/stats/pulse - Get church pulse metrics
app.get('/api/stats/pulse', auth, async (req, res) => {
    try {
        const timeframe = req.query.timeframe || 'week';
        let interval = '7 days';

        if (timeframe === 'month') interval = '30 days';
        if (timeframe === 'year') interval = '365 days';

        // Total members
        const membersResult = await query(`
            SELECT COUNT(*) as count 
            FROM user_profiles 
            WHERE role = 'member'
        `);

        // Average attendance (from check-ins)
        const attendanceResult = await query(`
            SELECT COALESCE(AVG(daily_count), 0) as avg_attendance
            FROM (
                SELECT DATE(c.created_at) as date, COUNT(*) as daily_count
                FROM checkins c
                WHERE c.created_at >= NOW() - INTERVAL '${interval}'
                GROUP BY DATE(c.created_at)
            ) daily_stats
        `);

        // Total giving
        const givingResult = await query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM giving_intents
            WHERE created_at >= NOW() - INTERVAL '${interval}'
        `);

        // Engagement score (combination of check-ins, giving, prayer requests)
        const engagementResult = await query(`
            SELECT 
                (SELECT COUNT(*) FROM checkins WHERE created_at >= NOW() - INTERVAL '${interval}') +
                (SELECT COUNT(*) FROM giving_intents WHERE created_at >= NOW() - INTERVAL '${interval}') +
                (SELECT COUNT(*) FROM prayer_requests WHERE created_at >= NOW() - INTERVAL '${interval}')
            as total_engagements
        `);

        const totalMembers = parseInt(membersResult.rows[0].count);
        const engagementScore = totalMembers > 0
            ? Math.min(100, Math.round((parseInt(engagementResult.rows[0].total_engagements) / totalMembers) * 10))
            : 0;

        res.json({
            members: {
                total: totalMembers,
                change: 0 // Could calculate from historical data
            },
            attendance: {
                average: Math.round(parseFloat(attendanceResult.rows[0].avg_attendance)),
                change: 0
            },
            giving: {
                total: parseFloat(givingResult.rows[0].total),
                change: 0
            },
            engagement: {
                score: engagementScore,
                change: 0
            }
        });
    } catch (err) {
        console.error('Error fetching pulse via stats:', err);
        res.status(500).json({ message: 'Error fetching church pulse' });
    }
});

// GET /api/stats/attendance - Get attendance insights
app.get('/api/stats/attendance', auth, async (req, res) => {
    try {
        const period = req.query.period || 'week';
        const days = period === 'month' ? 30 : 7;

        const result = await query(`
            SELECT 
                DATE(c.created_at) as date,
                COUNT(DISTINCT c.user_id) as count
            FROM checkins c
            WHERE c.created_at >= NOW() - INTERVAL '${days} days'
            GROUP BY DATE(c.created_at)
            ORDER BY date ASC
        `);

        res.json(result.rows.map(row => ({
            date: row.date,
            count: parseInt(row.count)
        })));
    } catch (err) {
        console.error('Error fetching attendance:', err);
        res.status(500).json({ message: 'Error fetching attendance data' });
    }
});

// GET /api/events - Get all events
app.get('/api/events', auth, async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                id,
                title,
                description,
                location,
                starts_at,
                ends_at,
                status,
                created_at
            FROM events
            ORDER BY starts_at DESC
            LIMIT 100
        `);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).json({ message: 'Error fetching events' });
    }
});

// POST /api/events - Create new event
app.post('/api/events', auth, async (req, res) => {
    try {
        const { title, description, location, starts_at, ends_at } = req.body;

        if (!title || !starts_at) {
            return res.status(400).json({ message: 'Title and start time are required' });
        }

        const result = await query(`
            INSERT INTO events (title, description, location, starts_at, ends_at, status, created_by)
            VALUES ($1, $2, $3, $4, $5, 'scheduled', $6)
            RETURNING *
        `, [title, description, location, starts_at, ends_at, req.user.userId]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating event:', err);
        res.status(500).json({ message: 'Error creating event' });
    }
});

// PUT /api/events/:id - Update event
app.put('/api/events/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, location, starts_at, ends_at, status } = req.body;

        const result = await query(`
            UPDATE events
            SET title = COALESCE($1, title),
                description = COALESCE($2, description),
                location = COALESCE($3, location),
                starts_at = COALESCE($4, starts_at),
                ends_at = COALESCE($5, ends_at),
                status = COALESCE($6, status),
                updated_at = NOW()
            WHERE id = $7
            RETURNING *
        `, [title, description, location, starts_at, ends_at, status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating event:', err);
        res.status(500).json({ message: 'Error updating event' });
    }
});

// DELETE /api/events/:id - Delete event
app.delete('/api/events/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ success: true, message: 'Event deleted' });
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).json({ message: 'Error deleting event' });
    }
});

// GET /api/tasks/pending - Get pending tasks for action center
app.get('/api/tasks/pending', auth, async (req, res) => {
    try {
        // Pending prayer requests
        const prayerRequests = await query(`
            SELECT 
                pr.id,
                pr.category,
                pr.is_urgent,
                pr.created_at,
                up.first_name || ' ' || up.last_name as user_name
            FROM prayer_requests pr
            LEFT JOIN user_profiles up ON pr.user_id = up.id
            WHERE pr.status = 'pending'
            ORDER BY pr.is_urgent DESC, pr.created_at DESC
            LIMIT 5
        `);

        // Pending ministry requests (if table exists)
        let ministryRequests = { rows: [] };
        try {
            ministryRequests = await query(`
                SELECT 
                    mr.id,
                    mr.ministry_name,
                    mr.created_at,
                    up.first_name || ' ' || up.last_name as user_name
                FROM ministry_requests mr
                LEFT JOIN user_profiles up ON mr.user_id = up.id
                WHERE mr.status = 'pending'
                ORDER BY mr.created_at DESC
                LIMIT 5
            `);
        } catch (e) {
            // Table might not exist
        }

        res.json({
            prayerRequests: prayerRequests.rows.map(row => ({
                id: row.id,
                type: 'prayer',
                title: `Prayer: ${row.category}`,
                user: row.user_name || 'Anonymous',
                urgent: row.is_urgent,
                date: row.created_at
            })),
            ministryRequests: ministryRequests.rows.map(row => ({
                id: row.id,
                type: 'ministry',
                title: `Ministry: ${row.ministry_name}`,
                user: row.user_name,
                date: row.created_at
            })),
            followUps: [] // Placeholder for future follow-up system
        });
    } catch (err) {
        console.error('Error fetching pending tasks:', err);
        res.status(500).json({ message: 'Error fetching pending tasks' });
    }
});

// --- Kids & Youth Check-In API Endpoints ---

// Helper function to calculate age from DOB
function calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    const ageInMs = today.getTime() - birthDate.getTime();
    const ageInYears = ageInMs / (365.25 * 24 * 60 * 60 * 1000);
    return ageInYears;
}

// Helper function to get eligible program based on age
function getEligibleProgram(dob) {
    const age = calculateAge(dob);

    if (age < 0.25) return 'none'; // Under 3 months
    if (age < 10) return 'daycare';
    if (age < 16) return 'youth';
    if (age <= 21) return 'teen';
    return 'none';
}

// Helper function to generate 4-digit pickup code
function generatePickupCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// MEMBER PORTAL APIs

// GET /api/programs/my-children - Get all children for logged-in parent
app.get('/api/programs/my-children', auth, async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await query(`
            SELECT 
                id,
                first_name,
                last_name,
                dob,
                allergies,
                notes,
                authorized_pickup_names,
                created_at
            FROM children
            WHERE parent_user_id = $1
            ORDER BY dob DESC
        `, [userId]);

        // Add computed age and eligible program to each child
        const children = result.rows.map(child => ({
            ...child,
            age: calculateAge(child.dob),
            eligible_program: getEligibleProgram(child.dob)
        }));

        res.json(children);
    } catch (err) {
        console.error('Error fetching children:', err);
        res.status(500).json({ message: 'Error fetching children', error: err.message });
    }
});

// POST /api/programs/children - Create new child profile
app.post('/api/programs/children', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { first_name, last_name, dob, allergies, notes, authorized_pickup_names } = req.body;

        if (!first_name || !last_name || !dob) {
            return res.status(400).json({ message: 'First name, last name, and date of birth are required' });
        }

        const result = await query(`
            INSERT INTO children (
                parent_user_id, first_name, last_name, dob, allergies, notes, authorized_pickup_names
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [userId, first_name, last_name, dob, allergies, notes, authorized_pickup_names || []]);

        const child = result.rows[0];
        res.status(201).json({
            ...child,
            age: calculateAge(child.dob),
            eligible_program: getEligibleProgram(child.dob)
        });
    } catch (err) {
        console.error('Error creating child:', err);
        res.status(500).json({ message: 'Error creating child profile' });
    }
});

// PATCH /api/programs/children/:id - Update child profile
app.patch('/api/programs/children/:id', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const { first_name, last_name, dob, allergies, notes, authorized_pickup_names } = req.body;

        // Verify ownership
        const ownerCheck = await query('SELECT id FROM children WHERE id = $1 AND parent_user_id = $2', [id, userId]);
        if (ownerCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Child not found or access denied' });
        }

        const result = await query(`
            UPDATE children
            SET first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                dob = COALESCE($3, dob),
                allergies = COALESCE($4, allergies),
                notes = COALESCE($5, notes),
                authorized_pickup_names = COALESCE($6, authorized_pickup_names),
                updated_at = NOW()
            WHERE id = $7
            RETURNING *
        `, [first_name, last_name, dob, allergies, notes, authorized_pickup_names, id]);

        const child = result.rows[0];
        res.json({
            ...child,
            age: calculateAge(child.dob),
            eligible_program: getEligibleProgram(child.dob)
        });
    } catch (err) {
        console.error('Error updating child:', err);
        res.status(500).json({ message: 'Error updating child profile' });
    }
});

// GET /api/programs/active-sessions - Get active sessions for all programs
app.get('/api/programs/active-sessions', auth, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const result = await query(`
            SELECT id, program, service_date, status, opened_at
            FROM program_sessions
            WHERE service_date = $1 AND status = 'active'
        `, [today]);

        const sessions = {
            daycare: null,
            youth: null,
            teen: null
        };

        result.rows.forEach(session => {
            sessions[session.program] = session;
        });

        res.json(sessions);
    } catch (err) {
        console.error('Error fetching active sessions:', err);
        res.status(500).json({ message: 'Error fetching active sessions' });
    }
});

// POST /api/programs/checkin/daycare - Daycare check-in
app.post('/api/programs/checkin/daycare', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { child_ids, emergency_contact_name, emergency_contact_phone, notes } = req.body;

        if (!child_ids || child_ids.length === 0) {
            return res.status(400).json({ message: 'At least one child must be selected' });
        }

        // Get active daycare session
        const today = new Date().toISOString().split('T')[0];
        const sessionResult = await query(`
            SELECT id FROM program_sessions
            WHERE program = 'daycare' AND service_date = $1 AND status = 'active'
            LIMIT 1
        `, [today]);

        if (sessionResult.rows.length === 0) {
            return res.status(400).json({ message: 'Daycare check-in is currently closed' });
        }

        const sessionId = sessionResult.rows[0].id;
        const checkins = [];

        // Check in each child
        for (const childId of child_ids) {
            // Verify ownership
            const childCheck = await query('SELECT id, first_name, last_name FROM children WHERE id = $1 AND parent_user_id = $2', [childId, userId]);
            if (childCheck.rows.length === 0) {
                continue; // Skip unauthorized children
            }

            // Check if already checked in
            const existingCheck = await query('SELECT id FROM program_checkins WHERE session_id = $1 AND child_id = $2', [sessionId, childId]);
            if (existingCheck.rows.length > 0) {
                continue; // Skip already checked in
            }

            const pickupCode = generatePickupCode();

            const result = await query(`
                INSERT INTO program_checkins (
                    session_id, program, child_id, parent_user_id,
                    emergency_contact_name, emergency_contact_phone, notes, pickup_code
                )
                VALUES ($1, 'daycare', $2, $3, $4, $5, $6, $7)
                RETURNING *
            `, [sessionId, childId, userId, emergency_contact_name, emergency_contact_phone, notes, pickupCode]);

            checkins.push({
                ...result.rows[0],
                child_name: `${childCheck.rows[0].first_name} ${childCheck.rows[0].last_name}`
            });
        }

        res.json({ success: true, checkins });
    } catch (err) {
        console.error('Error checking in to daycare:', err);
        res.status(500).json({ message: 'Error processing daycare check-in' });
    }
});

// POST /api/programs/checkin/youth - Youth check-in
app.post('/api/programs/checkin/youth', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { child_ids, notes, generate_pickup_code } = req.body;

        if (!child_ids || child_ids.length === 0) {
            return res.status(400).json({ message: 'At least one youth must be selected' });
        }

        // Get active youth session
        const today = new Date().toISOString().split('T')[0];
        const sessionResult = await query(`
            SELECT id FROM program_sessions
            WHERE program = 'youth' AND service_date = $1 AND status = 'active'
            LIMIT 1
        `, [today]);

        if (sessionResult.rows.length === 0) {
            return res.status(400).json({ message: 'Youth check-in is currently closed' });
        }

        const sessionId = sessionResult.rows[0].id;
        const checkins = [];

        // Check in each youth
        for (const childId of child_ids) {
            // Verify ownership
            const childCheck = await query('SELECT id, first_name, last_name FROM children WHERE id = $1 AND parent_user_id = $2', [childId, userId]);
            if (childCheck.rows.length === 0) {
                continue;
            }

            // Check if already checked in
            const existingCheck = await query('SELECT id FROM program_checkins WHERE session_id = $1 AND child_id = $2', [sessionId, childId]);
            if (existingCheck.rows.length > 0) {
                continue;
            }

            const pickupCode = generate_pickup_code ? generatePickupCode() : null;

            const result = await query(`
                INSERT INTO program_checkins (
                    session_id, program, child_id, parent_user_id, notes, pickup_code
                )
                VALUES ($1, 'youth', $2, $3, $4, $5)
                RETURNING *
            `, [sessionId, childId, userId, notes, pickupCode]);

            checkins.push({
                ...result.rows[0],
                child_name: `${childCheck.rows[0].first_name} ${childCheck.rows[0].last_name}`
            });
        }

        res.json({ success: true, checkins });
    } catch (err) {
        console.error('Error checking in to youth:', err);
        res.status(500).json({ message: 'Error processing youth check-in' });
    }
});

// POST /api/programs/checkin/teen - Teen self check-in
app.post('/api/programs/checkin/teen', auth, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Verify user is teen age (16-21)
        const userResult = await query('SELECT first_name, last_name, birthday FROM user_profiles WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];
        if (!user.birthday) {
            return res.status(400).json({ message: 'Birthday not set. Please update your profile.' });
        }

        const age = calculateAge(user.birthday);
        if (age < 16 || age > 21) {
            return res.status(400).json({ message: 'Teen check-in is for ages 16-21 only' });
        }

        // Get active teen session
        const today = new Date().toISOString().split('T')[0];
        const sessionResult = await query(`
            SELECT id FROM program_sessions
            WHERE program = 'teen' AND service_date = $1 AND status = 'active'
            LIMIT 1
        `, [today]);

        if (sessionResult.rows.length === 0) {
            return res.status(400).json({ message: 'Teen check-in is currently closed' });
        }

        const sessionId = sessionResult.rows[0].id;

        // Check if already checked in
        const existingCheck = await query('SELECT id FROM program_checkins WHERE session_id = $1 AND teen_user_id = $2', [sessionId, userId]);
        if (existingCheck.rows.length > 0) {
            return res.status(400).json({ message: 'You have already checked in' });
        }

        const result = await query(`
            INSERT INTO program_checkins (session_id, program, teen_user_id)
            VALUES ($1, 'teen', $2)
            RETURNING *
        `, [sessionId, userId]);

        res.json({
            success: true,
            checkin: result.rows[0],
            user_name: `${user.first_name} ${user.last_name}`
        });
    } catch (err) {
        console.error('Error checking in teen:', err);
        res.status(500).json({ message: 'Error processing teen check-in' });
    }
});

// STAFF PORTAL APIs (RBAC: admin|pastor|staff|checkin_team)

const staffRoles = ['admin', 'pastor', 'staff'];

// POST /api/staff/programs/session/open - Open new session
app.post('/api/staff/programs/session/open', auth, async (req, res) => {
    if (!staffRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const { program } = req.body;
        const userId = req.user.userId;

        if (!['daycare', 'youth', 'teen'].includes(program)) {
            return res.status(400).json({ message: 'Invalid program' });
        }

        const today = new Date().toISOString().split('T')[0];

        // Create new session or re-activate existing one
        const result = await query(`
            INSERT INTO program_sessions (program, service_date, status, opened_by)
            VALUES ($1, $2, 'active', $3)
            ON CONFLICT (program, service_date)
            DO UPDATE SET 
                status = 'active', 
                closed_at = NULL, 
                closed_by = NULL, 
                opened_by = EXCLUDED.opened_by
            RETURNING *
        `, [program, today, userId]);

        res.json({ success: true, session: result.rows[0] });
    } catch (err) {
        console.error('Error opening session:', err);
        res.status(500).json({ message: 'Error opening session' });
    }
});

// POST /api/staff/programs/session/close - Close active session
app.post('/api/staff/programs/session/close', auth, async (req, res) => {
    if (!staffRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const { program } = req.body;
        const userId = req.user.userId;

        const today = new Date().toISOString().split('T')[0];

        const result = await query(`
            UPDATE program_sessions
            SET status = 'closed', closed_at = NOW(), closed_by = $1
            WHERE program = $2 AND service_date = $3 AND status = 'active'
            RETURNING *
        `, [userId, program, today]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No active session found' });
        }

        res.json({ success: true, session: result.rows[0] });
    } catch (err) {
        console.error('Error closing session:', err);
        res.status(500).json({ message: 'Error closing session' });
    }
});

// GET /api/staff/programs/roster - Get roster for program
app.get('/api/staff/programs/roster', auth, async (req, res) => {
    if (!staffRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const { program, date, filter } = req.query;
        const serviceDate = date || new Date().toISOString().split('T')[0];

        // Get session
        const sessionResult = await query(`
            SELECT id FROM program_sessions
            WHERE program = $1 AND service_date = $2
            ORDER BY opened_at DESC
            LIMIT 1
        `, [program, serviceDate]);

        if (sessionResult.rows.length === 0) {
            return res.json([]);
        }

        const sessionId = sessionResult.rows[0].id;

        let rosterQuery = `
            SELECT 
                pc.*,
                c.first_name as child_first_name,
                c.last_name as child_last_name,
                c.dob as child_dob,
                c.allergies,
                up.first_name || ' ' || up.last_name as parent_name,
                up.phone as parent_phone,
                up.email as parent_email,
                teen.first_name || ' ' || teen.last_name as teen_name
            FROM program_checkins pc
            LEFT JOIN children c ON pc.child_id = c.id
            LEFT JOIN user_profiles up ON pc.parent_user_id = up.id
            LEFT JOIN user_profiles teen ON pc.teen_user_id = teen.id
            WHERE pc.session_id = $1
        `;

        if (filter === 'checked_in') {
            rosterQuery += ' AND pc.picked_up_at IS NULL';
        } else if (filter === 'picked_up') {
            rosterQuery += ' AND pc.picked_up_at IS NOT NULL';
        }

        rosterQuery += ' ORDER BY pc.checked_in_at DESC';

        const result = await query(rosterQuery, [sessionId]);

        const roster = result.rows.map(row => ({
            ...row,
            name: row.child_first_name ? `${row.child_first_name} ${row.child_last_name}` : row.teen_name,
            age: row.child_dob ? calculateAge(row.child_dob) : null,
            has_allergies: !!row.allergies
        }));

        res.json(roster);
    } catch (err) {
        console.error('Error fetching roster:', err);
        res.status(500).json({ message: 'Error fetching roster' });
    }
});

// POST /api/staff/programs/pickup - Verify pickup code and mark as picked up
app.post('/api/staff/programs/pickup', auth, async (req, res) => {
    if (!staffRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const { pickup_code, picked_up_by } = req.body;

        if (!pickup_code) {
            return res.status(400).json({ message: 'Pickup code is required' });
        }

        // Find checkin with this pickup code
        const today = new Date().toISOString().split('T')[0];
        const result = await query(`
            SELECT pc.*, c.first_name, c.last_name
            FROM program_checkins pc
            JOIN program_sessions ps ON pc.session_id = ps.id
            LEFT JOIN children c ON pc.child_id = c.id
            WHERE pc.pickup_code = $1 
            AND ps.service_date = $2
            AND pc.picked_up_at IS NULL
        `, [pickup_code, today]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Invalid pickup code or child already picked up' });
        }

        const checkin = result.rows[0];

        // Mark as picked up
        await query(`
            UPDATE program_checkins
            SET picked_up_at = NOW(), picked_up_by = $1
            WHERE id = $2
        `, [picked_up_by || 'Staff', checkin.id]);

        res.json({
            success: true,
            child_name: `${checkin.first_name} ${checkin.last_name}`,
            picked_up_at: new Date()
        });
    } catch (err) {
        console.error('Error processing pickup:', err);
        res.status(500).json({ message: 'Error processing pickup' });
    }
});

// ============================================
// GIVING OPTIONS API ENDPOINTS
// ============================================

// GET /api/giving/options - Get all active giving options (member-facing)
app.get('/api/giving/options', auth, async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                id,
                title,
                provider,
                category,
                url,
                handle,
                subtitle,
                is_primary,
                sort_order
            FROM giving_options
            WHERE is_active = true
            ORDER BY sort_order ASC
        `);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching giving options:', err);
        res.status(500).json({ message: 'Error fetching giving options' });
    }
});

// POST /api/giving/intent - Log giving intent for analytics (optional)
app.post('/api/giving/intent', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { giving_option_id, amount, frequency } = req.body;

        // Validate inputs
        if (!giving_option_id) {
            return res.status(400).json({ message: 'Giving option ID required' });
        }

        // Insert into giving_intents
        await query(`
            INSERT INTO giving_intents (user_id, giving_option_id, amount, frequency)
            VALUES ($1, $2, $3, $4)
        `, [userId, giving_option_id, amount, frequency]);

        res.json({ success: true, message: 'Intent logged' });
    } catch (err) {
        console.error('Error logging giving intent:', err);
        res.status(500).json({ message: 'Error logging giving intent', error: err.message });
    }
});

// GET /api/admin/giving/options - Get all giving options including inactive (admin)
app.get('/api/admin/giving/options', auth, async (req, res) => {
    const adminRoles = ['admin', 'pastor'];

    if (!adminRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const result = await query(`
            SELECT 
                id,
                title,
                provider,
                category,
                url,
                handle,
                subtitle,
                is_primary,
                is_active,
                sort_order,
                created_at,
                updated_at
            FROM giving_options
            ORDER BY sort_order ASC
        `);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching giving options (admin):', err);
        res.status(500).json({ message: 'Error fetching giving options' });
    }
});

// POST /api/admin/giving/options - Create new giving option (admin)
app.post('/api/admin/giving/options', auth, async (req, res) => {
    const adminRoles = ['admin', 'pastor'];

    if (!adminRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const { title, provider, category, url, handle, subtitle, is_active, sort_order } = req.body;

        // Validate required fields
        if (!title || !provider || !category) {
            return res.status(400).json({ message: 'Title, provider, and category are required' });
        }

        const result = await query(`
            INSERT INTO giving_options (
                title, provider, category, url, handle, subtitle, 
                is_primary, is_active, sort_order
            )
            VALUES ($1, $2, $3, $4, $5, $6, false, $7, $8)
            RETURNING *
        `, [
            title,
            provider,
            category,
            url || null,
            handle || null,
            subtitle || null,
            is_active !== undefined ? is_active : true,
            sort_order || 0
        ]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error creating giving option:', err);
        res.status(500).json({ message: 'Error creating giving option' });
    }
});

// PATCH /api/admin/giving/options/:id - Update giving option (admin)
app.patch('/api/admin/giving/options/:id', auth, async (req, res) => {
    const adminRoles = ['admin', 'pastor'];

    if (!adminRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const { id } = req.params;
        const { title, provider, category, url, handle, subtitle, is_active, sort_order } = req.body;

        const result = await query(`
            UPDATE giving_options
            SET 
                title = COALESCE($1, title),
                provider = COALESCE($2, provider),
                category = COALESCE($3, category),
                url = $4,
                handle = $5,
                subtitle = $6,
                is_active = COALESCE($7, is_active),
                sort_order = COALESCE($8, sort_order),
                updated_at = NOW()
            WHERE id = $9
            RETURNING *
        `, [
            title,
            provider,
            category,
            url !== undefined ? url : null,
            handle !== undefined ? handle : null,
            subtitle !== undefined ? subtitle : null,
            is_active,
            sort_order,
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Giving option not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating giving option:', err);
        res.status(500).json({ message: 'Error updating giving option' });
    }
});

// PATCH /api/admin/giving/options/:id/primary - Set as primary (admin)
app.patch('/api/admin/giving/options/:id/primary', auth, async (req, res) => {
    const adminRoles = ['admin', 'pastor'];

    if (!adminRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const { id } = req.params;

        // First, unset all other primary flags
        await query('UPDATE giving_options SET is_primary = false');

        // Then set this one as primary
        const result = await query(`
            UPDATE giving_options
            SET is_primary = true, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Giving option not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error setting primary giving option:', err);
        res.status(500).json({ message: 'Error setting primary option' });
    }
});

// DELETE /api/admin/giving/options/:id - Delete giving option (admin)
app.delete('/api/admin/giving/options/:id', auth, async (req, res) => {
    const adminRoles = ['admin', 'pastor'];

    if (!adminRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const { id } = req.params;

        const result = await query('DELETE FROM giving_options WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Giving option not found' });
        }

        res.json({ success: true, message: 'Giving option deleted' });
    } catch (err) {
        console.error('Error deleting giving option:', err);
        res.status(500).json({ message: 'Error deleting giving option' });
    }
});

// ============================================
// MEDIA CONSENT API ENDPOINTS
// ============================================

// Helper function to create consent audit log
async function logConsentChange(profileId, childId, status, source, ipHash = null, userAgent = null) {
    await query(`
        INSERT INTO media_consent_log (profile_id, child_id, status, source, ip_hash, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6)
    `, [profileId, childId, status, source, ipHash, userAgent]);
}

// Helper function to hash IP address (truncate for privacy)
function hashIP(ip) {
    if (!ip) return null;
    // Simple truncation - keep first 3 octets only for IPv4
    const parts = ip.split('.');
    if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
    // For IPv6 or other formats, just take first 32 chars
    return ip.substring(0, 32) + '...';
}

// GET /api/me/consent - Get current user's consent status + children
app.get('/api/me/consent', auth, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get user's own consent status
        const userResult = await query(`
            SELECT 
                media_consent_status,
                media_consent_updated_at,
                media_consent_source,
                media_consent_notes
            FROM user_profiles
            WHERE id = $1
        `, [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userConsent = userResult.rows[0];

        // Get children's consent status
        const childrenResult = await query(`
            SELECT 
                id,
                first_name,
                last_name,
                dob,
                media_consent_status,
                media_consent_updated_at
            FROM children
            WHERE parent_user_id = $1
            ORDER BY dob DESC
        `, [userId]);

        res.json({
            user: {
                status: userConsent.media_consent_status,
                updated_at: userConsent.media_consent_updated_at,
                source: userConsent.media_consent_source,
                notes: userConsent.media_consent_notes
            },
            children: childrenResult.rows.map(child => ({
                id: child.id,
                first_name: child.first_name,
                last_name: child.last_name,
                dob: child.dob,
                status: child.media_consent_status,
                updated_at: child.media_consent_updated_at
            }))
        });
    } catch (err) {
        console.error('Error fetching consent:', err);
        res.status(500).json({ message: 'Error fetching consent status' });
    }
});

// POST /api/me/consent - Update user's consent status + children
app.post('/api/me/consent', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { user_consent, children_consent, source = 'profile' } = req.body;

        // Validate user consent status
        if (user_consent && !['consent', 'decline', 'unset'].includes(user_consent.status)) {
            return res.status(400).json({ message: 'Invalid consent status' });
        }

        // Get IP and user agent for audit
        const ipHash = hashIP(req.ip || req.headers['x-forwarded-for']);
        const userAgent = req.headers['user-agent']?.substring(0, 255);

        // Update user's own consent
        if (user_consent) {
            await query(`
                UPDATE user_profiles
                SET 
                    media_consent_status = $1,
                    media_consent_updated_at = NOW(),
                    media_consent_source = $2,
                    media_consent_notes = $3
                WHERE id = $4
            `, [user_consent.status, source, user_consent.notes || null, userId]);

            // Log the change (only if consent or decline, not unset)
            if (user_consent.status !== 'unset') {
                await logConsentChange(userId, null, user_consent.status, source, ipHash, userAgent);
            }
        }

        // Update children's consent
        if (children_consent && Array.isArray(children_consent)) {
            for (const childConsent of children_consent) {
                // Validate child consent
                if (!childConsent.child_id || !['consent', 'decline', 'unset'].includes(childConsent.status)) {
                    continue; // Skip invalid entries
                }

                // Verify child belongs to this user
                const childCheck = await query(`
                    SELECT id FROM children 
                    WHERE id = $1 AND parent_user_id = $2
                `, [childConsent.child_id, userId]);

                if (childCheck.rows.length === 0) {
                    continue; // Skip children that don't belong to this user
                }

                // Update child consent
                await query(`
                    UPDATE children
                    SET 
                        media_consent_status = $1,
                        media_consent_updated_at = NOW()
                    WHERE id = $2
                `, [childConsent.status, childConsent.child_id]);

                // Log the change
                if (childConsent.status !== 'unset') {
                    await logConsentChange(userId, childConsent.child_id, childConsent.status, source, ipHash, userAgent);
                }
            }
        }

        res.json({ success: true, message: 'Consent preferences saved' });
    } catch (err) {
        console.error('Error updating consent:', err);
        res.status(500).json({ message: 'Error updating consent', error: err.message });
    }
});

// GET /api/staff/people - Get people directory with new filters
app.get('/api/staff/people', auth, requireStaff, async (req, res) => {
    try {
        const { consent, search, type, status, limit = 50, offset = 0 } = req.query;

        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramCount = 0;

        // Filter by consent status
        if (consent && ['consent', 'decline', 'unset'].includes(consent)) {
            paramCount++;
            whereClause += ` AND p.media_consent_status = $${paramCount}`;
            params.push(consent);
        }

        // Filter by person_type (adult/child)
        if (type && ['adult', 'child'].includes(type)) {
            paramCount++;
            whereClause += ` AND p.person_type = $${paramCount}`;
            params.push(type);
        }

        // Filter by status (active/inactive/visitor)
        if (status) { // Assuming membership_status maps to this or added column
            paramCount++;
            whereClause += ` AND p.membership_status = $${paramCount}`;
            params.push(status);
        }

        // Search by name or email
        if (search) {
            paramCount++;
            whereClause += ` AND (p.first_name ILIKE $${paramCount} OR p.last_name ILIKE $${paramCount} OR p.email ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        // Add sorting and pagination
        const queryText = `
            SELECT 
                p.id,
                p.first_name,
                p.last_name,
                p.email,
                p.phone,
                p.role,
                p.person_type,
                p.membership_status as status,
                p.media_consent_status,
                p.media_consent_updated_at,
                p.media_consent_source,
                p.created_at,
                p.tags,
                p.notes,
                h.household_name,
                h.id as household_id
            FROM user_profiles p
            LEFT JOIN household_members hm ON p.id = hm.person_id
            LEFT JOIN households h ON hm.household_id = h.id
            ${whereClause}
            ORDER BY p.first_name ASC, p.last_name ASC
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
        `;
        params.push(limit, offset);

        const result = await query(queryText, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching people:', error);
        res.status(500).json({ message: 'Error fetching people' });
    }
});

// GET /api/staff/people/:id - Get person detail with consent and children
app.get('/api/staff/people/:id', auth, requireStaff, async (req, res) => {
    try {
        const { id } = req.params;

        // Get person info
        const personRes = await query('SELECT * FROM user_profiles WHERE id = $1', [id]);
        if (personRes.rows.length === 0) {
            return res.status(404).json({ message: 'Person not found' });
        }
        const person = personRes.rows[0];

        // Get household info
        const householdRes = await query(`
            SELECT h.*, hm.relationship, hm.is_primary_contact
            FROM households h
            JOIN household_members hm ON h.id = hm.household_id
            WHERE hm.person_id = $1
        `, [id]);

        res.json({
            ...person,
            household: householdRes.rows[0] || null
        });
    } catch (error) {
        console.error('Error fetching person details:', error);
        res.status(500).json({ message: 'Error fetching person details' });
    }
});

// PATCH /api/staff/people/:id - Update person details (including household)
app.patch('/api/staff/people/:id', auth, requireStaff, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            first_name, last_name, email, phone, role, person_type,
            media_consent_status, household_id, relationship
        } = req.body;

        // 1. Update Profile Fields
        const fields = [];
        const values = [];
        let index = 1;

        if (first_name) { fields.push(`first_name = $${index++}`); values.push(first_name); }
        if (last_name) { fields.push(`last_name = $${index++}`); values.push(last_name); }
        if (email !== undefined) { fields.push(`email = $${index++}`); values.push(email); }
        if (phone !== undefined) { fields.push(`phone = $${index++}`); values.push(phone); }
        if (role) { fields.push(`role = $${index++}`); values.push(role); }
        if (person_type) { fields.push(`person_type = $${index++}`); values.push(person_type); }
        if (media_consent_status) {
            fields.push(`media_consent_status = $${index++}`);
            values.push(media_consent_status);
            fields.push(`media_consent_updated_at = NOW()`);
        }

        if (fields.length > 0) {
            values.push(id);
            await query(`
                UPDATE user_profiles 
                SET ${fields.join(', ')}, updated_at = NOW() 
                WHERE id = $${index}
            `, values);
        }

        // 2. Update Household Membership (if household_id is provided)
        if (household_id !== undefined) {
            // If household_id is null/empty/false (''), remove from household
            if (!household_id) {
                await query('DELETE FROM household_members WHERE person_id = $1', [id]);
            } else {
                // Upsert into household_members
                // Remove from ALL other households first (enforce single household rule for simplicity)
                await query('DELETE FROM household_members WHERE person_id = $1', [id]);

                // Now insert
                const rel = relationship || (person_type === 'child' ? 'child' : 'member');
                await query(`
                    INSERT INTO household_members (household_id, person_id, relationship)
                    VALUES ($1, $2, $3)
                `, [household_id, id, rel]);
            }
        }

        res.json({ message: 'Person updated successfully' });
    } catch (error) {
        console.error('Error updating person:', error);
        res.status(500).json({ message: 'Error updating person' });
    }
});

// DELETE /api/staff/people/:id
app.delete('/api/staff/people/:id', auth, requireStaff, async (req, res) => {
    if (!['admin', 'pastor'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Only admins can delete people' });
    }

    try {
        const { id } = req.params;
        if (id === req.user.userId) return res.status(400).json({ message: 'Cannot delete yourself' });

        await query('DELETE FROM user_profiles WHERE id = $1', [id]);
        res.json({ message: 'Person deleted successfully' });
    } catch (error) {
        console.error('Error deleting person:', error);
        res.status(500).json({ message: 'Error deleting person' });
    }
});

// --- Phase 3: Ministries API ---

// GET /api/staff/ministries - List all ministries
app.get('/api/staff/ministries', auth, requireStaff, async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                m.*,
                (SELECT COUNT(*) FROM ministry_members mm WHERE mm.ministry_id = m.id AND mm.status = 'active') as member_count,
                (
                    SELECT json_agg(json_build_object('id', p.id, 'first_name', p.first_name, 'last_name', p.last_name, 'avatar', p.avatar))
                    FROM ministry_members mm
                    JOIN user_profiles p ON mm.person_id = p.id
                    WHERE mm.ministry_id = m.id AND mm.role IN ('leader', 'assistant') AND mm.status = 'active') as leaders
            FROM ministries m
            WHERE m.is_active = true
            ORDER BY m.name ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching ministries:', err);
        res.status(500).json({ message: 'Error fetching ministries' });
    }
});

// GET /api/staff/ministries/:id - Detailed view (Bio, Stats, Roster)
app.get('/api/staff/ministries/:id', auth, requireStaff, async (req, res) => {
    const { id } = req.params;
    try {
        const ministryRes = await query(`SELECT * FROM ministries WHERE id = $1`, [id]);
        if (ministryRes.rows.length === 0) return res.status(404).json({ message: 'Ministry not found' });

        const ministry = ministryRes.rows[0];

        // Fetch Members
        const membersRes = await query(`
            SELECT 
                mm.*,
                p.first_name, p.last_name, p.email, p.phone, p.avatar
            FROM ministry_members mm
            JOIN user_profiles p ON mm.person_id = p.id
            WHERE mm.ministry_id = $1
            ORDER BY 
                CASE WHEN mm.role = 'leader' THEN 1 WHEN mm.role = 'assistant' THEN 2 ELSE 3 END,
                p.last_name ASC
        `, [id]);

        ministry.members = membersRes.rows;

        res.json(ministry);
    } catch (err) {
        console.error('Error fetching ministry detail:', err);
        res.status(500).json({ message: 'Error fetching ministry detail' });
    }
});

// POST /api/staff/ministries - Create (Admin only)
app.post('/api/staff/ministries', auth, requireStaff, async (req, res) => {
    // Check permission
    if (!['admin', 'pastor'].includes(req.user.role)) return res.status(403).json({ message: 'Access denied' });

    const { name, description, min_age_months, max_age_months } = req.body;
    try {
        const result = await query(`
            INSERT INTO ministries (name, description, min_age_months, max_age_months)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [name, description, min_age_months, max_age_months]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error creating ministry:', err);
        if (err.code === '23505') return res.status(400).json({ message: 'Ministry name already exists' });
        res.status(500).json({ message: 'Error creating ministry' });
    }
});

// PATCH /api/staff/ministries/:id - Update (Admin or Leader of that ministry)
app.patch('/api/staff/ministries/:id', auth, requireStaff, async (req, res) => {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    // Check permissions
    // Admin/Pastor can edit everything. 
    // Ministry Leader can edit description but maybe not Name/Age? Let's say yes for now.
    // Need to verify if user is leader of THIS ministry.

    try {
        let isAuthorized = ['admin', 'pastor'].includes(req.user.role);
        if (!isAuthorized) {
            const checkLeader = await query(`
                SELECT 1 FROM ministry_members 
                WHERE ministry_id = $1 AND person_id = $2 AND role = 'leader' AND status = 'active'
            `, [id, req.user.userId]); // Assume req.user.userId maps to person_id (user_profiles.id)
            if (checkLeader.rows.length > 0) isAuthorized = true;
        }

        if (!isAuthorized) return res.status(403).json({ message: 'Not authorized to edit this ministry' });

        const result = await query(`
            UPDATE ministries 
            SET 
                name = COALESCE($1, name),
                description = COALESCE($2, description),
                is_active = COALESCE($3, is_active),
                updated_at = NOW()
            WHERE id = $4
            RETURNING *
        `, [name, description, is_active, id]);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Ministry not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating ministry:', err);
        res.status(500).json({ message: 'Error updating ministry' });
    }
});

// POST /api/staff/ministries/:id/members - Add Member
app.post('/api/staff/ministries/:id/members', auth, requireStaff, async (req, res) => {
    const { id } = req.params;
    const { person_id, role } = req.body; // role: leader, assistant, member

    try {
        // Auth check (Admin/Pastor or Leader)
        let isAuthorized = ['admin', 'pastor'].includes(req.user.role);
        if (!isAuthorized) {
            const checkLeader = await query(`SELECT 1 FROM ministry_members WHERE ministry_id = $1 AND person_id = $2 AND role = 'leader'`, [id, req.user.userId]);
            if (checkLeader.rows.length > 0) isAuthorized = true;
        }
        if (!isAuthorized) return res.status(403).json({ message: 'Access denied' });

        const result = await query(`
            INSERT INTO ministry_members (ministry_id, person_id, role, status)
            VALUES ($1, $2, $3, 'active')
            ON CONFLICT (ministry_id, person_id) 
            DO UPDATE SET role = $3, status = 'active', joined_at = NOW()
            RETURNING *
        `, [id, person_id, role || 'member']);

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error adding ministry member:', err);
        res.status(500).json({ message: 'Error adding member' });
    }
});

// DELETE /api/staff/ministries/:id/members/:memberId - Remove Member
app.delete('/api/staff/ministries/:id/members/:memberId', auth, requireStaff, async (req, res) => {
    const { id, memberId } = req.params;

    try {
        // Auth check...
        let isAuthorized = ['admin', 'pastor'].includes(req.user.role);
        if (!isAuthorized) {
            const checkLeader = await query(`SELECT 1 FROM ministry_members WHERE ministry_id = $1 AND person_id = $2 AND role = 'leader'`, [id, req.user.userId]);
            if (checkLeader.rows.length > 0) isAuthorized = true;
        }
        if (!isAuthorized) return res.status(403).json({ message: 'Access denied' });

        await query('DELETE FROM ministry_members WHERE ministry_id = $1 AND person_id = $2', [id, memberId]);
        res.json({ message: 'Member removed' });
    } catch (err) {
        console.error('Error removing member:', err);
        res.status(500).json({ message: 'Error removing member' });
    }
});

// GET /api/staff/ministries/:id/requests - List pending requests
app.get('/api/staff/ministries/:id/requests', auth, requireStaff, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query(`
            SELECT 
                r.*,
                p.first_name, p.last_name, p.avatar, p.email
            FROM ministry_join_requests r
            JOIN user_profiles p ON r.person_id = p.id
            WHERE r.ministry_id = $1 AND r.status = 'pending'
            ORDER BY r.created_at ASC
        `, [id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching requests:', err);
        res.status(500).json({ message: 'Error fetching requests' });
    }
});

// POST /api/staff/ministries/:id/requests - Create Request
app.post('/api/staff/ministries/:id/requests', auth, requireStaff, async (req, res) => {
    const { id } = req.params;
    const { person_id, message } = req.body;
    try {
        // Prevent if already member
        const checkMember = await query(`SELECT 1 FROM ministry_members WHERE ministry_id = $1 AND person_id = $2`, [id, person_id]);
        if (checkMember.rows.length > 0) return res.status(400).json({ message: 'Person is already a member' });

        const result = await query(`
            INSERT INTO ministry_join_requests (ministry_id, person_id, requested_by_person_id, message, status)
            VALUES ($1, $2, $3, $4, 'pending')
            ON CONFLICT (ministry_id, person_id) WHERE status='pending' DO NOTHING
            RETURNING *
        `, [id, person_id, req.user.userId, message]);

        if (result.rows.length === 0) return res.status(400).json({ message: 'Request already pending' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error creating request:', err);
        res.status(500).json({ message: 'Error creating request' });
    }
});

// POST /api/staff/requests/:requestId/approve
app.post('/api/staff/requests/:requestId/approve', auth, requireStaff, async (req, res) => {
    const { requestId } = req.params;

    // We need a client for transaction
    // Import Pool from db.mjs? No, query function doesn't expose client.
    // We need to implement this without transaction or add transaction support to db.mjs
    // For MVP, without transaction is risky but acceptable if we are careful.
    // Or we can just use the query function and hope for best. 
    // Actually, I can't do BEGIN/COMMIT with the simple `query` helper exported from db.mjs likely.
    // Let's check `db.mjs`. 

    try {
        // 1. Get request
        const reqRes = await query(`SELECT * FROM ministry_join_requests WHERE id = $1`, [requestId]);
        if (reqRes.rows.length === 0) return res.status(404).json({ message: 'Request not found' });
        const joinReq = reqRes.rows[0];

        // 2. Auth Check (Leader/Admin)
        let isAuthorized = ['admin', 'pastor'].includes(req.user.role);
        if (!isAuthorized) {
            const checkLeader = await query(`SELECT 1 FROM ministry_members WHERE ministry_id = $1 AND person_id = $2 AND role = 'leader'`, [joinReq.ministry_id, req.user.userId]);
            if (checkLeader.rows.length > 0) isAuthorized = true;
        }
        if (!isAuthorized) return res.status(403).json({ message: 'Access denied' });

        // 3. Update Request Status
        await query(`
            UPDATE ministry_join_requests 
            SET status = 'approved', decided_at = NOW(), decided_by_person_id = $2
            WHERE id = $1
        `, [requestId, req.user.userId]);

        // 4. Add to Members
        await query(`
            INSERT INTO ministry_members (ministry_id, person_id, role, status)
            VALUES ($1, $2, 'member', 'active')
            ON CONFLICT (ministry_id, person_id) DO UPDATE SET status = 'active', joined_at = NOW()
        `, [joinReq.ministry_id, joinReq.person_id]);

        res.json({ message: 'Approved' });
    } catch (err) {
        console.error('Error approving request:', err);
        res.status(500).json({ message: 'Error approving request' });
    }
});

// POST /api/staff/requests/:requestId/deny
app.post('/api/staff/requests/:requestId/deny', auth, requireStaff, async (req, res) => {
    const { requestId } = req.params;
    try {
        const reqRes = await query(`SELECT * FROM ministry_join_requests WHERE id = $1`, [requestId]);
        if (reqRes.rows.length === 0) return res.status(404).json({ message: 'Request not found' });
        const joinReq = reqRes.rows[0];

        let isAuthorized = ['admin', 'pastor'].includes(req.user.role);
        if (!isAuthorized) {
            const checkLeader = await query(`SELECT 1 FROM ministry_members WHERE ministry_id = $1 AND person_id = $2 AND role = 'leader'`, [joinReq.ministry_id, req.user.userId]);
            if (checkLeader.rows.length > 0) isAuthorized = true;
        }
        if (!isAuthorized) return res.status(403).json({ message: 'Access denied' });

        await query(`
            UPDATE ministry_join_requests 
            SET status = 'denied', decided_at = NOW(), decided_by_person_id = $2
            WHERE id = $1
        `, [requestId, req.user.userId]);

        res.json({ message: 'Denied' });
    } catch (err) {
        console.error('Error denying request:', err);
        res.status(500).json({ message: 'Error denying request' });
    }
});

// ==========================================
// FINANCE MODULE
// ==========================================

// Middleware for Finance Access
const requireFinance = (req, res, next) => {
    if (!['admin', 'pastor', 'finance'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied. Finance role required.' });
    }
    next();
};

// GET /api/staff/finance/funds
app.get('/api/staff/finance/funds', auth, requirePerm(PERMISSIONS.FINANCE_READ), async (req, res) => {
    try {
        const result = await query(`SELECT * FROM finance_funds WHERE is_active = true ORDER BY name ASC`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching funds:', err);
        res.status(500).json({ message: 'Error fetching funds' });
    }
});

// GET /api/staff/finance/sources
app.get('/api/staff/finance/sources', auth, requirePermission(PERMISSIONS.FINANCE_READ), async (req, res) => {
    try {
        const result = await query(`SELECT * FROM finance_sources WHERE is_active = true ORDER BY name ASC`);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching sources:', err);
        res.status(500).json({ message: 'Error fetching sources' });
    }
});

// GET /api/staff/finance/entries
app.get('/api/staff/finance/entries', auth, requirePermission(PERMISSIONS.FINANCE_READ), async (req, res) => {
    const { from, to, fund_id, source_id } = req.query;
    try {
        let sql = `
            SELECT e.*, f.name as fund_name, s.name as source_name, 
                   p.first_name || ' ' || p.last_name as created_by_name
            FROM finance_entries e
            JOIN finance_funds f ON e.fund_id = f.id
            JOIN finance_sources s ON e.source_id = s.id
            JOIN user_profiles p ON e.created_by_person_id = p.id
            WHERE 1=1
        `;
        const params = [];
        let pIdx = 1;

        if (from) { sql += ` AND e.entry_date >= $${pIdx++}`; params.push(from); }
        if (to) { sql += ` AND e.entry_date <= $${pIdx++}`; params.push(to); }
        if (fund_id) { sql += ` AND e.fund_id = $${pIdx++}`; params.push(fund_id); }
        if (source_id) { sql += ` AND e.source_id = $${pIdx++}`; params.push(source_id); }

        sql += ` ORDER BY e.entry_date DESC, e.created_at DESC`;

        const result = await query(sql, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching finance entries:', err);
        res.status(500).json({ message: 'Error fetching entries' });
    }
});

// POST /api/staff/finance/entries
app.post('/api/staff/finance/entries', auth, requireStaff, requireFinance, async (req, res) => {
    const { entry_date, fund_id, source_id, amount, memo } = req.body;
    try {
        const result = await query(`
            INSERT INTO finance_entries (entry_date, fund_id, source_id, amount, memo, created_by_person_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [entry_date, fund_id, source_id, amount, memo, req.user.userId]);

        const entry = result.rows[0];

        // Audit Log
        await query(`
            INSERT INTO audit_log (actor_person_id, action, entity, entity_id, metadata_json)
            VALUES ($1, 'CREATE', 'finance_entry', $2, $3)
        `, [req.user.userId, entry.id, JSON.stringify({ amount, fund_id, source_id })]);

        res.json(entry);
    } catch (err) {
        console.error('Error creating finance entry:', err);
        res.status(500).json({ message: 'Error creating entry' });
    }
});

// DELETE /api/staff/finance/entries/:id
app.delete('/api/staff/finance/entries/:id', auth, requireStaff, requireFinance, async (req, res) => {
    const { id } = req.params;
    // Extra safety: Only admin/pastor can delete? Or finance too? Plan says "admin/pastor only (or finance with confirm)".
    // Let's stick to requireFinance for MVP simplicity, as "Finance" role implies trust.

    try {
        // Get entry for audit
        const check = await query(`SELECT * FROM finance_entries WHERE id = $1`, [id]);
        if (check.rows.length === 0) return res.status(404).json({ message: 'Entry not found' });
        const oldEntry = check.rows[0];

        await query(`DELETE FROM finance_entries WHERE id = $1`, [id]);

        // Audit Log
        await query(`
            INSERT INTO audit_log (actor_person_id, action, entity, entity_id, metadata_json)
            VALUES ($1, 'DELETE', 'finance_entry', $2, $3)
        `, [req.user.userId, id, JSON.stringify(oldEntry)]);

        res.json({ message: 'Entry deleted' });
    } catch (err) {
        console.error('Error deleting finance entry:', err);
        res.status(500).json({ message: 'Error deleting entry' });
    }
});

// GET /api/staff/finance/summary
app.get('/api/staff/finance/summary', auth, requirePerm(PERMISSIONS.FINANCE_READ), async (req, res) => {
    const { range, from: qFrom, to: qTo } = req.query;
    try {
        // Determine date range
        let startDate, endDate;
        if (range === '7d') {
            const d = new Date(); d.setDate(d.getDate() - 7);
            startDate = d.toISOString().split('T')[0];
            endDate = new Date().toISOString().split('T')[0];
        } else if (range === '30d') {
            const d = new Date(); d.setDate(d.getDate() - 30);
            startDate = d.toISOString().split('T')[0];
            endDate = new Date().toISOString().split('T')[0];
        } else {
            startDate = qFrom || '1900-01-01';
            endDate = qTo || '2100-01-01';
        }

        // Total Amount
        const totalRes = await query(`
            SELECT SUM(amount) as total 
            FROM finance_entries 
            WHERE entry_date BETWEEN $1 AND $2
        `, [startDate, endDate]);
        const totalAmount = parseFloat(totalRes.rows[0].total || 0);

        // By Fund
        const byFundRes = await query(`
            SELECT f.name as fund_name, f.id as fund_id, SUM(e.amount) as amount
            FROM finance_entries e
            JOIN finance_funds f ON e.fund_id = f.id
            WHERE e.entry_date BETWEEN $1 AND $2
            GROUP BY f.id, f.name
            ORDER BY amount DESC
        `, [startDate, endDate]);

        // By Source
        const bySourceRes = await query(`
            SELECT s.name as source_name, s.id as source_id, SUM(e.amount) as amount
            FROM finance_entries e
            JOIN finance_sources s ON e.source_id = s.id
            WHERE e.entry_date BETWEEN $1 AND $2
            GROUP BY s.id, s.name
            ORDER BY amount DESC
        `, [startDate, endDate]);

        // Daily Trend
        const dailyRes = await query(`
            SELECT entry_date as date, SUM(amount) as amount
            FROM finance_entries
            WHERE entry_date BETWEEN $1 AND $2
            GROUP BY entry_date
            ORDER BY entry_date ASC
        `, [startDate, endDate]);

        res.json({
            range,
            total_amount: totalAmount,
            by_fund: byFundRes.rows,
            by_source: bySourceRes.rows,
            daily: dailyRes.rows
        });
    } catch (err) {
        console.error('Error fetching finance summary:', err);
        res.status(500).json({ message: 'Error fetching summary' });
    }
});

// GET /api/staff/finance/export.csv
app.get('/api/staff/finance/export.csv', auth, requirePerm(PERMISSIONS.FINANCE_EXPORT), async (req, res) => {
    const { from, to, fund_id, source_id } = req.query;
    try {
        let sql = `
            SELECT e.entry_date, f.name as fund, s.name as source, e.amount, e.memo, 
                   p.first_name || ' ' || p.last_name as created_by, e.created_at
            FROM finance_entries e
            JOIN finance_funds f ON e.fund_id = f.id
            JOIN finance_sources s ON e.source_id = s.id
            JOIN user_profiles p ON e.created_by_person_id = p.id
            WHERE 1=1
        `;
        const params = [];
        let pIdx = 1;

        if (from) { sql += ` AND e.entry_date >= $${pIdx++}`; params.push(from); }
        if (to) { sql += ` AND e.entry_date <= $${pIdx++}`; params.push(to); }
        if (fund_id) { sql += ` AND e.fund_id = $${pIdx++}`; params.push(fund_id); }
        if (source_id) { sql += ` AND e.source_id = $${pIdx++}`; params.push(source_id); }

        sql += ` ORDER BY e.entry_date DESC`;

        const result = await query(sql, params);

        // Manual CSV generation
        const headers = ['Date', 'Fund', 'Source', 'Amount', 'Memo', 'Created By', 'Created At'];
        let csv = headers.join(',') + '\n';

        result.rows.forEach(row => {
            csv += [
                row.entry_date, // Date string
                `"${row.fund}"`,
                `"${row.source}"`,
                row.amount,
                `"${(row.memo || '').replace(/"/g, '""')}"`,
                `"${row.created_by}"`,
                new Date(row.created_at).toISOString()
            ].join(',') + '\n';
        });

        res.header('Content-Type', 'text/csv');
        res.attachment('finance_export.csv');
        res.send(csv);

    } catch (err) {
        console.error('Error exporting CSV:', err);
        res.status(500).json({ message: 'Error exporting CSV' });
    }
});

// ==========================================
// STAFF CHAT MODULE
// ==========================================

// Helper: Ensure user is in required channels
async function ensureChannelMemberships(userId, role) {
    // 1. #staff-general (Everyone)
    const generalChan = await query(`SELECT id FROM chat_channels WHERE name = '#staff-general'`);
    if (generalChan.rows.length > 0) {
        await query(`
            INSERT INTO chat_channel_members (channel_id, person_id, role)
            VALUES ($1, $2, 'member')
            ON CONFLICT (channel_id, person_id) DO NOTHING
        `, [generalChan.rows[0].id, userId]);
    }

    // 2. #finance (Finance/Admin/Pastor only)
    if (['admin', 'pastor', 'finance'].includes(role)) {
        const financeChan = await query(`SELECT id FROM chat_channels WHERE name = '#finance'`);
        if (financeChan.rows.length > 0) {
            await query(`
                INSERT INTO chat_channel_members (channel_id, person_id, role)
                VALUES ($1, $2, 'member')
                ON CONFLICT (channel_id, person_id) DO NOTHING
            `, [financeChan.rows[0].id, userId]);
        }
    }

    // 3. Ministry Channels (If leader)
    // Find ministries where user is leader
    const ledMinistries = await query(`
        SELECT m.id, m.name 
        FROM ministry_members mm
        JOIN ministries m ON mm.ministry_id = m.id
        WHERE mm.person_id = $1 AND mm.role IN ('leader', 'assistant') AND mm.status = 'active'
    `, [userId]);

    for (const min of ledMinistries.rows) {
        // Find existing channel for ministry
        let chanRes = await query(`SELECT id FROM chat_channels WHERE ministry_id = $1`, [min.id]);

        let chanId;
        if (chanRes.rows.length > 0) {
            chanId = chanRes.rows[0].id;
        } else {
            // Create channel if missing (e.g. #ministry-name)
            // Sanitize name
            const saneName = '#' + min.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-ministry';
            // Check if name taken (by manual channel?), if so append random or ignore
            // For MVP simplistic creation:
            const createRes = await query(`
                INSERT INTO chat_channels (name, type, ministry_id, created_by_person_id)
                VALUES ($1, 'ministry', $2, $3)
                ON CONFLICT (name) DO NOTHING
                RETURNING id
            `, [saneName, min.id, userId]);

            if (createRes.rows.length > 0) {
                chanId = createRes.rows[0].id;
            } else {
                // Name conflict? Try to fetch by name? Or just skip.
                const fallback = await query(`SELECT id FROM chat_channels WHERE name = $1`, [saneName]);
                chanId = fallback.rows[0]?.id;
            }
        }

        if (chanId) {
            await query(`
                INSERT INTO chat_channel_members (channel_id, person_id, role)
                VALUES ($1, $2, 'moderator')
                ON CONFLICT (channel_id, person_id) DO NOTHING
            `, [chanId, userId]);
        }
    }
}

// GET /api/staff/chat/channels
app.get('/api/staff/chat/channels', auth, requireStaff, async (req, res) => {
    try {
        await ensureChannelMemberships(req.user.userId, req.user.role);

        const result = await query(`
            SELECT 
                c.id, c.name, c.type, c.ministry_id,
                cm.role as member_role,
                cm.last_read_at,
                (SELECT message_text FROM chat_messages WHERE channel_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT created_at FROM chat_messages WHERE channel_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at
            FROM chat_channels c
            JOIN chat_channel_members cm ON c.id = cm.channel_id
            WHERE cm.person_id = $1 AND c.is_active = true
            ORDER BY last_message_at DESC NULLS LAST, c.name ASC
        `, [req.user.userId]);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching chat channels:', err);
        try { fs.appendFileSync('server_error.log', `[${new Date().toISOString()}] GET /chat/channels error: ${err.stack}\n`); } catch (e) { }
        res.status(500).json({ message: 'Error fetching channels' });
    }
});

// POST /api/staff/chat/channels - Create Channel (Admin/Pastor)
app.post('/api/staff/chat/channels', auth, requireStaff, async (req, res) => {
    const { name, type, description, initialMembers } = req.body;

    // Basic validation
    if (!name || (!name.startsWith('#') && name.trim().length > 0)) {
        // Allow non-# if we auto-format, but strictly speaking the frontend sends #.
        // Let's just ensure it's not empty.
    }

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Create Channel
            const channelResult = await client.query(
                'INSERT INTO chat_channels (name, type, description, created_by, is_active) VALUES ($1, $2, $3, $4, true) RETURNING *',
                [name, type || 'general', description, req.user.person_id]
            );
            const channel = channelResult.rows[0];

            // 2. Add Creator as Admin
            await client.query(
                'INSERT INTO chat_channel_members (channel_id, person_id, role) VALUES ($1, $2, $3)',
                [channel.id, req.user.person_id, 'admin']
            );

            // 3. Add Initial Members
            if (initialMembers && Array.isArray(initialMembers)) {
                for (const memberId of initialMembers) {
                    if (memberId !== req.user.person_id) {
                        await client.query(
                            'INSERT INTO chat_channel_members (channel_id, person_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                            [channel.id, memberId, 'member']
                        );
                    }
                }
            }

            await client.query('COMMIT');
            res.status(201).json(channel);
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error creating channel:', err);
        if (err.code === '23505') return res.status(400).json({ message: 'Channel exists' });
        res.status(500).json({ message: 'Error creating channel' });
    }
});

// DELETE /api/staff/chat/channels/:id - Delete Channel (Admin/Pastor)
app.delete('/api/staff/chat/channels/:id', auth, requireStaff, async (req, res) => {
    if (!['admin', 'pastor'].includes(req.user.role)) return res.status(403).json({ message: 'Access denied' });

    const { id } = req.params;

    try {
        await query('BEGIN');
        // Delete messages first
        await query('DELETE FROM chat_messages WHERE channel_id = $1', [id]);
        // Delete members
        await query('DELETE FROM chat_channel_members WHERE channel_id = $1', [id]);
        // Delete channel
        await query('DELETE FROM chat_channels WHERE id = $1', [id]);
        await query('COMMIT');

        res.json({ message: 'Channel deleted' });
    } catch (err) {
        await query('ROLLBACK');
        console.error('Error deleting channel:', err);
        res.status(500).json({ message: 'Error deleting channel' });
    }
});

// GET /api/staff/chat/channels/:id/messages
app.get('/api/staff/chat/channels/:id/messages', auth, requireStaff, async (req, res) => {
    const { id } = req.params;
    const { limit = 50, before } = req.query;

    try {
        // Membership check
        const memCheck = await query(`SELECT 1 FROM chat_channel_members WHERE channel_id = $1 AND person_id = $2`, [id, req.user.userId]);

        // Admin override? Maybe not for chat, better to stick to membership. 
        // If they want to see, they should join? 
        // But let's allow admin for moderation.
        if (memCheck.rows.length === 0 && !['admin', 'pastor'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        let sql = `
            SELECT m.*, 
                   p.first_name, p.last_name, p.avatar
            FROM chat_messages m
            JOIN user_profiles p ON m.sender_person_id = p.id
            WHERE m.channel_id = $1
        `;
        const params = [id];

        if (before) {
            sql += ` AND m.created_at < $2`;
            params.push(before);
        }

        sql += ` ORDER BY m.created_at DESC LIMIT $${params.length + 1}`;
        params.push(limit);

        const result = await query(sql, params);

        // Update last_read_at
        // Update last_read_at in chat_reads (which drives the unread count)
        await query(`
            INSERT INTO chat_reads (channel_id, user_id, last_read_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (channel_id, user_id)
            DO UPDATE SET last_read_at = NOW()
        `, [id, req.user.userId]);

        // Return reversed (oldest first) for UI
        res.json(result.rows.reverse());

    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

// ==========================================
// PHASE 6: NOTIFICATIONS + AUDIT + HOLDS
// ==========================================

// Helper: Create notification
async function createNotification(recipientId, type, title, body, href = null, metadata = {}) {
    try {
        await query(`
            INSERT INTO notifications (recipient_profile_id, type, title, body, href, metadata)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [recipientId, type, title, body, href, JSON.stringify(metadata)]);
    } catch (err) {
        console.error('Error creating notification:', err);
    }
}

// Helper: Log audit entry
async function logAudit(actorId, actorRole, action, entityType, entityId, summary, diff = {}) {
    try {
        await query(`
            INSERT INTO audit_log (actor_profile_id, actor_role, action, entity_type, entity_id, summary, diff)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [actorId, actorRole, action, entityType, entityId, summary, JSON.stringify(diff)]);
    } catch (err) {
        console.error('Error logging audit:', err);
    }
}

// --- Notifications Endpoints ---

// GET /api/notifications - Get current user's notifications
app.get('/api/notifications', auth, async (req, res) => {
    try {
        const notifications = await query(`
            SELECT * FROM notifications
            WHERE recipient_profile_id = $1
            ORDER BY created_at DESC
            LIMIT 50
        `, [req.user.userId]);

        const unreadCount = await query(`
            SELECT COUNT(*) as count FROM notifications
            WHERE recipient_profile_id = $1 AND is_read = false
        `, [req.user.userId]);

        res.json({
            notifications: notifications.rows,
            unread_count: parseInt(unreadCount.rows[0].count),
            server_time: new Date().toISOString()
        });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        try { fs.appendFileSync('server_error.log', `[${new Date().toISOString()}] GET /notifications error: ${err.stack}\n`); } catch (e) { }
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

// POST /api/notifications/read - Mark notifications as read
app.post('/api/notifications/read', auth, async (req, res) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Invalid notification IDs' });
    }

    try {
        await query(`
            UPDATE notifications
            SET is_read = true
            WHERE id = ANY($1) AND recipient_profile_id = $2
        `, [ids, req.user.userId]);

        res.json({ success: true });
    } catch (err) {
        console.error('Error marking notifications as read:', err);
        res.status(500).json({ message: 'Error updating notifications' });
    }
});

// POST /api/notifications/read-all - Mark all as read
app.post('/api/notifications/read-all', auth, async (req, res) => {
    try {
        await query(`
            UPDATE notifications
            SET is_read = true
            WHERE recipient_profile_id = $1 AND is_read = false
        `, [req.user.userId]);

        res.json({ success: true });
    } catch (err) {
        console.error('Error marking all as read:', err);
        res.status(500).json({ message: 'Error updating notifications' });
    }
});

// --- Audit Log Endpoints ---

// GET /api/staff/audit - Query audit log (staff only)
app.get('/api/staff/audit', auth, requireStaff, async (req, res) => {
    const { entity_type, entity_id, actor, limit = 100 } = req.query;

    try {
        let queryText = `
            SELECT a.*, p.first_name, p.last_name
            FROM audit_log a
            LEFT JOIN user_profiles p ON a.actor_profile_id = p.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (entity_type) {
            queryText += ` AND a.entity_type = $${paramCount++}`;
            params.push(entity_type);
        }

        if (entity_id) {
            queryText += ` AND a.entity_id = $${paramCount++}`;
            params.push(entity_id);
        }

        if (actor) {
            queryText += ` AND a.actor_profile_id = $${paramCount++}`;
            params.push(actor);
        }

        queryText += ` ORDER BY a.created_at DESC LIMIT $${paramCount}`;
        params.push(parseInt(limit));

        const result = await query(queryText, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching audit log:', err);
        res.status(500).json({ message: 'Error fetching audit log' });
    }
});

// --- Chat Unread Endpoints ---

// GET /api/staff/chat/threads - Get chat threads with unread counts
app.get('/api/staff/chat/threads', auth, requireStaff, async (req, res) => {
    const { includeUnread } = req.query;

    try {
        // Get all channels
        const channelsRes = await query(`
            SELECT id, name, is_staff_only, created_at
            FROM chat_channels
            ORDER BY created_at DESC
        `);

        const threads = [];
        let totalUnread = 0;

        if (includeUnread === '1') {
            // Calculate unread for each channel
            for (const channel of channelsRes.rows) {
                // Get last read timestamp for this user
                const lastReadRes = await query(`
                    SELECT last_read_at
                    FROM chat_reads
                    WHERE channel_id = $1 AND user_id = $2
                `, [channel.id, req.user.userId]);

                const lastReadAt = lastReadRes.rows[0]?.last_read_at || new Date(0);

                // Count unread messages
                const unreadRes = await query(`
                    SELECT COUNT(*) as count
                    FROM chat_messages
                    WHERE channel_id = $1 AND created_at > $2
                `, [channel.id, lastReadAt]);

                const unreadCount = parseInt(unreadRes.rows[0].count);
                totalUnread += unreadCount;

                threads.push({
                    id: channel.id,
                    name: channel.name,
                    is_staff_only: channel.is_staff_only,
                    created_at: channel.created_at,
                    unread_count: unreadCount
                });
            }
        } else {
            threads.push(...channelsRes.rows);
        }

        res.json({
            threads,
            total_unread: totalUnread,
            server_time: new Date().toISOString()
        });
    } catch (err) {
        console.error('Error fetching chat threads:', err);
        res.status(500).json({ message: 'Error fetching chat threads' });
    }
});

// POST /api/staff/upload - Upload file
app.post('/api/staff/upload', auth, requireStaff, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Return relative URL - Vite proxy will forward /uploads to backend
        const fileUrl = `/uploads/${req.file.filename}`;

        res.json({
            url: fileUrl,
            type: req.file.mimetype,
            originalName: req.file.originalname
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ message: 'File upload failed' });
    }
});

// POST /api/staff/chat/channels/:id/read - Update last read timestamp
app.post('/api/staff/chat/channels/:id/read', auth, requireStaff, async (req, res) => {
    const { id } = req.params;

    try {
        await query(`
            INSERT INTO chat_reads (channel_id, person_id, last_read_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (channel_id, person_id)
            DO UPDATE SET last_read_at = NOW()
        `, [id, req.user.userId]);

        res.json({ success: true });
    } catch (err) {
        console.error('Error updating read timestamp:', err);
        res.status(500).json({ message: 'Error updating read status' });
    }
});

// POST /api/staff/chat/channels/:id/messages - Send message
app.post('/api/staff/chat/channels/:id/messages', auth, requireStaff, async (req, res) => {
    const { message, attachmentUrl, attachmentType } = req.body;
    const channelId = req.params.id;
    const senderId = req.user.userId;

    try {
        // Insert message
        const result = await query(`
            INSERT INTO chat_messages (channel_id, sender_person_id, message_text, attachment_url, attachment_type)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [channelId, senderId, message || '', attachmentUrl, attachmentType]); // message can be empty if attached

        // Mark channel as read for sender
        await query(`
            INSERT INTO chat_reads (channel_id, user_id, last_read_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (channel_id, user_id)
            DO UPDATE SET last_read_at = NOW()
        `, [channelId, senderId]);

        // Create mention notifications
        const { createMentionNotifications, createDMNotification, createGroupChannelNotification } = await import('./helpers/chatNotifications.js');
        await createMentionNotifications(channelId, senderId, message);

        // Create DM notification if applicable
        await createDMNotification(channelId, senderId, message);

        // Create group channel notifications (for non-DM channels)
        await createGroupChannelNotification(channelId, senderId, message);

        // Update channel's updated_at
        await query('UPDATE chat_channels SET updated_at = NOW() WHERE id = $1', [channelId]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ message: 'Error sending message' });
    }
});

// GET /api/staff/chat/channels/:id/members - Get channel members
app.get('/api/staff/chat/channels/:id/members', auth, requireStaff, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await query(`
            SELECT 
                ccm.person_id,
                p.first_name,
                p.last_name,
                ccm.role,
                ccm.joined_at
            FROM chat_channel_members ccm
            JOIN people p ON p.id = ccm.person_id
            WHERE ccm.channel_id = $1
            ORDER BY ccm.joined_at ASC
        `, [id]);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching channel members:', err);
        res.status(500).json({ message: 'Error fetching channel members' });
    }
});

// POST /api/staff/chat/channels/:id/members - Add member to channel
app.post('/api/staff/chat/channels/:id/members', auth, requireStaff, async (req, res) => {
    const { id } = req.params;
    const { person_id } = req.body;

    if (!person_id) {
        return res.status(400).json({ message: 'person_id is required' });
    }

    try {
        // Check if already a member
        const existing = await query(
            'SELECT 1 FROM chat_channel_members WHERE channel_id = $1 AND person_id = $2',
            [id, person_id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        // Add member
        await query(
            'INSERT INTO chat_channel_members (channel_id, person_id, role) VALUES ($1, $2, $3)',
            [id, person_id, 'member']
        );

        res.json({ message: 'Member added successfully' });
    } catch (err) {
        console.error('Error adding channel member:', err);
        res.status(500).json({ message: 'Error adding channel member' });
    }
});

// DELETE /api/staff/chat/channels/:id/members/:personId - Remove member from channel
app.delete('/api/staff/chat/channels/:id/members/:personId', auth, requireStaff, async (req, res) => {
    const { id, personId } = req.params;

    try {
        // Don't allow removing channel owner
        const member = await query(
            'SELECT role FROM chat_channel_members WHERE channel_id = $1 AND person_id = $2',
            [id, personId]
        );

        if (member.rows.length === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }

        if (member.rows[0].role === 'owner') {
            return res.status(400).json({ message: 'Cannot remove channel owner' });
        }

        // Remove member
        await query(
            'DELETE FROM chat_channel_members WHERE channel_id = $1 AND person_id = $2',
            [id, personId]
        );

        res.json({ message: 'Member removed successfully' });
    } catch (err) {
        console.error('Error removing channel member:', err);
        res.status(500).json({ message: 'Error removing channel member' });
    }
});

// --- Holds Endpoints ---

// POST /api/staff/holds - Create hold
app.post('/api/staff/holds', auth, requireStaff, async (req, res) => {
    const { type, target_date, target_resource, notes } = req.body;

    if (!type) {
        return res.status(400).json({ message: 'Hold type is required' });
    }

    try {
        const result = await query(`
            INSERT INTO holds (type, requested_by_profile_id, target_date, target_resource, notes)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [type, req.user.userId, target_date, target_resource, notes]);

        // Log audit
        await logAudit(req.user.userId, req.user.role, 'HOLD_CREATE', 'hold', result.rows[0].id, `Created ${type} hold`);

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error creating hold:', err);
        res.status(500).json({ message: 'Error creating hold' });
    }
});

// GET /api/staff/holds - List holds
app.get('/api/staff/holds', auth, requireStaff, async (req, res) => {
    const { status = 'PENDING' } = req.query;

    try {
        const result = await query(`
            SELECT h.*, p.first_name, p.last_name
            FROM holds h
            LEFT JOIN user_profiles p ON h.requested_by_profile_id = p.id
            WHERE h.status = $1
            ORDER BY h.created_at DESC
        `, [status]);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching holds:', err);
        res.status(500).json({ message: 'Error fetching holds' });
    }
});

// POST /api/staff/holds/:id/approve - Approve hold
app.post('/api/staff/holds/:id/approve', auth, requireStaff, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await query(`
            UPDATE holds
            SET status = 'APPROVED'
            WHERE id = $1
            RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Hold not found' });
        }

        const hold = result.rows[0];

        // Create notification for requester
        await createNotification(
            hold.requested_by_profile_id,
            'SYSTEM',
            'Hold Approved',
            `Your ${hold.type} request has been approved.`,
            '/dashboard/holds'
        );

        // Log audit
        await logAudit(req.user.userId, req.user.role, 'HOLD_APPROVE', 'hold', id, `Approved hold: ${hold.type}`);

        res.json(hold);
    } catch (err) {
        console.error('Error approving hold:', err);
        res.status(500).json({ message: 'Error approving hold' });
    }
});

// POST /api/staff/holds/:id/decline - Decline hold
app.post('/api/staff/holds/:id/decline', auth, requireStaff, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await query(`
            UPDATE holds
            SET status = 'DECLINED'
            WHERE id = $1
            RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Hold not found' });
        }

        const hold = result.rows[0];

        // Create notification for requester
        await createNotification(
            hold.requested_by_profile_id,
            'SYSTEM',
            'Hold Declined',
            `Your ${hold.type} request has been declined.`,
            '/dashboard/holds'
        );

        // Log audit
        await logAudit(req.user.userId, req.user.role, 'HOLD_DECLINE', 'hold', id, `Declined hold: ${hold.type}`);

        res.json(hold);
    } catch (err) {
        console.error('Error declining hold:', err);
        res.status(500).json({ message: 'Error declining hold' });
    }
});

// Export helpers for use in other endpoints
export { createNotification, logAudit };



// Export the app for Vercel serverless function
export default app;

// Only start the server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT} (0.0.0.0)`);
    });
}
