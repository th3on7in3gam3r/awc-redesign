import fetch from 'node-fetch';
import { query } from '../db.mjs';

// Configuration
const BASE_URL = 'http://localhost:3002'; // Assuming api runs on 3002
const EMAIL = 'testmember@example.com'; // Need a valid email
const PASSWORD = 'password123'; // Need a valid password

async function runTest() {
    try {
        console.log('--- Starting Check-In Test ---');

        // 1. Get a valid user or create one
        console.log('1. Getting/Creating User...');
        // We'll just register a new user to be sure
        const timestamp = Date.now();
        const testEmail = `test${timestamp}@example.com`;

        const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'Test',
                lastName: 'User',
                email: testEmail,
                password: 'password123'
            })
        });

        let token;

        if (registerRes.ok) {
            const data = await registerRes.json();
            token = data.token;
            console.log('User registered. Token acquired.');
        } else {
            console.log('Register failed (maybe exists), trying login...');
            // Try logic? Or just use the one we know?
            // Let's assume registration works for a unique email
            const err = await registerRes.text();
            console.error('Register error:', err);
            return;
        }

        // 2. Get active session code
        console.log('2. Getting Active Session Code...');
        // We know code 3365 was active, but let's check
        // We can't query DB directly easily with fetch, but we can try to guess or use the one we saw
        const code = '3365';
        console.log(`Using code: ${code}`);

        // 3. Attempt Check-In
        console.log('3. Attempting Check-In...');
        const checkinRes = await fetch(`${BASE_URL}/api/checkin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ code })
        });

        console.log(`Status: ${checkinRes.status} ${checkinRes.statusText}`);
        const result = await checkinRes.json();
        console.log('Response Body:', JSON.stringify(result, null, 2));

    } catch (err) {
        console.error('Test Failed:', err);
    }
}

runTest();
