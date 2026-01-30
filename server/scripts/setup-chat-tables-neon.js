/**
 * Check and create chat tables in Neon database
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function setupChatTables() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database');

        // Check existing tables
        console.log('\n🔍 Checking existing tables...');
        const tablesResult = await client.query(`
            SELECT tablename FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename LIKE '%chat%'
            ORDER BY tablename
        `);

        console.log('Chat-related tables:', tablesResult.rows.map(r => r.tablename));

        // Create chat tables if they don't exist
        console.log('\n📦 Creating chat tables...');

        await client.query(`
            CREATE TABLE IF NOT EXISTS chat_channels (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL,
                type VARCHAR(50) NOT NULL DEFAULT 'general',
                description TEXT,
                created_by UUID,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ chat_channels table ready');

        await client.query(`
            CREATE TABLE IF NOT EXISTS chat_channel_members (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
                person_id UUID NOT NULL,
                role VARCHAR(50) DEFAULT 'member',
                joined_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(channel_id, person_id)
            );
        `);
        console.log('✅ chat_channel_members table ready');

        await client.query(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
                sender_person_id UUID NOT NULL,
                message_text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ chat_messages table ready');

        await client.query(`
            CREATE TABLE IF NOT EXISTS chat_reads (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
                user_id UUID NOT NULL,
                last_read_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(channel_id, user_id)
            );
        `);
        console.log('✅ chat_reads table ready');

        console.log('\n✅ All chat tables created successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

setupChatTables();
