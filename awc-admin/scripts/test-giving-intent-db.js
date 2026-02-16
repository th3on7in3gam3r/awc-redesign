/**
 * Test Giving Intent DB Insert
 * Uses the application's db connection to test the insert.
 */

import { query } from '../db.mjs';

async function testInsert() {
    try {
        console.log('🧪 Testing insert...');

        // Use a dummy UUID for option, assume one exists or fetch it
        // We'll just try a select first to confirm connection
        const userCheck = await query('SELECT id FROM user_profiles LIMIT 1');
        if (userCheck.rows.length === 0) {
            console.error('❌ No users found to test with');
            process.exit(1);
        }
        const userId = userCheck.rows[0].id;
        console.log('👤 User ID:', userId);

        const optionCheck = await query('SELECT id FROM giving_options LIMIT 1');
        if (optionCheck.rows.length === 0) {
            console.error('❌ No giving options found');
            process.exit(1);
        }
        const optionId = optionCheck.rows[0].id;
        console.log('💸 Option ID:', optionId);

        // Perform Insert
        const res = await query(`
            INSERT INTO giving_intents (user_id, giving_option_id, amount, frequency)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [userId, optionId, 10.00, 'test-script']);

        console.log('✅ Insert successful:', res.rows[0]);

    } catch (err) {
        console.error('❌ Insert failed:', err);
    }
}

testInsert();
