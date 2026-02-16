/**
 * Fix Prayer Requests Schema
 * Renames content to request_text
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixPrayerRequests() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        // 1. Rename content -> request_text in prayer_requests
        console.log('🔧 Updating prayer_requests...');

        const colCheck = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='prayer_requests' AND column_name='content'
        `);

        if (colCheck.rows.length > 0) {
            await client.query(`
                ALTER TABLE prayer_requests 
                RENAME COLUMN content TO request_text
            `);
            console.log('   ✅ Renamed content -> request_text');
        } else {
            console.log('   ℹ️  Column content not found (already renamed?)');
        }

        console.log('\n✅ Prayer requests schema fixed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixPrayerRequests();
