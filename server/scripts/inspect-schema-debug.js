/**
 * Inspect Schema for Debugging
 * Checks columns of specific tables
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function inspectSchema() {
    const client = new Client({ connectionString });

    try {
        await client.connect();

        const tables = ['attendance', 'chat_channel_members', 'ministry_members'];

        for (const table of tables) {
            console.log(`\n📦 Table: ${table}`);
            const res = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);

            if (res.rows.length === 0) {
                console.log('   (Table not found)');
            } else {
                res.rows.forEach(r => console.log(`   - ${r.column_name} (${r.data_type})`));
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

inspectSchema();
