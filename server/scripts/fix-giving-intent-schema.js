/**
 * Fix Giving Intent Schema
 * Creates the giving_intents table.
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixGivingIntentSchema() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        console.log('📦 Creating giving_intents...');

        await client.query(`
            CREATE TABLE IF NOT EXISTS giving_intents (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES user_profiles(id),
                giving_option_id UUID REFERENCES giving_options(id),
                amount DECIMAL(12, 2),
                frequency VARCHAR(50),
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // Add missing columns if table existed
        await client.query(`
            ALTER TABLE giving_intents 
            ADD COLUMN IF NOT EXISTS frequency VARCHAR(50),
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
        `);

        console.log('✅ Giving Intent schema fixed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixGivingIntentSchema();
