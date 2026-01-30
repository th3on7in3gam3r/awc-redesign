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

async function inspectTable() {
    try {
        console.log('Inspecting prayer_requests table...');
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'prayer_requests';
        `);

        console.log('Columns:', res.rows);

        const rows = await pool.query('SELECT * FROM prayer_requests LIMIT 1');
        console.log('Sample Row:', rows.rows[0]);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

inspectTable();
