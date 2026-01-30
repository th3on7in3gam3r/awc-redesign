/**
 * Fix Legacy Clash
 * Adapts existing legacy tables (finance_entries, notifications, security) to match new schema expectations.
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixLegacyClash() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        // ==========================================
        // 1. FINANCE ENTRIES
        // ==========================================
        console.log('🛠️ Fixing finance_entries...');
        // Rename created_by -> created_by_person_id
        await client.query(`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='finance_entries' AND column_name='created_by') THEN
                    ALTER TABLE finance_entries RENAME COLUMN created_by TO created_by_person_id;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='finance_entries' AND column_name='description') THEN
                     -- Optionally rename description to memo if memo doesn't exist
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='finance_entries' AND column_name='memo') THEN
                        ALTER TABLE finance_entries RENAME COLUMN description TO memo;
                    END IF;
                END IF;
            END $$;
        `);
        // Add missing columns
        await client.query(`
            ALTER TABLE finance_entries 
            ADD COLUMN IF NOT EXISTS fund_id UUID REFERENCES finance_funds(id),
            ADD COLUMN IF NOT EXISTS source_id UUID REFERENCES finance_sources(id),
            ADD COLUMN IF NOT EXISTS memo TEXT;
        `);

        // ==========================================
        // 2. NOTIFICATION PREFERENCES
        // ==========================================
        console.log('🛠️ Fixing notification_preferences...');
        await client.query(`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notification_preferences' AND column_name='profile_id') THEN
                    ALTER TABLE notification_preferences RENAME COLUMN profile_id TO user_id;
                END IF;
            END $$;
        `);
        // Add all granular columns
        await client.query(`
            ALTER TABLE notification_preferences
            ADD COLUMN IF NOT EXISTS email_events BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS email_ministry BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS email_prayer BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS email_chat BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS email_system BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS push_chat BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS push_mentions BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS push_events BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS push_prayer BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS sms_emergency BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS sms_events BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS sms_prayer BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS sound_enabled BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS desktop_notifications BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS badge_counts BOOLEAN DEFAULT true;
        `);

        // ==========================================
        // 3. LOGIN HISTORY
        // ==========================================
        console.log('🛠️ Fixing login_history...');
        await client.query(`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='login_history' AND column_name='profile_id') THEN
                    ALTER TABLE login_history RENAME COLUMN profile_id TO user_id;
                END IF;
            END $$;
        `);
        await client.query(`
            ALTER TABLE login_history
            ADD COLUMN IF NOT EXISTS location VARCHAR(150),
            ADD COLUMN IF NOT EXISTS user_agent VARCHAR(255);
        `);

        // ==========================================
        // 4. USER SESSIONS
        // ==========================================
        console.log('🛠️ Fixing user_sessions...');
        await client.query(`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_sessions' AND column_name='profile_id') THEN
                    ALTER TABLE user_sessions RENAME COLUMN profile_id TO user_id;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_sessions' AND column_name='last_active') THEN
                    ALTER TABLE user_sessions RENAME COLUMN last_active TO last_active_at;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_sessions' AND column_name='device_name') THEN
                    ALTER TABLE user_sessions RENAME COLUMN device_name TO device_info;
                END IF;
            END $$;
        `);
        await client.query(`
            ALTER TABLE user_sessions
            ADD COLUMN IF NOT EXISTS token_hash VARCHAR(255),
            ADD COLUMN IF NOT EXISTS location VARCHAR(150);
        `);

        console.log('\n✅ Fixed Legacy Clashes! (Finance, Security)');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixLegacyClash();
