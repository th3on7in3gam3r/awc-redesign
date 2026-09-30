import pg from 'pg';
const { Pool } = pg;

// IMPORTANT: Do NOT hardcode credentials. Store them in environment variables.
// Example: DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set.');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
});

async function testConnection() {
    console.log('Attempting to connect to Neon PostgreSQL...');

    try {
        const client = await pool.connect();
        console.log('✅ Connected to Neon Database successfully!');

        // Use parameterized query to prevent SQL injection
        const res = await client.query('SELECT $1::int + $2::int AS solution', [1, 1]);
        console.log('Query result:', res.rows[0].solution); // Should be 2

        client.release();
        await pool.end();
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('Code:', error.code);
    }
}

testConnection();
