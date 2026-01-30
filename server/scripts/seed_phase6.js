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

async function seedPhase6() {
    const client = await pool.connect();

    try {
        console.log('Seeding Phase 6 sample data...\n');

        // Get a sample user to use as recipient
        const userRes = await client.query('SELECT id FROM user_profiles LIMIT 1');
        if (userRes.rows.length === 0) {
            console.log('❌ No users found. Please create a user first.');
            return;
        }
        const userId = userRes.rows[0].id;

        // 1. Create sample notifications
        console.log('1. Creating sample notifications...');
        await client.query(`
            INSERT INTO notifications (recipient_profile_id, type, title, body, href, is_read)
            VALUES
                ($1, 'SYSTEM', 'Welcome to AWC-Connect!', 'Complete your profile to get started.', '/dashboard/profile', false),
                ($1, 'EVENT_APPROVED', 'Event Approved', 'Your event "Youth Rally" has been approved for March 15th.', '/dashboard/events', false),
                ($1, 'MINISTRY_REQUEST', 'Ministry Request Pending', 'Your request to join the Worship Team is pending approval.', '/dashboard/ministries', true)
        `, [userId]);
        console.log('   ✓ Created 3 sample notifications');

        // 2. Create sample audit log entries
        console.log('2. Creating sample audit log entries...');
        await client.query(`
            INSERT INTO audit_log (actor_profile_id, actor_role, action, entity_type, entity_id, summary)
            VALUES
                ($1, 'admin', 'PROFILE_UPDATE', 'profile', $1, 'Updated profile information'),
                ($1, 'admin', 'EVENT_CREATE', 'event', gen_random_uuid(), 'Created new event: Sunday Service'),
                ($1, 'admin', 'CONSENT_SET', 'consent', $1, 'Updated media consent to: consent')
        `, [userId]);
        console.log('   ✓ Created 3 sample audit entries');

        // 3. Create sample hold
        console.log('3. Creating sample hold...');
        await client.query(`
            INSERT INTO holds (type, requested_by_profile_id, status, target_date, target_resource, notes)
            VALUES
                ('ROOM_HOLD', $1, 'PENDING', CURRENT_DATE + INTERVAL '7 days', 'Fellowship Hall', 'Need for youth event')
        `, [userId]);
        console.log('   ✓ Created 1 sample hold');

        console.log('\n✅ Phase 6 seed data created successfully!');

    } catch (err) {
        console.error('❌ Seeding failed:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

seedPhase6().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
