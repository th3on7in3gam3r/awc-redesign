/**
 * Fix Roster Schema
 * Adds checked_in_at column to program_checkins.
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixRosterSchema() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        console.log('🛠️ Fixing program_checkins...');

        await client.query(`
            ALTER TABLE program_checkins 
            ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP DEFAULT NOW();
        `);

        console.log('✅ Roster schema fixed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixRosterSchema();
