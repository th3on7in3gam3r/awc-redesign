import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { query } from '../db.mjs';

dotenv.config();

export const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // If token has sessionId, verify session is not revoked
        // (Only if user_sessions table exists - gracefully handle migration pending)
        if (decoded.sessionId) {
            try {
                const sessionCheck = await query(`
                    SELECT id, revoked_at FROM user_sessions 
                    WHERE session_token = $1 AND user_id = $2
                `, [decoded.sessionId, decoded.userId]);

                if (sessionCheck.rows.length === 0) {
                    return res.status(401).json({ message: 'Session not found' });
                }

                const session = sessionCheck.rows[0];
                if (session.revoked_at) {
                    return res.status(401).json({ message: 'Session has been revoked' });
                }

                // Update last_active_at timestamp (fire and forget)
                query(`
                    UPDATE user_sessions 
                    SET last_active_at = NOW() 
                    WHERE session_token = $1
                `, [decoded.sessionId]).catch(err => {
                    console.error('Error updating session activity:', err);
                });
            } catch (sessionError) {
                // If user_sessions table doesn't exist yet, just log and continue
                // This allows the app to work before the migration is run
                if (sessionError.code === '42P01' || sessionError.code === '42703') {
                    // 42P01: undefined_table, 42703: undefined_column
                    console.log('Session validation skipped: user_sessions table not created yet');
                } else {
                    // For other session errors, re-throw
                    throw sessionError;
                }
            }
        }

        next();
    } catch (error) {
        console.error('DEBUG: Auth middleware error:', error.message);
        res.status(401).json({ message: 'Authentication failed' });
    }
};
