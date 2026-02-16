/**
 * Inspect Notifications Schema
 */
import pg from 'pg';
const { Client } = pg;
const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function inspectNotifications() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'notifications'
        `);
        console.log('🔔 Notifications Table Schema:');
        res.rows.forEach(r => console.log(`   - ${r.column_name}`));
    } finally {
        await client.end();
    }
}
inspectNotifications();
