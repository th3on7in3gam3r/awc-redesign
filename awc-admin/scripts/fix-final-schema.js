/**
 * Fix Final Schema Mismatches
 * Creates giving_options and adds missing columns
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixFinalSchema() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        // 1. Create giving_options
        console.log('📦 Creating giving_options table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS giving_options (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title VARCHAR(100) NOT NULL,
                provider VARCHAR(50),
                category VARCHAR(50),
                url VARCHAR(255),
                handle VARCHAR(100),
                subtitle VARCHAR(255),
                is_primary BOOLEAN DEFAULT false,
                is_active BOOLEAN DEFAULT true,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('   ✅ giving_options table ready');

        // 2. Add is_active to chat_channels
        console.log('\n🔧 Updating chat_channels...');
        await client.query(`
            ALTER TABLE chat_channels 
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true
        `);
        console.log('   ✅ Added is_active column');

        console.log('\n✅ Final schema fixes applied!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixFinalSchema();
