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

async function dropGivingOptions() {
    const client = await pool.connect();

    try {
        console.log('Dropping giving_options table...');
        await client.query('DROP TABLE IF EXISTS giving_options CASCADE');
        console.log('✅ Table dropped successfully');
    } catch (err) {
        console.error('❌ Error:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

dropGivingOptions().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
