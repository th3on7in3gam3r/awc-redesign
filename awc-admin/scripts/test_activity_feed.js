
const API_URL = 'http://localhost:3002/api';
const TIMESTAMP = Date.now();
const EMAIL = `test.activity.${TIMESTAMP}@awc.com`;
const PASSWORD = 'password123';

async function testActivityFeed() {
    try {
        console.log(`--- Testing Activity Feed (User: ${EMAIL}) ---`);

        // 1. Register
        console.log('1. Registering user...');
        const registerRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'Test',
                lastName: 'Activity',
                email: EMAIL,
                password: PASSWORD
            })
        });

        let token;
        if (registerRes.ok) {
            const data = await registerRes.json();
            token = data.token;
            console.log('Registration successful.');
        } else {
            // Try login if already exists (unlikely with timestamp)
            console.log('Registration failed, trying login...');
        }

        if (!token) {
            // 2. Login
            console.log('2. Logging in...');
            const loginRes = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: EMAIL, password: PASSWORD })
            });

            if (!loginRes.ok) {
                const text = await loginRes.text();
                throw new Error(`Login failed: ${text}`);
            }
            const loginData = await loginRes.json();
            token = loginData.token;
            console.log('Login successful.');
        }

        // 3. Fetch Activity Feed
        console.log('3. Fetching activity feed...');
        const res = await fetch(`${API_URL}/activity?limit=20`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const status = res.status;
        console.log(`Response Status: ${status}`);

        const text = await res.text();
        try {
            const json = JSON.parse(text);
            console.log('Response JSON:', JSON.stringify(json, null, 2));
        } catch (e) {
            console.log('Response Text (Not JSON):');
            console.log(text);
        }

    } catch (err) {
        console.error('Test failed:', err);
    }
}

testActivityFeed();
