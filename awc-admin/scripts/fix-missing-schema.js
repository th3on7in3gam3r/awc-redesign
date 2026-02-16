/**
 * Fix Missing Schema Items
 * Creates missing tables and columns identified during debugging
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixMissingSchema() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        // 1. Create checkins table
        console.log('📦 Creating checkins table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS checkins (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                session_id UUID,
                event_id UUID,
                user_id UUID REFERENCES user_profiles(id),
                guest_name VARCHAR(100),
                guest_phone VARCHAR(20),
                guest_email VARCHAR(100),
                adults INTEGER DEFAULT 1,
                children INTEGER DEFAULT 0,
                first_time BOOLEAN DEFAULT false,
                contact_ok BOOLEAN DEFAULT true,
                type VARCHAR(20) DEFAULT 'member', 
                prayer_request TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('   ✅ checkins table ready');

        // 2. Add status to ministry_members
        console.log('\n🔧 Updating ministry_members...');
        await client.query(`
            ALTER TABLE ministry_members 
            ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'
        `);
        console.log('   ✅ Added status column');

        // 3. Add last_read_at to chat_channel_members
        console.log('\n🔧 Updating chat_channel_members...');
        await client.query(`
            ALTER TABLE chat_channel_members 
            ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP DEFAULT NOW()
        `);
        console.log('   ✅ Added last_read_at column');

        // 4. Create giving_intents (referenced in Pulse)
        console.log('\n📦 Creating giving_intents table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS giving_intents (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES user_profiles(id),
                amount DECIMAL(10, 2),
                fund VARCHAR(50),
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('   ✅ giving_intents table ready');

        // 5. Create prayer_requests (referenced in Pulse)
        console.log('\n📦 Creating prayer_requests table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS prayer_requests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES user_profiles(id),
                content TEXT NOT NULL,
                is_anonymous BOOLEAN DEFAULT false,
                is_private BOOLEAN DEFAULT false,
                status VARCHAR(20) DEFAULT 'open',
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('   ✅ prayer_requests table ready');

        // 6. Create children table (referenced in Checkin)
        console.log('\n📦 Creating children table...');
        await client.query(`
             CREATE TABLE IF NOT EXISTS children (
                 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                 parent_user_id UUID REFERENCES user_profiles(id),
                 first_name VARCHAR(50),
                 last_name VARCHAR(50),
                 dob DATE,
                 allergies TEXT,
                 notes TEXT,
                 created_at TIMESTAMP DEFAULT NOW()
             );
         `);
        console.log('   ✅ children table ready');

        // 7. Create program_sessions and program_checkins
        console.log('\n📦 Creating program tables...');
        await client.query(`
             CREATE TABLE IF NOT EXISTS program_sessions (
                 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                 service_date DATE,
                 program_type VARCHAR(50),
                 is_active BOOLEAN DEFAULT true,
                 created_at TIMESTAMP DEFAULT NOW()
             );
 
             CREATE TABLE IF NOT EXISTS program_checkins (
                 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                 session_id UUID REFERENCES program_sessions(id),
                 child_id UUID REFERENCES children(id),
                 parent_user_id UUID REFERENCES user_profiles(id),
                 teen_user_id UUID REFERENCES user_profiles(id),
                 program VARCHAR(50),
                 pickup_code VARCHAR(10),
                 picked_up_at TIMESTAMP,
                 picked_up_by VARCHAR(100),
                 emergency_contact_name VARCHAR(100),
                 emergency_contact_phone VARCHAR(20),
                 notes TEXT,
                 created_at TIMESTAMP DEFAULT NOW()
             );
         `);
        console.log('   ✅ program tables ready');

        console.log('\n✅ All missing schema items created!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

fixMissingSchema();
