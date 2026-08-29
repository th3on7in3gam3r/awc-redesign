/**
 * Fix All Missing Schema
 * Creates missing tables and adds missing columns identified in 500 errors.
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixAllSchema() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        // 1. Update user_profiles (Used in /api/staff/people)
        console.log('🛠️ Updating user_profiles...');
        await client.query(`
            ALTER TABLE user_profiles 
            ADD COLUMN IF NOT EXISTS person_type VARCHAR(20) DEFAULT 'adult',
            ADD COLUMN IF NOT EXISTS membership_status VARCHAR(50) DEFAULT 'visitor',
            ADD COLUMN IF NOT EXISTS media_consent_status VARCHAR(20) DEFAULT 'unset',
            ADD COLUMN IF NOT EXISTS media_consent_updated_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS media_consent_source VARCHAR(50),
            ADD COLUMN IF NOT EXISTS tags TEXT[],
            ADD COLUMN IF NOT EXISTS notes TEXT,
            ADD COLUMN IF NOT EXISTS date_of_birth DATE;
        `);

        // 2. Create households (Used in /api/staff/households)
        console.log('📦 Creating/Updating households...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS households (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                household_name VARCHAR(255) NOT NULL,
                address_line1 VARCHAR(255),
                address_line2 VARCHAR(255),
                city VARCHAR(100),
                state VARCHAR(50),
                zip VARCHAR(20),
                primary_phone VARCHAR(50),
                primary_email VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 3. Create household_members
        console.log('📦 Creating/Updating household_members...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS household_members (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                household_id UUID REFERENCES households(id) ON DELETE CASCADE,
                person_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
                relationship VARCHAR(50),
                is_primary_contact BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(household_id, person_id)
            );
        `);

        // 4. Create resources (Used in /api/staff/resources)
        console.log('📦 Creating resources...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS resources (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL UNIQUE,
                capacity INT DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 5. Create audit_log (Used in logging)
        console.log('📦 Creating audit_log...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS audit_log (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                actor_profile_id UUID REFERENCES user_profiles(id),
                actor_role VARCHAR(50),
                action VARCHAR(100),
                entity_type VARCHAR(50),
                entity_id UUID,
                summary TEXT,
                diff JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 6. Create event_bookings (Used in /api/staff/events)
        console.log('📦 Creating event_bookings...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS event_bookings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                event_id UUID REFERENCES events(id) ON DELETE CASCADE,
                resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(event_id, resource_id)
            );
        `);

        // 7. Create giving_options (Used in /api/giving/options)
        console.log('📦 Creating giving_options...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS giving_options (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title VARCHAR(100) NOT NULL,
                category VARCHAR(50) NOT NULL,
                url VARCHAR(255),
                provider VARCHAR(50),
                is_primary BOOLEAN DEFAULT false,
                is_active BOOLEAN DEFAULT true,
                sort_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 8. Create giving_content
        console.log('📦 Creating giving_content...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS giving_content (
                key VARCHAR(100) PRIMARY KEY,
                value TEXT,
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 9. Create ministry_requests (Used in /api/tasks/pending)
        console.log('📦 Creating ministry_requests...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS ministry_requests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                ministry_name VARCHAR(100),
                user_id UUID REFERENCES user_profiles(id),
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 10. Update events table (Ensure columns exist)
        console.log('🛠️ Updating events...');
        await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS requested_by_person_id UUID REFERENCES user_profiles(id),
            ADD COLUMN IF NOT EXISTS location VARCHAR(255),
            ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES user_profiles(id),
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
        `);

        console.log('\n✅ All schemas fixed successfully!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixAllSchema();
