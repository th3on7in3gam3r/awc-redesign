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

async function migratePeopleSchema() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('Starting People Directory v2 migration...\n');

        // 1. Alter user_profiles table (The new "People" table)
        console.log('1. Altering user_profiles table...');
        await client.query(`
            ALTER TABLE user_profiles
            ADD COLUMN IF NOT EXISTS person_type TEXT DEFAULT 'adult' CHECK (person_type IN ('adult', 'child')),
            ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
            ADD COLUMN IF NOT EXISTS notes TEXT;
        `);
        // Ensure index on tags for fast filtering
        await client.query(`CREATE INDEX IF NOT EXISTS idx_user_profiles_tags ON user_profiles USING GIN (tags);`);
        console.log('   ✓ user_profiles updated');

        // 2. Create households table
        console.log('2. Creating households table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS households (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                household_name TEXT NOT NULL,
                address_line1 TEXT,
                address_line2 TEXT,
                city TEXT,
                state TEXT,
                zip TEXT,
                primary_phone TEXT,
                primary_email TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('   ✓ households table created');

        // 3. Create household_members table
        console.log('3. Creating household_members table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS household_members (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                household_id UUID REFERENCES households(id) ON DELETE CASCADE,
                person_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
                relationship TEXT NOT NULL, -- 'head'|'spouse'|'child'|'guardian'|'other'
                is_primary_contact BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(household_id, person_id)
            );
        `);
        console.log('   ✓ household_members table created');

        // 4. Data Migration: Move children to user_profiles
        console.log('4. Migrating children to user_profiles...');

        // Fetch existing children
        const childrenRes = await client.query('SELECT * FROM children');
        const children = childrenRes.rows;

        console.log(`   Found ${children.length} children to migrate.`);

        for (const child of children) {
            // Check if this child already exists in user_profiles (by some unique way? No, children typically don't have email/uniqueness enforcement like adults)
            // For now, we'll blindly insert, as we want them in the people directory.
            // Ideally we'd store the 'original_child_id' relative to the old table to prevent duplicates on re-runs, 
            // but for this MVP script we'll rely on the fact that user_profiles additions are new.
            // BETTER: Add a temporary column or check strictly. 
            // We'll check by name + dob + parent_user_id logic via 'notes' or just proceed.
            // To be safe against re-runs, let's assume if we find a 'child' with same name & dob, skip.

            const existing = await client.query(`
                SELECT id FROM user_profiles 
                WHERE first_name = $1 AND last_name = $2 AND date_of_birth = $3 AND person_type = 'child'
            `, [child.first_name, child.last_name, child.dob]);

            let personId;

            if (existing.rows.length > 0) {
                console.log(`   - Skipped (already migrated): ${child.first_name} ${child.last_name}`);
                personId = existing.rows[0].id;
            } else {
                const insertRes = await client.query(`
                    INSERT INTO user_profiles (
                        first_name, last_name, date_of_birth, 
                        person_type, 
                        media_consent_status, media_consent_updated_at,
                        notes, created_at
                    )
                    VALUES ($1, $2, $3, 'child', $4, $5, $6, $7)
                    RETURNING id
                `, [
                    child.first_name,
                    child.last_name,
                    child.dob,
                    child.media_consent_status || 'unset',
                    child.media_consent_updated_at,
                    `Migrated from children table (Parent ID: ${child.parent_user_id})`,
                    child.created_at
                ]);
                personId = insertRes.rows[0].id;
                console.log(`   - Migrated: ${child.first_name} ${child.last_name} -> ${personId}`);
            }

            // 5. Create Household for Parent <-> Child
            // Find parent
            const parentRes = await client.query('SELECT * FROM user_profiles WHERE id = $1', [child.parent_user_id]);
            if (parentRes.rows.length === 0) {
                console.warn(`   ! Parent ${child.parent_user_id} not found for child ${child.id}`);
                continue;
            }
            const parent = parentRes.rows[0];

            // Check if parent already has a household (where they are head/spouse)
            // For MVP migration, we might just look up ANY household linked to this parent.
            const householdRes = await client.query(`
                SELECT h.id 
                FROM households h
                JOIN household_members hm ON h.id = hm.household_id
                WHERE hm.person_id = $1
            `, [parent.id]);

            let householdId;

            if (householdRes.rows.length > 0) {
                householdId = householdRes.rows[0].id;
            } else {
                // Create new household for this family
                const newHousehold = await client.query(`
                    INSERT INTO households (household_name, primary_email, primary_phone, city, state)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id
                `, [
                    `${parent.last_name} Household`,
                    parent.email,
                    parent.phone,
                    parent.city,
                    parent.state
                ]);
                householdId = newHousehold.rows[0].id;
                console.log(`   + Created household: ${parent.last_name} Household`);

                // Add parent as 'head'
                await client.query(`
                    INSERT INTO household_members (household_id, person_id, relationship, is_primary_contact)
                    VALUES ($1, $2, 'head', true)
                `, [householdId, parent.id]);
            }

            // Add child to household
            await client.query(`
                INSERT INTO household_members (household_id, person_id, relationship)
                VALUES ($1, $2, 'child')
                ON CONFLICT (household_id, person_id) DO NOTHING
            `, [householdId, personId]);
        }

        await client.query('COMMIT');
        console.log('\n✅ People Directory v2 migration completed successfully!');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

migratePeopleSchema().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
