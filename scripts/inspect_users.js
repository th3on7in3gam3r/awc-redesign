
import { query } from '../server/db.mjs';

const inspect = async () => {
    try {
        console.log('Inspecting users table...');
        const res = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
        console.log(res.rows);
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        process.exit();
    }
};

inspect();
