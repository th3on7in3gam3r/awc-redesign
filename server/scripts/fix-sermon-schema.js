/**
 * Fix Sermon Schema
 * Creates missing sermons table.
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixSermonSchema() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        console.log('📦 Creating sermons table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS sermons (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title VARCHAR(255) NOT NULL,
                scripture VARCHAR(255),
                speaker VARCHAR(255),
                type VARCHAR(50) DEFAULT 'sunday_service',
                series VARCHAR(255),
                description TEXT,
                video_url TEXT,
                thumbnail_url TEXT,
                preached_at TIMESTAMP NOT NULL,
                is_published BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log('✅ Sermon schema fixed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixSermonSchema();
