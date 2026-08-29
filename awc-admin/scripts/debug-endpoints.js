/**
 * Test API Endpoints
 * Hits failing endpoints to debug 500 errors
 */

import fetch from 'node-fetch';

async function testEndpoints() {
    const baseUrl = 'http://localhost:5001';

    // Login to get token
    console.log('🔑 Logging in as admin...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'jehvonmahabir@gmail.com', password: 'admin123' })
    });

    if (!loginRes.ok) {
        console.error('❌ Login failed:', await loginRes.text());
        return;
    }

    const { token } = await loginRes.json();
    console.log('✅ Login successful\n');

    const headers = { 'Authorization': `Bearer ${token}` };

    // Test failing endpoints
    // 1. Basic Endpoints
    const basicEndpoints = [
        '/api/staff/holds?status=PENDING',
        '/api/notifications',
        '/api/stats/pulse?timeframe=week',
        '/api/activity?limit=20',
        '/api/staff/chat/channels',
        '/api/staff/resources',
        '/api/staff/events',
        '/api/staff/households',
        '/api/programs/active-sessions',
        '/api/giving/content',
        '/api/giving/options',
        '/api/staff/finance/funds',
        '/api/staff/finance/sources',
        '/api/staff/finance/entries?range=30d',
        '/api/staff/finance/summary?range=30d',
        '/api/me/notification-preferences',
        '/api/me/login-history',
        '/api/me/sessions',
        '/api/checkin/active',
        '/api/staff/programs/roster?program=daycare&date=2026-01-18',
        '/api/onboarding/status',
        '/api/programs/my-children'
    ];

    console.log('\n🔍 Testing Basic Endpoints...');
    for (const endpoint of basicEndpoints) {
        process.stdout.write(`Testing ${endpoint}... `);
        try {
            const res = await fetch(`${baseUrl}${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                console.log('✅ OK');
            } else {
                console.log(`❌ FAILED (${res.status})`);
                const text = await res.text();
                console.log('Error:', text);
            }
        } catch (e) {
            console.log(`❌ Network Error: ${e.message}`);
        }
    }

    // 2. Dynamic/Complex Endpoints
    console.log('\n🔍 Testing Dynamic Endpoints...');

    // People Detail
    try {
        process.stdout.write('Testing /api/staff/people/:id ... ');
        const listRes = await fetch(`${baseUrl}/api/staff/people?limit=1`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const people = await listRes.json();
        if (people.length > 0) {
            const personId = people[0].id;
            const detailRes = await fetch(`${baseUrl}/api/staff/people/${personId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (detailRes.ok) console.log('✅ OK');
            else {
                console.log(`❌ FAILED (${detailRes.status})`);
                console.log(await detailRes.text());
            }
        } else {
            console.log('⚠️ Skipped (No people found)');
        }
    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
    }

    // Program Session Open
    try {
        process.stdout.write('Testing POST /api/staff/programs/session/open ... ');
        const openRes = await fetch(`${baseUrl}/api/staff/programs/session/open`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ program: 'daycare' })
        });
        if (openRes.ok) console.log('✅ OK');
        else {
            console.log(`❌ FAILED (${openRes.status})`);
            console.log(await openRes.text());
        }
    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
    }

    // Giving Intent
    try {
        process.stdout.write('Testing POST /api/giving/intent ... ');
        // Get option first
        const optsRes = await fetch(`${baseUrl}/api/giving/options`, { headers: { 'Authorization': `Bearer ${token}` } });
        const opts = await optsRes.json();
        if (opts.length > 0) {
            const intentRes = await fetch(`${baseUrl}/api/giving/intent`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    giving_option_id: opts[0].id,
                    amount: 50.00,
                    frequency: 'one-time'
                })
            });
            if (intentRes.ok) console.log('✅ OK');
            else {
                console.log(`❌ FAILED (${intentRes.status})`);
                console.log(await intentRes.text());
            }
        } else {
            console.log('⚠️ Skipped (No giving options)');
        }
    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
    }

    // Profile Update (PATCH)
    try {
        process.stdout.write('Testing PATCH /api/user/profile ... ');
        const profileRes = await fetch(`${baseUrl}/api/user/profile`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ministry_interests: ['Worship', 'Tech']
            })
        });
        if (profileRes.ok) console.log('✅ OK');
        else {
            console.log(`❌ FAILED (${profileRes.status})`);
            console.log(await profileRes.text());
        }
    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
    }

    // Media Consent (POST)
    try {
        process.stdout.write('Testing POST /api/me/consent ... ');
        const consentRes = await fetch(`${baseUrl}/api/me/consent`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_consent: { status: 'consent', notes: 'Test notes' },
                source: 'test_script'
            })
        });
        if (consentRes.ok) console.log('✅ OK');
        else {
            console.log(`❌ FAILED (${consentRes.status})`);
            console.log(await consentRes.text());
        }
    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
    }

    // Onboarding Complete (POST)
    try {
        process.stdout.write('Testing POST /api/onboarding/complete ... ');
        const completeRes = await fetch(`${baseUrl}/api/onboarding/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        if (completeRes.ok) console.log('✅ OK');
        else {
            console.log(`❌ FAILED (${completeRes.status})`);
            console.log(await completeRes.text());
        }
    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
    }

    // Profile & Admin Checks
    console.log('\n🔍 Testing Profile & Admin Endpoints...');
    const profileEndpoints = [
        '/api/me/attendance-summary',
        '/api/me/ministries',
        '/api/me/ministry-requests'
    ];

    for (const ep of profileEndpoints) {
        process.stdout.write(`Testing ${ep}... `);
        try {
            const res = await fetch(`${baseUrl}${ep}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) console.log('✅ OK');
            else {
                console.log(`❌ FAILED (${res.status})`);
                console.log(await res.text());
            }
        } catch (e) { console.log(`❌ Error: ${e.message}`); }
    }

    // Admin Notes (requires target user ID, use own ID for test)
    try {
        const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;
        if (userId) {
            process.stdout.write(`Testing /api/admin/notes/${userId}... `);
            const notesRes = await fetch(`${baseUrl}/api/admin/notes/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (notesRes.ok) console.log('✅ OK');
            else {
                console.log(`❌ FAILED (${notesRes.status})`);
                console.log(await notesRes.text());
            }
        }
    } catch (e) { console.log(`❌ Error: ${e.message}`); }

}

testEndpoints();
