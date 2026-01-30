import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function createSessionTables() {
    const client = await pool.connect();

    try {
        console.log('Creating session tables...');

        // Create user_sessions table
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
                session_token TEXT NOT NULL UNIQUE,
                device_info JSONB,
                ip_address TEXT,
                location TEXT,
                user_agent TEXT,
                last_active_at TIMESTAMP DEFAULT NOW(),
                created_at TIMESTAMP DEFAULT NOW(),
                revoked_at TIMESTAMP
            );
        `);
        console.log('✓ Created user_sessions table');

        // Create indexes for user_sessions
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
        `);
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
        `);
        console.log('✓ Created indexes for user_sessions');

        // Create login_history table
        await client.query(`
            CREATE TABLE IF NOT EXISTS login_history (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES people(id) ON DELETE CASCADE,
                email TEXT NOT NULL,
                success BOOLEAN NOT NULL,
                ip_address TEXT,
                location TEXT,
                user_agent TEXT,
                failure_reason TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✓ Created login_history table');

        // Create indexes for login_history
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
        `);
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON login_history(created_at DESC);
        `);
        console.log('✓ Created indexes for login_history');

        console.log('\n✅ All session tables created successfully!');
    } catch (err) {
        console.error('Error creating session tables:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

createSessionTables();
