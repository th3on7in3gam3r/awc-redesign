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

async function createMediaConsentSchema() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('Starting media consent schema migration...\n');

        // 1. Add consent columns to user_profiles table
        console.log('1. Adding consent columns to user_profiles...');

        // Create enum type for consent status
        await client.query(`
            DO $$ BEGIN
                CREATE TYPE media_consent_status AS ENUM ('consent', 'decline', 'unset');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Add columns to user_profiles
        await client.query(`
            ALTER TABLE user_profiles
            ADD COLUMN IF NOT EXISTS media_consent_status media_consent_status DEFAULT 'unset',
            ADD COLUMN IF NOT EXISTS media_consent_updated_at TIMESTAMPTZ,
            ADD COLUMN IF NOT EXISTS media_consent_source TEXT,
            ADD COLUMN IF NOT EXISTS media_consent_notes TEXT;
        `);

        console.log('   ✓ Added consent columns to user_profiles');

        // 2. Add consent columns to children table
        console.log('2. Adding consent columns to children...');

        await client.query(`
            ALTER TABLE children
            ADD COLUMN IF NOT EXISTS media_consent_status media_consent_status DEFAULT 'unset',
            ADD COLUMN IF NOT EXISTS media_consent_updated_at TIMESTAMPTZ;
        `);

        console.log('   ✓ Added consent columns to children');

        // 3. Create media_consent_log audit table
        console.log('3. Creating media_consent_log audit table...');

        await client.query(`
            CREATE TABLE IF NOT EXISTS media_consent_log (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
                child_id UUID REFERENCES children(id) ON DELETE CASCADE,
                status media_consent_status NOT NULL,
                source TEXT NOT NULL,
                ip_hash TEXT,
                user_agent TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        // Create index for faster lookups
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_media_consent_log_profile 
            ON media_consent_log(profile_id, created_at DESC);
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_media_consent_log_child 
            ON media_consent_log(child_id, created_at DESC) 
            WHERE child_id IS NOT NULL;
        `);

        console.log('   ✓ Created media_consent_log table with indexes');

        // 4. Verify the changes
        console.log('\n4. Verifying schema changes...');

        const profileColumns = await client.query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_name = 'user_profiles' 
            AND column_name LIKE 'media_consent%'
            ORDER BY column_name;
        `);

        console.log('   User profiles consent columns:');
        profileColumns.rows.forEach(col => {
            console.log(`     - ${col.column_name} (${col.data_type})`);
        });

        const childColumns = await client.query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_name = 'children' 
            AND column_name LIKE 'media_consent%'
            ORDER BY column_name;
        `);

        console.log('   Children consent columns:');
        childColumns.rows.forEach(col => {
            console.log(`     - ${col.column_name} (${col.data_type})`);
        });

        const logTable = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'media_consent_log'
            ORDER BY ordinal_position;
        `);

        console.log('   Media consent log columns:');
        logTable.rows.forEach(col => {
            console.log(`     - ${col.column_name} (${col.data_type})`);
        });

        await client.query('COMMIT');

        console.log('\n✅ Media consent schema migration completed successfully!');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run the migration
createMediaConsentSchema().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
