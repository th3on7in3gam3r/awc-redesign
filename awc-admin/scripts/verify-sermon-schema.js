/**
 * Verify Sermon Schema
 * Checks availability of sermons table.
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function verifySermonSchema() {
    const client = new Client({ connectionString });

    try {
        await client.connect();

        const res = await client.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'sermons'
            ORDER BY column_name
        `);

        if (res.rows.length === 0) {
            console.log(`❌ Table 'sermons' DOES NOT EXIST`);
        } else {
            console.log(`✅ Table 'sermons' exists. Columns:`);
            res.rows.forEach(r => console.log(`   - ${r.column_name} (${r.data_type})`));
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

verifySermonSchema();
