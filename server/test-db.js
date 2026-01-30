import { query } from './db.mjs';

async function test() {
    console.log('Testing DB connection...');
    try {
        const result = await query('SELECT NOW()');
        console.log('DB Time:', result.rows[0].now);

        const tables = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', tables.rows.map(r => r.table_name));

        const userCount = await query('SELECT COUNT(*) FROM user_profiles');
        console.log('User count:', userCount.rows[0].count);
    } catch (err) {
        console.error('DB Test Failed:', err);
    } finally {
        process.exit();
    }
}

test();
