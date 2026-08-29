import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function inspectTables() {
    const client = await pool.connect();
    try {
        console.log('--- user_profiles Columns ---');
        const userProfiles = await client.query(`
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'user_profiles'
            ORDER BY ordinal_position;
        `);
        console.table(userProfiles.rows);

        console.log('\n--- children Columns ---');
        const childrenTables = await client.query(`
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'children'
            ORDER BY ordinal_position;
        `);
        console.table(childrenTables.rows);

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}

inspectTables();
