/**
 * Password change endpoint
 */

import bcrypt from 'bcryptjs';
import { query } from '../db.mjs';

export async function changePassword(userId, currentPassword, newPassword) {
    // 1. Get current password hash
    const userResult = await query(
        'SELECT password_hash FROM user_profiles WHERE id = $1',
        [userId]
    );

    if (userResult.rows.length === 0) {
        throw new Error('User not found');
    }

    const user = userResult.rows[0];

    // 2. Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
        throw new Error('Current password is incorrect');
    }

    // 3. Validate new password
    if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters');
    }

    if (!/[A-Z]/.test(newPassword)) {
        throw new Error('New password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(newPassword)) {
        throw new Error('New password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(newPassword)) {
        throw new Error('New password must contain at least one number');
    }

    // 4. Check if new password is same as current
    const isSame = await bcrypt.compare(newPassword, user.password_hash);
    if (isSame) {
        throw new Error('New password must be different from current password');
    }

    // 5. Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // 6. Update password
    await query(
        'UPDATE user_profiles SET password_hash = $1 WHERE id = $2',
        [newPasswordHash, userId]
    );

    // 7. Log password change
    await query(`
        INSERT INTO login_history (user_id, success, ip_address, user_agent)
        VALUES ($1, TRUE, 'PASSWORD_CHANGE', 'System')
    `, [userId]);

    return { success: true };
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(userId) {
    const result = await query(`
        SELECT * FROM notification_preferences WHERE user_id = $1
    `, [userId]);

    if (result.rows.length === 0) {
        // Create default preferences
        const defaultPrefs = await query(`
            INSERT INTO notification_preferences (user_id)
            VALUES ($1)
            RETURNING *
        `, [userId]);
        return defaultPrefs.rows[0];
    }

    return result.rows[0];
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(userId, preferences) {
    const allowedFields = [
        'email_events', 'email_ministry', 'email_prayer', 'email_chat', 'email_system',
        'push_chat', 'push_mentions', 'push_events', 'push_prayer',
        'sms_emergency', 'sms_events', 'sms_prayer',
        'sound_enabled', 'desktop_notifications', 'badge_counts'
    ];

    const updates = [];
    const values = [userId];
    let paramCount = 2;

    for (const [key, value] of Object.entries(preferences)) {
        if (allowedFields.includes(key)) {
            updates.push(`${key} = $${paramCount}`);
            values.push(value);
            paramCount++;
        }
    }

    if (updates.length === 0) {
        throw new Error('No valid fields to update');
    }

    updates.push(`updated_at = NOW()`);

    const result = await query(`
        UPDATE notification_preferences
        SET ${updates.join(', ')}
        WHERE user_id = $1
        RETURNING *
    `, values);

    if (result.rows.length === 0) {
        // Create if doesn't exist
        return await query(`
            INSERT INTO notification_preferences (user_id)
            VALUES ($1)
            RETURNING *
        `, [userId]);
    }

    return result.rows[0];
}

/**
 * Get user sessions
 */
export async function getUserSessions(userId, currentTokenHash) {
    const result = await query(`
        SELECT 
            id,
            device_info,
            ip_address,
            location,
            last_active_at,
            created_at,
            token_hash = $2 as is_current
        FROM user_sessions
        WHERE user_id = $1
        ORDER BY last_active_at DESC
    `, [userId, currentTokenHash]);

    return result.rows;
}

/**
 * Revoke session
 */
export async function revokeSession(userId, sessionId) {
    const result = await query(`
        DELETE FROM user_sessions
        WHERE id = $1 AND user_id = $2
        RETURNING id
    `, [sessionId, userId]);

    if (result.rows.length === 0) {
        throw new Error('Session not found');
    }

    return { success: true };
}

/**
 * Revoke all other sessions
 */
export async function revokeOtherSessions(userId, currentTokenHash) {
    const result = await query(`
        DELETE FROM user_sessions
        WHERE user_id = $1 AND token_hash != $2
        RETURNING id
    `, [userId, currentTokenHash]);

    return { success: true, revokedCount: result.rows.length };
}

/**
 * Get login history
 */
export async function getLoginHistory(userId, limit = 20) {
    const result = await query(`
        SELECT 
            id,
            success,
            ip_address,
            location,
            user_agent,
            created_at
        FROM login_history
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
    `, [userId, limit]);

    return result.rows;
}
