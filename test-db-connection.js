import pg from 'pg';
const { Pool } = pg;

const connectionString = 'postgresql://neondb_owner:npg_Xc5qADti8gCT@ep-noisy-wind-ahonzbq0-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
    connectionString,
});

async function testConnection() {
    console.log('Attempting to connect to Neon PostgreSQL...');

    try {
        const client = await pool.connect();
        console.log('✅ Connected to Neon Database successfully!');

        const res = await client.query('SELECT 1 + 1 AS solution');
        console.log('Query result:', res.rows[0].solution); // Should be 2

        client.release();
        await pool.end();
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('Code:', error.code);
    }
}

testConnection();
