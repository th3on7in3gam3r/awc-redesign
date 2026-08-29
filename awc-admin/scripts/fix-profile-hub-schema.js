/**
 * Fix Profile Hub Schema
 * Creates missing tables: attendance, user_ministries, user_notes.
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixProfileHubSchema() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        // 1. attendance
        console.log('📦 Creating attendance table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS attendance (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES user_profiles(id) NOT NULL,
                service_date TIMESTAMP DEFAULT NOW(),
                service_type VARCHAR(50),
                check_in_time TIMESTAMP DEFAULT NOW(),
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        // Index for performance
        await client.query('CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);');


        // 2. user_ministries
        console.log('📦 Creating user_ministries table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_ministries (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES user_profiles(id) NOT NULL,
                ministry_id UUID REFERENCES ministries(id) NOT NULL,
                role VARCHAR(50) DEFAULT 'member',
                joined_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id, ministry_id)
            );
        `);


        // 3. user_notes
        console.log('📦 Creating user_notes table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_notes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES user_profiles(id) NOT NULL,
                note TEXT NOT NULL,
                created_by UUID REFERENCES user_profiles(id), -- Optional, for admin notes
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);


        console.log('✅ Profile Hub schema fixed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixProfileHubSchema();
