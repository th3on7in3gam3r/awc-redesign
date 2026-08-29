/**
 * Fix Holds Schema
 * Creates missing 'holds' table
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixHoldsSchema() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        // Create holds table
        console.log('📦 Creating holds table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS holds (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                type VARCHAR(50) NOT NULL,
                requested_by_profile_id UUID REFERENCES user_profiles(id),
                target_date DATE,
                target_resource VARCHAR(100),
                notes TEXT,
                status VARCHAR(20) DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('   ✅ holds table ready');

        console.log('\n✅ Holds schema fixed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixHoldsSchema();
