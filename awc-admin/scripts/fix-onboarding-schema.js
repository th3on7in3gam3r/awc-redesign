/**
 * Fix Onboarding Schema
 * Creates missing tables: onboarding_progress, media_consent
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixOnboardingSchema() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        console.log('📦 Creating onboarding_progress...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS onboarding_progress (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES user_profiles(id) NOT NULL,
                current_step INTEGER DEFAULT 1,
                is_completed BOOLEAN DEFAULT false,
                ministry_interests TEXT[],
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id)
            );
        `);

        console.log('📦 Creating media_consent...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS media_consent (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES user_profiles(id) NOT NULL,
                consent_status VARCHAR(50) NOT NULL,
                child_ids UUID[],
                signature TEXT,
                signed_at TIMESTAMP DEFAULT NOW(),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log('✅ Onboarding schema fixed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixOnboardingSchema();
