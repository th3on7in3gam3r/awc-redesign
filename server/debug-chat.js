
import { query } from './db.mjs';

async function test() {
    console.log('Starting debug test...');
    try {
        // 1. Get a valid user ID (admin) to simulate the request
        const userRes = await query(`SELECT id FROM people LIMIT 1`);
        if (userRes.rows.length === 0) {
            console.error('No users found in people table');
            return;
        }
        const userId = userRes.rows[0].id;
        console.log('Testing with userId:', userId);

        // 2. Run the channels query
        const channelsRes = await query(`
            SELECT id, name, is_staff_only, created_at
            FROM chat_channels
            ORDER BY created_at DESC
        `);
        console.log(`Found ${channelsRes.rows.length} channels`);

        // 3. Loop and run the detailed queries
        for (const channel of channelsRes.rows) {
            console.log(`Checking channel: ${channel.name} (${channel.id})`);

            const lastReadRes = await query(`
                SELECT last_read_at
                FROM chat_reads
                WHERE channel_id = $1 AND user_id = $2
            `, [channel.id, userId]);

            console.log('lastReadRes row count:', lastReadRes.rows.length);

            const lastReadAt = lastReadRes.rows[0]?.last_read_at || new Date(0);
            console.log('lastReadAt:', lastReadAt);

            const unreadRes = await query(`
                SELECT COUNT(*) as count
                FROM chat_messages
                WHERE channel_id = $1 AND created_at > $2
            `, [channel.id, lastReadAt]);

            console.log('unread count raw:', unreadRes.rows[0].count);
            const unreadCount = parseInt(unreadRes.rows[0].count);
            console.log('unread count parsed:', unreadCount);
        }

        console.log('Test completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('CRITICAL ERROR:', err);
        process.exit(1);
    }
}

test();
