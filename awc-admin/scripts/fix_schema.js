import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    try {
        console.log('Connecting to DB...');
        // Drop tables that might have wrong types (Development only!)
        console.log('Dropping potential legacy tables...');
        await pool.query('DROP TABLE IF EXISTS user_ministries CASCADE');
        await pool.query('DROP TABLE IF EXISTS ministries CASCADE'); // Ministries also needs legacy fix
        await pool.query('DROP TABLE IF EXISTS attendance CASCADE'); // Assuming attendance might also be affected
        await pool.query('DROP TABLE IF EXISTS prayer_requests CASCADE');
        await pool.query('DROP TABLE IF EXISTS user_notes CASCADE');

        console.log('Tables dropped. Re-applying schema...');

        const schema = fs.readFileSync(path.join(process.cwd(), 'migrations/church_hub_schema.sql'), 'utf8');

        // Execute the schema script
        await pool.query(schema);

        console.log('Schema re-applied successfully.');

        // Seed some data? check schema script

    } catch (err) {
        console.error('Error fixing schema:', err);
    } finally {
        await pool.end();
    }
}

run();
