/**
 * Fix Final Schema V2
 * Renames columns to match backend expectations.
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixFinalSchema() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        // 1. Events
        console.log('🛠️ Fixing events table...');
        await client.query(`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='event_date') THEN
                    ALTER TABLE events RENAME COLUMN event_date TO starts_at;
                END IF;
            END $$;
        `);
        await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS ends_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS ministry_id UUID;
        `);

        // 2. Households
        console.log('🛠️ Fixing households table...');
        await client.query(`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='households' AND column_name='name') THEN
                    ALTER TABLE households RENAME COLUMN name TO household_name;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='households' AND column_name='address') THEN
                    ALTER TABLE households RENAME COLUMN address TO address_line1;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='households' AND column_name='phone') THEN
                    ALTER TABLE households RENAME COLUMN phone TO primary_phone;
                END IF;
            END $$;
        `);
        await client.query(`
            ALTER TABLE households 
            ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255),
            ADD COLUMN IF NOT EXISTS primary_email VARCHAR(255);
        `);

        // 3. Program Sessions
        console.log('🛠️ Fixing program_sessions table...');
        await client.query(`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='program_sessions' AND column_name='program_type') THEN
                    ALTER TABLE program_sessions RENAME COLUMN program_type TO program;
                END IF;
            END $$;
        `);
        await client.query(`
            ALTER TABLE program_sessions 
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active',
            ADD COLUMN IF NOT EXISTS opened_at TIMESTAMP DEFAULT NOW();
        `);

        console.log('\n✅ Final schema fixes applied!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixFinalSchema();
