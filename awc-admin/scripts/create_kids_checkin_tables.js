import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function createKidsCheckinTables() {
    const client = await pool.connect();

    try {
        console.log('Starting Kids & Youth Check-In tables creation...');

        await client.query('BEGIN');

        // 1. Create children table
        console.log('Creating children table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS children (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                parent_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                dob DATE NOT NULL,
                allergies TEXT,
                notes TEXT,
                authorized_pickup_names TEXT[],
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_children_parent ON children(parent_user_id);
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_children_dob ON children(dob);
        `);

        // 2. Create program_sessions table
        console.log('Creating program_sessions table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS program_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                program TEXT NOT NULL CHECK (program IN ('daycare', 'youth', 'teen')),
                service_date DATE NOT NULL,
                status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
                opened_at TIMESTAMP DEFAULT NOW(),
                closed_at TIMESTAMP,
                opened_by UUID REFERENCES user_profiles(id),
                closed_by UUID REFERENCES user_profiles(id),
                UNIQUE(program, service_date)
            );
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_program_sessions_date ON program_sessions(service_date, program);
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_program_sessions_status ON program_sessions(status);
        `);

        // 3. Create program_checkins table
        console.log('Creating program_checkins table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS program_checkins (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                session_id UUID NOT NULL REFERENCES program_sessions(id) ON DELETE CASCADE,
                program TEXT NOT NULL CHECK (program IN ('daycare', 'youth', 'teen')),
                
                -- For Daycare & Youth (child check-ins)
                child_id UUID REFERENCES children(id) ON DELETE CASCADE,
                parent_user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
                
                -- For Teen (self check-in)
                teen_user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
                
                -- Contact & Safety
                emergency_contact_name TEXT,
                emergency_contact_phone TEXT,
                notes TEXT,
                
                -- Pickup Management
                pickup_code TEXT,
                picked_up_at TIMESTAMP,
                picked_up_by TEXT,
                
                -- Timestamps
                checked_in_at TIMESTAMP DEFAULT NOW(),
                
                -- Constraints
                CHECK (
                    (program = 'teen' AND teen_user_id IS NOT NULL AND child_id IS NULL) OR
                    (program IN ('daycare', 'youth') AND child_id IS NOT NULL AND teen_user_id IS NULL)
                )
            );
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_program_checkins_session ON program_checkins(session_id);
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_program_checkins_child ON program_checkins(child_id);
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_program_checkins_teen ON program_checkins(teen_user_id);
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_program_checkins_pickup ON program_checkins(pickup_code) WHERE pickup_code IS NOT NULL;
        `);

        await client.query('COMMIT');

        console.log('✅ All Kids & Youth Check-In tables created successfully!');
        console.log('Tables created:');
        console.log('  - children');
        console.log('  - program_sessions');
        console.log('  - program_checkins');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error creating tables:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

createKidsCheckinTables()
    .then(() => {
        console.log('Migration completed successfully');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Migration failed:', err);
        process.exit(1);
    });
