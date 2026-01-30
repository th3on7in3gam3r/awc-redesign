
import fetch from 'node-fetch';

async function testSync() {
    const baseUrl = 'http://localhost:5001';

    // Login
    console.log('🔑 Logging in...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'jehvonmahabir@gmail.com', password: 'admin123' })
    });

    if (!loginRes.ok) {
        console.error('❌ Login failed');
        return;
    }

    const { token } = await loginRes.json();

    // Sync
    console.log('🔄 Testing YouTube Sync...');
    const res = await fetch(`${baseUrl}/api/sermons/sync`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
        const data = await res.json();
        console.log('✅ Success:', data);
    } else {
        console.log('❌ Failed:', res.status, await res.text());
    }
}

testSync();
