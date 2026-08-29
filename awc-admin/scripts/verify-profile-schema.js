/**
 * Verify Profile & Admin Schema
 * Checks availability of attendance, user_ministries, ministries, and user_notes.
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function verifyProfileSchema() {
    const client = new Client({ connectionString });

    try {
        await client.connect();

        const tables = ['attendance', 'user_ministries', 'ministries', 'user_notes'];

        for (const table of tables) {
            const res = await client.query(`
                SELECT table_name, column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY column_name
            `, [table]);

            if (res.rows.length === 0) {
                console.log(`❌ Table '${table}' DOES NOT EXIST`);
            } else {
                console.log(`✅ Table '${table}' exists. Columns:`);
                res.rows.forEach(r => console.log(`   - ${r.column_name} (${r.data_type})`));
            }
            console.log('---');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

verifyProfileSchema();
