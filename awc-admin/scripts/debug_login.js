import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initial load
dotenv.config({ path: join(__dirname, '../.env') });

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function query(text, params) {
    return pool.query(text, params);
}

async function debugLogin() {
    console.log('--- Debugging Login ---');
    console.log('JWT_SECRET present?', !!process.env.JWT_SECRET);
    console.log('DATABASE_URL present?', !!process.env.DATABASE_URL);

    try {
        console.log(`Fetching ANY user...`);
        const result = await query('SELECT * FROM user_profiles LIMIT 1');
        console.log('Result row count:', result.rows.length);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log('User found:', user.email);
            console.log('Keys:', Object.keys(user));

            // Test password
            try {
                const pass = 'password123';
                const hash = user.password_hash;
                console.log('Hash:', hash);

                if (hash) {
                    const match = await bcrypt.compare(pass, hash);
                    console.log('Bcrypt compare result:', match);
                } else {
                    console.log('No password hash to compare');
                }
            } catch (err) {
                console.error('Bcrypt failed:', err);
            }

            // Test JWT signing
            try {
                const token = jwt.sign(
                    { userId: user.id },
                    process.env.JWT_SECRET || 'fallback_secret',
                    { expiresIn: '1h' }
                );
                console.log('JWT Sign success');
            } catch (err) {
                console.error('JWT Sign failed:', err);
            }

        } else {
            console.log('No users found in DB');
        }

    } catch (err) {
        console.error('DB Fetch failed:', err);
    } finally {
        pool.end();
    }
}

debugLogin();
