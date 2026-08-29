
import { query } from '../server/db.mjs';

const migrate = async () => {
    try {
        console.log('Creating or updating engagement tables...');

        // 1. Update/Verify Ministries Table (Exists with UUID, need to add columns)
        // We use ADD COLUMN IF NOT EXISTS logic implicitly by catching errors or checking, 
        // but simple ALTER statements usually error if column exists without safeguard in older postgres.
        // However, 'ADD COLUMN IF NOT EXISTS' exists in Postgres 9.6+.

        await query(`
            ALTER TABLE ministries 
            ADD COLUMN IF NOT EXISTS leader_id INTEGER REFERENCES users(id),
            ADD COLUMN IF NOT EXISTS schedule VARCHAR(255)
        `);
        console.log('✅ Updated ministries table schema');

        // 2. Ministry Members Table (Links INT user to UUID ministry)
        await query(`
            CREATE TABLE IF NOT EXISTS ministry_members (
                id SERIAL PRIMARY KEY,
                ministry_id UUID REFERENCES ministries(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                role VARCHAR(100) DEFAULT 'Volunteer',
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(ministry_id, user_id)
            )
        `);
        console.log('✅ Created ministry_members table');

        // 3. Prayer Requests Table
        await query(`
            CREATE TABLE IF NOT EXISTS prayer_requests (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                request_text TEXT NOT NULL,
                is_anonymous BOOLEAN DEFAULT false,
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created prayer_requests table');

        // 4. Donations Table
        await query(`
            CREATE TABLE IF NOT EXISTS donations (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                amount DECIMAL(10, 2) NOT NULL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                method VARCHAR(50) DEFAULT 'Online',
                notes TEXT
            )
        `);
        console.log('✅ Created donations table');

    } catch (err) {
        console.error('❌ Error executing migration:', err);
    } finally {
        process.exit();
    }
};

migrate();
