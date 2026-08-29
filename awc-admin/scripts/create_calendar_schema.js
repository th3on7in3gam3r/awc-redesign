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

async function migrateCalendarSchema() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('Starting Staff Calendar Schema Migration...\n');

        // 1. Create resources table
        console.log('1. Creating resources table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS resources (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT UNIQUE NOT NULL,
                capacity INT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('   ✓ resources table created');

        // 2. Create events table
        console.log('2. Creating events table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS events (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title TEXT NOT NULL,
                description TEXT,
                ministry_id UUID, -- Nullable for now, can perform loose join or plain text storage if ministries table missing
                ministry_label TEXT, -- Fallback label
                requested_by_person_id UUID NOT NULL REFERENCES user_profiles(id),
                approved_by_person_id UUID REFERENCES user_profiles(id),
                status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'booked', 'canceled', 'completed')),
                starts_at TIMESTAMPTZ NOT NULL,
                ends_at TIMESTAMPTZ NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        // Indexes for performance
        await client.query(`CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);`);

        console.log('   ✓ events table created');

        // 3. Create event_bookings table (Junction for Event <-> Resource)
        console.log('3. Creating event_bookings table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS event_bookings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
                resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(event_id, resource_id)
            );
        `);
        // Index for conflict checking
        await client.query(`CREATE INDEX IF NOT EXISTS idx_event_bookings_resource_id ON event_bookings(resource_id);`);
        console.log('   ✓ event_bookings table created');

        // 4. Seed initial resources
        console.log('4. Seeding resources...');
        const resources = [
            'Sanctuary',
            'Fellowship Hall',
            'Communion Room',
            'Classroom A',
            'Classroom B'
        ];

        for (const name of resources) {
            await client.query(`
                INSERT INTO resources (name, capacity) 
                VALUES ($1, NULL)
                ON CONFLICT (name) DO NOTHING
            `, [name]);
        }
        console.log(`   ✓ Seeded ${resources.length} resources`);

        await client.query('COMMIT');
        console.log('\n✅ Staff Calendar migration completed successfully!');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

migrateCalendarSchema().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
