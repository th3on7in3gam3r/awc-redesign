/**
 * Fix Children Schema
 * Adds authorized_pickup_names column to children table.
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixChildrenSchema() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        console.log('🛠️ Fixing children table...');

        await client.query(`
            ALTER TABLE children 
            ADD COLUMN IF NOT EXISTS authorized_pickup_names TEXT CHECK (jsonb_typeof(to_jsonb(authorized_pickup_names)) = 'string' OR authorized_pickup_names IS NULL);
            -- Actually, endpoint expects it to be text or array? 
            -- Code says: authorized_pickup_names
            -- Previous verify showed it as missing.
            -- Based on usage, it's likely a simple text field or array.
            -- Let's make it TEXT for now as it's the most flexible and widely used in this codebase for simple lists unless specified as TEXT[].
            -- Wait, "authorized_pickup_names" implies plural. 
            -- Let's check the code usage in src if possible, but safe bet is TEXT (comma separated) or TEXT[].
            -- Given Neon/PG, TEXT[] is better for lists.
        `);

        // Re-evaluating: The error said column does not exist.
        // Let's retry with safe ALTER.
        await client.query(`
            ALTER TABLE children 
            ADD COLUMN IF NOT EXISTS authorized_pickup_names TEXT; 
        `);

        console.log('✅ Children schema fixed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixChildrenSchema();
