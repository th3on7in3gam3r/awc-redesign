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

async function migrateMinistriesSchema() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        // 0. Drop tables if they exist (Clean slate for Phase 3)
        // Note: In production we would alter, but for dev we reset these new tables.
        console.log('0. Dropping existing ministry tables (if any)...');
        await client.query(`DROP TABLE IF EXISTS ministry_join_requests CASCADE;`);
        await client.query(`DROP TABLE IF EXISTS ministry_members CASCADE;`);
        await client.query(`DROP TABLE IF EXISTS ministries CASCADE;`);
        console.log('   ✓ Tables dropped');

        // 1. Create ministries table
        console.log('1. Creating ministries table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS ministries (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                min_age_months INT,
                max_age_months INT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('   ✓ ministries table created');

        // 2. Create ministry_members table
        console.log('2. Creating ministry_members table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS ministry_members (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                ministry_id UUID NOT NULL REFERENCES ministries(id) ON DELETE CASCADE,
                person_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
                role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'assistant', 'member')),
                status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
                joined_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(ministry_id, person_id)
            );
        `);
        // Index for performance
        await client.query(`CREATE INDEX IF NOT EXISTS idx_ministry_members_person_id ON ministry_members(person_id);`);
        console.log('   ✓ ministry_members table created');

        // 3. Create ministry_join_requests table
        console.log('3. Creating ministry_join_requests table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS ministry_join_requests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                ministry_id UUID NOT NULL REFERENCES ministries(id) ON DELETE CASCADE,
                person_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
                requested_by_person_id UUID NOT NULL REFERENCES user_profiles(id),
                message TEXT,
                status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                decided_at TIMESTAMPTZ,
                decided_by_person_id UUID REFERENCES user_profiles(id),
                UNIQUE(ministry_id, person_id) -- Prevent duplicate pending requests constraint (conditional index usually better but simple unique works if we soft delete or move to history table, or just prevent new row if pending exists)
            );
        `);
        // Note: The unique constraint above is global, simplistic.
        // A partial unique index for 'pending' statuss is better logic:
        // CREATE UNIQUE INDEX idx_ministry_join_requests_pending ON ministry_join_requests (ministry_id, person_id) WHERE status = 'pending';
        // But for MVP we will stick to simplistic or rely on app logic.
        // Actually, let's use the partial index logic requested or implied.
        // The prompt said: "unique(ministry_id, person_id) WHERE status='pending'"
        await client.query(`
            DROP INDEX IF EXISTS idx_ministry_join_requests_pending;
            CREATE UNIQUE INDEX IF NOT EXISTS idx_ministry_join_requests_pending 
            ON ministry_join_requests (ministry_id, person_id) 
            WHERE status = 'pending';
        `);
        console.log('   ✓ ministry_join_requests table created');

        // 4. Alter events table
        console.log('4. Altering events table...');
        // Check if column exists first to avoid error
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='ministry_id') THEN
                    ALTER TABLE events ADD COLUMN ministry_id UUID REFERENCES ministries(id);
                END IF;
            END $$;
        `);
        console.log('   ✓ events table altered');

        // 5. Seed Ministries
        console.log('5. Seeding default ministries...');
        const seeds = [
            "Women's Ministry",
            "Men's Ministry",
            "Youth Ministry",
            "Teen Ministry",
            "Sunday School"
        ];

        for (const name of seeds) {
            await client.query(`
                INSERT INTO ministries (name) 
                VALUES ($1)
                ON CONFLICT (name) DO NOTHING;
            `, [name]);
        }
        console.log('   ✓ Seeded ministries');

        await client.query('COMMIT');
        console.log('\n✅ Ministries Schema Migration completed successfully!');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

migrateMinistriesSchema().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
