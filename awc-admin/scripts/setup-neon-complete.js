/**
 * Complete Neon Database Setup
 * Creates all tables needed for AWC-Connect
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function setupCompleteDatabase() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        // 1. People table (core table)
        console.log('📦 Creating people table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS people (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(20),
                date_of_birth DATE,
                gender VARCHAR(20),
                address TEXT,
                city VARCHAR(100),
                state VARCHAR(50),
                zip VARCHAR(10),
                avatar TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ people');

        // 2. User Profiles (authentication)
        console.log('📦 Creating user_profiles table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_profiles (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                person_id UUID UNIQUE REFERENCES people(id) ON DELETE CASCADE,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                username VARCHAR(50) UNIQUE,
                username_lower VARCHAR(50) UNIQUE,
                role VARCHAR(50) DEFAULT 'member',
                is_active BOOLEAN DEFAULT TRUE,
                last_login TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ user_profiles');

        // 3. Notifications
        console.log('📦 Creating notifications table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                body TEXT,
                href VARCHAR(500),
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ notifications');

        // 4. Households
        console.log('📦 Creating households table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS households (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                address TEXT,
                city VARCHAR(100),
                state VARCHAR(50),
                zip VARCHAR(10),
                phone VARCHAR(20),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ households');

        await client.query(`
            CREATE TABLE IF NOT EXISTS household_members (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                household_id UUID REFERENCES households(id) ON DELETE CASCADE,
                person_id UUID REFERENCES people(id) ON DELETE CASCADE,
                relationship VARCHAR(50),
                is_head BOOLEAN DEFAULT FALSE,
                UNIQUE(household_id, person_id)
            );
        `);
        console.log('✅ household_members');

        // 5. Ministries
        console.log('📦 Creating ministries tables...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS ministries (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                description TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ ministries');

        await client.query(`
            CREATE TABLE IF NOT EXISTS ministry_members (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                ministry_id UUID REFERENCES ministries(id) ON DELETE CASCADE,
                person_id UUID REFERENCES people(id) ON DELETE CASCADE,
                role VARCHAR(50) DEFAULT 'member',
                joined_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(ministry_id, person_id)
            );
        `);
        console.log('✅ ministry_members');

        // 6. Events
        console.log('📦 Creating events table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS events (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title VARCHAR(255) NOT NULL,
                description TEXT,
                event_date TIMESTAMP NOT NULL,
                location VARCHAR(255),
                created_by UUID REFERENCES user_profiles(id),
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ events');

        // 7. Finance (already exists, but ensure it's there)
        console.log('📦 Creating finance tables...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS finance_entries (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                entry_date DATE NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                category VARCHAR(100),
                description TEXT,
                created_by UUID REFERENCES user_profiles(id),
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ finance_entries');

        // 8. Security tables
        console.log('📦 Creating security tables...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
                device_name VARCHAR(255),
                ip_address VARCHAR(45),
                user_agent TEXT,
                last_active TIMESTAMP DEFAULT NOW(),
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ user_sessions');

        await client.query(`
            CREATE TABLE IF NOT EXISTS login_history (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
                ip_address VARCHAR(45),
                user_agent TEXT,
                success BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ login_history');

        await client.query(`
            CREATE TABLE IF NOT EXISTS notification_preferences (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                profile_id UUID UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
                email_enabled BOOLEAN DEFAULT TRUE,
                push_enabled BOOLEAN DEFAULT TRUE,
                sms_enabled BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ notification_preferences');

        // Chat tables already exist, but verify
        console.log('\n📦 Verifying chat tables...');
        const chatTables = await client.query(`
            SELECT tablename FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename LIKE 'chat_%'
            ORDER BY tablename
        `);
        console.log(`✅ Found ${chatTables.rows.length} chat tables:`, chatTables.rows.map(r => r.tablename).join(', '));

        // List all tables
        console.log('\n📊 All tables in database:');
        const allTables = await client.query(`
            SELECT tablename FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename
        `);
        allTables.rows.forEach((row, idx) => {
            console.log(`   ${idx + 1}. ${row.tablename}`);
        });

        console.log('\n✅ Database setup complete!');
        console.log('\n⚠️  IMPORTANT: Restart your server for changes to take effect!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await client.end();
    }
}

setupCompleteDatabase();
