import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function testConnection() {
    try {
        console.log('Testing connection to:', process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@'));
        const client = await pool.connect();
        console.log('✓ Connection successful!');

        const result = await client.query('SELECT version()');
        console.log('✓ Database version:', result.rows[0].version);

        client.release();
        await pool.end();
        console.log('✓ Test completed successfully');
    } catch (err) {
        console.error('✗ Connection failed:', err.message);
        console.error('Error code:', err.code);
        process.exit(1);
    }
}

testConnection();
