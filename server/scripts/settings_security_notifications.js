/**
 * Settings Module - Security & Notifications Migration
 * Creates tables for sessions, login history, 2FA, and notification preferences
 */

import { query } from '../db.mjs';

async function migrate() {
    console.log('🚀 Starting Settings Security & Notifications migration...');

    try {
        // 1. User Sessions Table
        await query(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
                token_hash TEXT NOT NULL,
                device_info JSONB,
                ip_address TEXT,
                location TEXT,
                last_active_at TIMESTAMPTZ DEFAULT NOW(),
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        console.log('✅ Created user_sessions table');

        await query(`
            CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id 
            ON user_sessions(user_id)
        `);
        console.log('✅ Created index on user_sessions');

        // 2. Login History Table
        await query(`
            CREATE TABLE IF NOT EXISTS login_history (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
                success BOOLEAN NOT NULL,
                ip_address TEXT,
                location TEXT,
                user_agent TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        console.log('✅ Created login_history table');

        await query(`
            CREATE INDEX IF NOT EXISTS idx_login_history_user_id 
            ON login_history(user_id, created_at DESC)
        `);
        console.log('✅ Created index on login_history');

        // 3. Two-Factor Authentication Table
        await query(`
            CREATE TABLE IF NOT EXISTS user_2fa (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
                secret TEXT NOT NULL,
                backup_codes TEXT[],
                enabled BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        console.log('✅ Created user_2fa table');

        // 4. Notification Preferences Table
        await query(`
            CREATE TABLE IF NOT EXISTS notification_preferences (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
                email_events TEXT DEFAULT 'immediately',
                email_ministry TEXT DEFAULT 'daily',
                email_prayer TEXT DEFAULT 'immediately',
                email_chat TEXT DEFAULT 'never',
                email_system TEXT DEFAULT 'immediately',
                push_chat BOOLEAN DEFAULT TRUE,
                push_mentions BOOLEAN DEFAULT TRUE,
                push_events BOOLEAN DEFAULT TRUE,
                push_prayer BOOLEAN DEFAULT FALSE,
                sms_emergency BOOLEAN DEFAULT FALSE,
                sms_events BOOLEAN DEFAULT FALSE,
                sms_prayer BOOLEAN DEFAULT FALSE,
                sound_enabled BOOLEAN DEFAULT TRUE,
                desktop_notifications BOOLEAN DEFAULT TRUE,
                badge_counts BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        console.log('✅ Created notification_preferences table');

        console.log('✨ Settings Security & Notifications migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

migrate()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
