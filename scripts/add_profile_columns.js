
import { query } from '../server/db.mjs';

const migrate = async () => {
    try {
        console.log('Adding specific profile columns...');
        await query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
            ADD COLUMN IF NOT EXISTS address TEXT,
            ADD COLUMN IF NOT EXISTS bio TEXT
        `);
        console.log('✅ Added phone, address, bio columns');
    } catch (err) {
        console.error('❌ Error executing migration:', err);
    } finally {
        process.exit();
    }
};

migrate();
