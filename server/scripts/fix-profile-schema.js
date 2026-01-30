/**
 * Fix User Profile Schema
 * Adds ministry_interests and other potentially missing columns to user_profiles.
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixUserProfileSchema() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        console.log('🛠️ Fixing user_profiles table...');

        await client.query(`
            ALTER TABLE user_profiles 
            ADD COLUMN IF NOT EXISTS ministry_interests TEXT[], 
            ADD COLUMN IF NOT EXISTS birthday DATE,
            ADD COLUMN IF NOT EXISTS address TEXT,
            ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
            ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT true;
        `);

        console.log('✅ User Profile schema fixed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixUserProfileSchema();
