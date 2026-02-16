/**
 * Fix Media Consent Log Schema
 * Creates the media_consent_log table.
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixConsentLogSchema() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        console.log('📦 Creating media_consent_log...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS media_consent_log (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                profile_id UUID REFERENCES user_profiles(id) NOT NULL,
                child_id UUID REFERENCES children(id),
                status VARCHAR(50) NOT NULL,
                source VARCHAR(50),
                ip_hash TEXT,
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log('✅ Media Consent Log schema fixed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixConsentLogSchema();
