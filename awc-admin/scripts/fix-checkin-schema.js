/**
 * Fix Checkin Schema
 * Creates missing event_sessions table.
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixCheckinSchema() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        console.log('📦 Creating event_sessions...');

        await client.query(`
            CREATE TABLE IF NOT EXISTS event_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                event_id UUID REFERENCES events(id),
                code VARCHAR(20) NOT NULL,
                status VARCHAR(20) DEFAULT 'active',
                started_at TIMESTAMP DEFAULT NOW(),
                ended_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log('✅ Checkin schema fixed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixCheckinSchema();
