/**
 * Inspect Holds Schema
 */
import pg from 'pg';
const { Client } = pg;
const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function inspectHolds() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'user_profiles'
            ORDER BY table_name, column_name
        `);
        console.log('📦 User Profiles Schema:');

        let currentTable = '';
        res.rows.forEach(r => {
            if (r.table_name !== currentTable) {
                console.log(`\n📋 ${r.table_name}:`);
                currentTable = r.table_name;
            }
            console.log(`   - ${r.column_name} (${r.data_type})`);
        });
    } finally {
        await client.end();
    }
}
inspectHolds();
