import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Creating ministry_requests table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ministry_requests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES user_profiles(id),
                ministry_id UUID REFERENCES ministries(id),
                interest_role TEXT,
                note TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('Table created successfully.');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        await pool.end();
    }
}

run();
