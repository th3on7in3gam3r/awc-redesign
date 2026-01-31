import pg from 'pg';
import dotenv from 'dotenv';
import prisma from './lib/prisma.mjs';

// Load .env file only in development (Vercel provides env vars automatically)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    dotenv.config();
}

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    // Don't exit in serverless environment
    if (!process.env.VERCEL) {
        process.exit(-1);
    }
});

export const query = (text, params) => pool.query(text, params);
export { prisma };
export default pool;
