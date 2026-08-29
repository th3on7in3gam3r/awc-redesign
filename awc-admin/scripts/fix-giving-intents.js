/**
 * Fix Giving Intents Schema
 * Adds giving_option_id to giving_intents
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixGivingIntents() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        // 1. Update giving_intents
        console.log('🔧 Updating giving_intents...');
        await client.query(`
            ALTER TABLE giving_intents 
            ADD COLUMN IF NOT EXISTS giving_option_id UUID REFERENCES giving_options(id)
        `);
        console.log('   ✅ Added giving_option_id');

        console.log('\n✅ Giving intents schema fixed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixGivingIntents();
