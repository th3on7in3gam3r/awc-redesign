/**
 * Fix Remaining Schema
 * Finance, Security, Programs, and Household fixes.
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixRemainingSchema() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        // 1. HOUSEHOLDS Fix (is_primary_contact)
        console.log('🛠️ Fixing household_members...');
        await client.query(`
            ALTER TABLE household_members 
            ADD COLUMN IF NOT EXISTS is_primary_contact BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
        `);

        // 2. PROGRAMS Fix (program_sessions)
        console.log('🛠️ Fixing program_sessions...');
        await client.query(`
            ALTER TABLE program_sessions 
            ADD COLUMN IF NOT EXISTS opened_by UUID REFERENCES user_profiles(id),
            ADD COLUMN IF NOT EXISTS closed_by UUID REFERENCES user_profiles(id),
            ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP;
        `);
        // Add Unique Constraint
        try {
            await client.query(`
                ALTER TABLE program_sessions ADD CONSTRAINT program_sessions_program_date_key UNIQUE (program, service_date);
            `);
        } catch (e) {
            // Might already exist
            console.log('   - Constraint might already exist:', e.message);
        }

        // 3. FINANCE MODULE
        console.log('📦 Creating Finance tables...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS finance_funds (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL UNIQUE,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS finance_sources (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL UNIQUE,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        // Seed Finance
        const fundsCheck = await client.query('SELECT count(*) FROM finance_funds');
        if (parseInt(fundsCheck.rows[0].count) === 0) {
            await client.query(`INSERT INTO finance_funds (name) VALUES ('General Fund'), ('Missions'), ('Building Fund'), ('Youth Ministry'), ('Benevolence')`);
        }
        const sourcesCheck = await client.query('SELECT count(*) FROM finance_sources');
        if (parseInt(sourcesCheck.rows[0].count) === 0) {
            await client.query(`INSERT INTO finance_sources (name) VALUES ('Cash'), ('Check'), ('Online (Stripe)'), ('Bank Transfer')`);
        }

        await client.query(`
            CREATE TABLE IF NOT EXISTS finance_entries (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                fund_id UUID REFERENCES finance_funds(id),
                source_id UUID REFERENCES finance_sources(id),
                amount DECIMAL(12, 2) NOT NULL,
                entry_date DATE DEFAULT CURRENT_DATE,
                memo TEXT,
                created_by_person_id UUID REFERENCES user_profiles(id),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 4. SECURITY & SETTINGS
        console.log('📦 Creating Security & Settings tables...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS login_history (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES user_profiles(id), 
                success BOOLEAN DEFAULT false,
                ip_address VARCHAR(50),
                location VARCHAR(100),
                user_agent VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES user_profiles(id),
                token_hash VARCHAR(255),
                device_info VARCHAR(255),
                ip_address VARCHAR(50),
                location VARCHAR(100),
                last_active_at TIMESTAMP DEFAULT NOW(),
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS notification_preferences (
                user_id UUID PRIMARY KEY REFERENCES user_profiles(id),
                email_events BOOLEAN DEFAULT true,
                email_ministry BOOLEAN DEFAULT true,
                email_prayer BOOLEAN DEFAULT true,
                email_chat BOOLEAN DEFAULT true,
                email_system BOOLEAN DEFAULT true,
                push_chat BOOLEAN DEFAULT true,
                push_mentions BOOLEAN DEFAULT true,
                push_events BOOLEAN DEFAULT true,
                push_prayer BOOLEAN DEFAULT true,
                sms_emergency BOOLEAN DEFAULT true,
                sms_events BOOLEAN DEFAULT false,
                sms_prayer BOOLEAN DEFAULT false,
                sound_enabled BOOLEAN DEFAULT true,
                desktop_notifications BOOLEAN DEFAULT true,
                badge_counts BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log('\n✅ Fixed Finance, Security, Programs, and Households schema!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixRemainingSchema();
