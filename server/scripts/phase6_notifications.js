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

async function migratePhase6() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('Starting Phase 6 migration: Notifications + Audit + Chat Reads + Holds...\n');

        // Drop existing tables if they exist (clean migration)
        console.log('0. Dropping existing Phase 6 tables if they exist...');
        await client.query('DROP TABLE IF EXISTS notifications CASCADE');
        await client.query('DROP TABLE IF EXISTS audit_log CASCADE');
        await client.query('DROP TABLE IF EXISTS chat_reads CASCADE');
        await client.query('DROP TABLE IF EXISTS holds CASCADE');
        console.log('   ✓ Existing tables dropped\n');

        // 1. Notifications Table
        console.log('1. Creating notifications table...');
        await client.query(`
            CREATE TABLE notifications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                recipient_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                body TEXT,
                href TEXT,
                metadata JSONB DEFAULT '{}'::jsonb,
                is_read BOOLEAN DEFAULT false,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_notifications_recipient 
            ON notifications(recipient_profile_id, is_read, created_at DESC);
        `);
        console.log('   ✓ notifications table created');

        // 2. Audit Log Table
        console.log('2. Creating audit_log table...');
        await client.query(`
            CREATE TABLE audit_log (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                actor_profile_id UUID REFERENCES user_profiles(id),
                actor_role TEXT,
                action TEXT NOT NULL,
                entity_type TEXT,
                entity_id UUID,
                summary TEXT,
                diff JSONB DEFAULT '{}'::jsonb,
                ip TEXT,
                user_agent TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        // Create indexes after table exists
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_audit_entity 
            ON audit_log(entity_type, entity_id, created_at DESC);
        `);
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_audit_actor 
            ON audit_log(actor_profile_id, created_at DESC);
        `);
        console.log('   ✓ audit_log table created');

        // 3. Chat Reads Table
        console.log('3. Creating chat_reads table...');
        await client.query(`
            CREATE TABLE chat_reads (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
                user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
                last_read_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(channel_id, user_id)
            );
        `);
        console.log('   ✓ chat_reads table created');

        // 4. Holds Table
        console.log('4. Creating holds table...');
        await client.query(`
            CREATE TABLE holds (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                type TEXT NOT NULL,
                requested_by_profile_id UUID REFERENCES user_profiles(id),
                status TEXT DEFAULT 'PENDING',
                target_date DATE,
                target_resource TEXT,
                notes TEXT,
                expires_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('   ✓ holds table created');

        await client.query('COMMIT');
        console.log('\n✅ Phase 6 migration completed successfully!');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

migratePhase6().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
