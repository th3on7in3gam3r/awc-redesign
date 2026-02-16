/**
 * Test Notifications Flow
 * 1. Finds admin user
 * 2. Inserts a test notification
 * 3. Fetches notifications via API to verify
 */

import pg from 'pg';
import fetch from 'node-fetch';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function testNotificationFlow() {
    const client = new Client({ connectionString });

    try {
        await client.connect();

        // 1. Get Admin User ID
        const adminRes = await client.query("SELECT id, email FROM user_profiles WHERE email = 'jehvonmahabir@gmail.com'");
        if (adminRes.rows.length === 0) {
            console.error('❌ Admin user not found');
            return;
        }
        const adminId = adminRes.rows[0].id;
        console.log(`👤 Found Admin: ${adminRes.rows[0].email} (${adminId})`);

        // 2. Insert Test Notification
        const notifRes = await client.query(`
            INSERT INTO notifications (recipient_profile_id, title, body, type, is_read)
            VALUES ($1, 'Test Notification', 'This confirms your notifications are working on Neon!', 'info', false)
            RETURNING id
        `, [adminId]);

        console.log(`✅ Inserted test notification: ${notifRes.rows[0].id}`);

        // 3. Verify via API
        console.log('\n🔍 Verifying via API...');
        // Login
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'jehvonmahabir@gmail.com', password: 'admin123' })
        });
        const { token } = await loginRes.json();

        // Fetch Notifications
        const notifApiRes = await fetch('http://localhost:5001/api/notifications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (notifApiRes.ok) {
            const data = await notifApiRes.json();
            console.log(`✅ API returned ${data.notifications.length} notifications`);

            const found = data.notifications.find(n => n.id === notifRes.rows[0].id);
            if (found) {
                console.log('🎉 SUCCESS: Created notification found in API response!');
                console.log(`   Title: "${found.title}"`);
                console.log(`   Body: "${found.body}"`);
            } else {
                console.error('❌ Created notification NOT found in API response');
            }
        } else {
            console.error('❌ API Error:', await notifApiRes.text());
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

testNotificationFlow();
