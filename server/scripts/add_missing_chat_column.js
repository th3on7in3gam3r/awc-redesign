
import { query } from '../db.mjs';

async function migrate() {
    console.log('Adding is_staff_only column to chat_channels...');
    try {
        await query(`
            ALTER TABLE chat_channels
            ADD COLUMN IF NOT EXISTS is_staff_only BOOLEAN DEFAULT false
        `);
        console.log('✅ Column added successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
