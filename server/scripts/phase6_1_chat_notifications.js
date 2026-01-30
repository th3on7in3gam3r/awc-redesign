/**
 * Phase 6.1: Chat Notifications - Database Migration
 * 
 * Creates chat_reads table for tracking unread messages
 */

import { query } from '../db.mjs';

async function migrate() {
    console.log('🚀 Starting Phase 6.1 migration: Chat Notifications...');

    try {
        // Create chat_reads table (using person_id to match existing schema)
        await query(`
            CREATE TABLE IF NOT EXISTS chat_reads (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
                person_id UUID NOT NULL,
                last_read_at TIMESTAMPTZ DEFAULT NOW(),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(channel_id, person_id)
            )
        `);
        console.log('✅ Created chat_reads table');

        // Add indexes for performance
        await query(`
            CREATE INDEX IF NOT EXISTS idx_chat_reads_channel_person 
            ON chat_reads(channel_id, person_id)
        `);
        console.log('✅ Created index on chat_reads');

        await query(`
            CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at 
            ON chat_messages(created_at)
        `);
        console.log('✅ Created index on chat_messages.created_at');

        console.log('✨ Phase 6.1 migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

migrate()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
