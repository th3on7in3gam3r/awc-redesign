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

async function checkData() {
    try {
        const res = await pool.query('SELECT count(*) FROM checkins');
        console.log('Checkins count:', res.rows[0].count);

        const recent = await pool.query("SELECT * FROM checkins WHERE created_at > NOW() - INTERVAL '30 days' LIMIT 5");
        console.log('Recent checkins:', recent.rows.length);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkData();
