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

const API_URL = 'http://localhost:3002/api';
const TIMESTAMP = Date.now();
const EMAIL = `test.staff.${TIMESTAMP}@awc.com`;
const PASSWORD = 'password123';

async function testSessionOpen() {
    try {
        console.log(`--- Testing Session Open (User: ${EMAIL}) ---`);

        // 1. Register
        console.log('1. Registering user...');
        const registerRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'Test',
                lastName: 'Staff',
                email: EMAIL,
                password: PASSWORD
            })
        });

        const regData = await registerRes.json();
        let token = regData.token;
        console.log('Registration successful.');

        // 2. Promote to Admin via DB
        console.log('2. Promoting user to admin...');
        const updateRes = await pool.query("UPDATE user_profiles SET role = 'admin' WHERE email = $1", [EMAIL]);
        console.log(`User promoted to admin. Rows affected: ${updateRes.rowCount}`);

        // 2b. Login again to get new token with admin role
        console.log('2b. Logging in to get updated token...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error('Login failed');
        token = loginData.token;
        console.log('Got fresh token.');

        // 3. Open Session
        console.log('3. Opening Daycare Session...');
        const res = await fetch(`${API_URL}/staff/programs/session/open`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ program: 'daycare' })
        });

        const status = res.status;
        console.log(`Response Status: ${status}`);

        const text = await res.text();
        try {
            const json = JSON.parse(text);
            console.log('Response JSON:', JSON.stringify(json, null, 2));
        } catch (e) {
            console.log('Response Text:', text);
        }

    } catch (err) {
        console.error('Test failed:', err);
    }
}

testSessionOpen();
