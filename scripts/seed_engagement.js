
import { query } from '../server/db.mjs';

const seed = async () => {
    try {
        console.log('Seeding engagement data...');

        // Get admin user
        const res = await query("SELECT id FROM users WHERE email = 'admin@anointed.com'");
        if (res.rows.length === 0) {
            console.log('Admin user not found. Skipping.');
            process.exit();
        }
        const userId = res.rows[0].id;

        // 1. Create Ministries
        const m1 = await query("INSERT INTO ministries (name, schedule) VALUES ('Men''s Ministry', 'Thursdays 7PM') RETURNING id");
        const m2 = await query("INSERT INTO ministries (name, schedule) VALUES ('Media Team', 'Sundays 9AM') RETURNING id");

        // 2. Add memberships
        await query("INSERT INTO ministry_members (ministry_id, user_id, role) VALUES ($1, $2, 'Leader') ON CONFLICT DO NOTHING", [m1.rows[0].id, userId]);
        await query("INSERT INTO ministry_members (ministry_id, user_id, role) VALUES ($1, $2, 'Volunteer') ON CONFLICT DO NOTHING", [m2.rows[0].id, userId]);

        // 3. Add Prayer Requests
        await query("INSERT INTO prayer_requests (user_id, request_text, status, created_at) VALUES ($1, 'Family health', 'active', NOW() - INTERVAL '3 days')", [userId]);
        await query("INSERT INTO prayer_requests (user_id, request_text, status, created_at) VALUES ($1, 'Guidance', 'active', NOW() - INTERVAL '10 days')", [userId]);

        // 4. Add Donations
        await query("INSERT INTO donations (user_id, amount, date, method) VALUES ($1, 100.00, NOW() - INTERVAL '12 days', 'Online')", [userId]);

        // 5. Add Attendance
        const events = await query("SELECT id FROM events LIMIT 4");
        for (const evt of events.rows) {
            await query("INSERT INTO attendance (user_id, event_id, checked_in_at) VALUES ($1, $2, NOW() - INTERVAL '5 days') ON CONFLICT DO NOTHING", [userId, evt.id]);
        }

        console.log('✅ Seeding complete.');
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        process.exit();
    }
};

seed();
