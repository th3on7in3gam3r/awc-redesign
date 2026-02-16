/**
 * Fix Onboarding Complete Schema
 * Renames is_completed to completed and adds completed_at column.
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixOnboardingCompleteSchema() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        console.log('🛠️ Fixing onboarding_progress table...');

        // Check if is_completed exists and rename it
        await client.query(`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='onboarding_progress' AND column_name='is_completed') THEN
                    ALTER TABLE onboarding_progress RENAME COLUMN is_completed TO completed;
                END IF;
            END $$;
        `);

        // Add completed_at if not exists
        await client.query(`
            ALTER TABLE onboarding_progress 
            ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
        `);

        // Ensure completed column exists (if it wasn't is_completed before)
        await client.query(`
            ALTER TABLE onboarding_progress 
            ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;
        `);

        console.log('✅ Onboarding Complete schema fixed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixOnboardingCompleteSchema();
