
import { query } from '../server/db.mjs';

const reset = async () => {
    try {
        console.log('Resetting engagement tables...');

        // Drop tables in dependency order
        await query('DROP TABLE IF EXISTS ministry_members');
        await query('DROP TABLE IF EXISTS prayer_requests');
        await query('DROP TABLE IF EXISTS donations');
        // Check if we can drop ministries (might be used by something else, but unlikely given context)
        // We will TRY to drop it.
        await query('DROP TABLE IF EXISTS ministries CASCADE');

        console.log('✅ Tables dropped.');

        // Recreate them correctly (All using SERIAL/INTEGER logic compatible with users table)
        // Ministries
        await query(`
            CREATE TABLE ministries (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                leader_id INTEGER REFERENCES users(id),
                schedule VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created ministries');

        // Ministry Members
        await query(`
            CREATE TABLE ministry_members (
                id SERIAL PRIMARY KEY,
                ministry_id INTEGER REFERENCES ministries(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                role VARCHAR(100) DEFAULT 'Volunteer',
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(ministry_id, user_id)
            )
        `);
        console.log('✅ Created ministry_members');

        // Prayer Requests
        await query(`
            CREATE TABLE prayer_requests (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                request_text TEXT NOT NULL,
                is_anonymous BOOLEAN DEFAULT false,
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created prayer_requests');

        // Donations
        await query(`
            CREATE TABLE donations (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                amount DECIMAL(10, 2) NOT NULL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                method VARCHAR(50) DEFAULT 'Online',
                notes TEXT
            )
        `);
        console.log('✅ Created donations');

    } catch (err) {
        console.error('❌ Error executing reset:', err);
    } finally {
        process.exit();
    }
};

reset();
