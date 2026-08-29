/**
 * Fix Schema Mismatches
 * Renames columns to match server code expectations
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixSchema() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        // 1. Fix notifications table
        console.log('🔧 Fixing notifications table...');

        // Check if profile_id exists
        const colCheck = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='notifications' AND column_name='profile_id'
        `);

        if (colCheck.rows.length > 0) {
            await client.query(`
                ALTER TABLE notifications 
                RENAME COLUMN profile_id TO recipient_profile_id
            `);
            console.log('   ✅ Renamed profile_id -> recipient_profile_id');
        } else {
            console.log('   ℹ️  Column profile_id not found (already renamed?)');
        }

        console.log('\n✅ Schema fixes applied!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixSchema();
