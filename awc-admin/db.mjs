import pg from 'pg';
import dotenv from 'dotenv';
import { supabase } from './lib/supabase.js';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

export const query = (text, params) => pool.query(text, params);
export { supabase };
export default pool;
