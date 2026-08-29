
import { query } from '../db.mjs';

async function migrate() {
    console.log('Adding attachment columns to chat_messages...');
    try {
        await query(`
            ALTER TABLE chat_messages
            ADD COLUMN IF NOT EXISTS attachment_url TEXT,
            ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(50);
        `);
        console.log('✅ Columns added successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
