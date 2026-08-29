/**
 * Fix Consent Columns Schema
 * Adds missing media consent columns to user_profiles and children tables.
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixConsentColumns() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        console.log('🛠️ Fixing user_profiles table...');
        await client.query(`
            ALTER TABLE user_profiles 
            ADD COLUMN IF NOT EXISTS media_consent_notes TEXT;
        `);

        console.log('🛠️ Fixing children table...');
        await client.query(`
            ALTER TABLE children 
            ADD COLUMN IF NOT EXISTS media_consent_status VARCHAR(50) DEFAULT 'unset',
            ADD COLUMN IF NOT EXISTS media_consent_updated_at TIMESTAMP;
        `);

        console.log('✅ Consent columns added!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixConsentColumns();
