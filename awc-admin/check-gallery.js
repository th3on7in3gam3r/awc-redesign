
import { query } from './db.mjs';

async function check() {
    try {
        const res = await query('SELECT count(*) FROM gallery_items');
        console.log('Count:', res.rows[0]);
        const items = await query('SELECT * FROM gallery_items');
        console.log('Items:', JSON.stringify(items.rows, null, 2));
    } catch (e) {
        console.error(e);
    }
}
check();
