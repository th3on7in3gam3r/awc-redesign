import dotenv from 'dotenv';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function createChatSchema() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Creating chat schema...');

        // 1. chat_channels
        await client.query(`
      CREATE TABLE IF NOT EXISTS chat_channels (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL DEFAULT 'general', -- 'general', 'ministry', 'department', 'private'
        ministry_id UUID REFERENCES ministries(id) ON DELETE SET NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_by_person_id UUID REFERENCES user_profiles(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

        // 2. chat_channel_members
        await client.query(`
      CREATE TABLE IF NOT EXISTS chat_channel_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
        person_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'moderator', 'member'
        last_read_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(channel_id, person_id)
      );
    `);

        // 3. chat_messages
        await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
        sender_person_id UUID NOT NULL REFERENCES user_profiles(id),
        message_text TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

        // Indexes
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_created ON chat_messages(channel_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_chat_channel_members_person ON chat_channel_members(person_id);
    `);

        console.log('Tables created. Seeding channels...');

        // Need a valid creator ID. We'll try to find an admin.
        const adminRes = await client.query(`
        SELECT id FROM user_profiles 
        WHERE role = 'admin' 
        LIMIT 1
    `);

        // If no admin, just find ANY person, or use NULL if referential integrity allows (it doesn't for strict FKs usually, but let's see).
        // The created_by_person_id is nullable in my CREATE TABLE above? Yes: "UUID REFERENCES people(id)".
        // So if no admin found, we can leave it null.

        let creatorId = adminRes.rows[0]?.id || null;

        const channelsToSeed = [
            { name: '#staff-general', type: 'general' },
            { name: '#finance', type: 'department' }, // Finance access only
            { name: '#sunday-school', type: 'ministry' },
            { name: '#men-ministry', type: 'ministry' },
            { name: '#women-ministry', type: 'ministry' },
            { name: '#youth-ministry', type: 'ministry' },
            { name: '#teen-ministry', type: 'ministry' }
        ];

        for (const ch of channelsToSeed) {
            // Upsert channel
            const res = await client.query(`
            INSERT INTO chat_channels (name, type, created_by_person_id)
            VALUES ($1, $2, $3)
            ON CONFLICT (name) DO NOTHING
            RETURNING id;
        `, [ch.name, ch.type, creatorId]);

            if (res.rowCount > 0) {
                console.log(`Created channel: ${ch.name}`);
            } else {
                console.log(`Channel already exists: ${ch.name}`);
            }
        }

        await client.query('COMMIT');
        console.log('Chat schema created and seeded successfully.');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating chat schema:', err);
    } finally {
        client.release();
        pool.end();
    }
}

createChatSchema();
