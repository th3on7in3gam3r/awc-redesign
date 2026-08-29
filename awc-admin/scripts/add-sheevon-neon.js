/**
 * Add Sheevon to #staff-general using direct Neon connection
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function addSheevonToChannel() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database');

        // Add Sheevon to #staff-general
        console.log('\n➕ Adding Sheevon to #staff-general...');
        const insertResult = await client.query(`
            INSERT INTO chat_channel_members (channel_id, person_id, role)
            SELECT c.id, p.id, 'member'
            FROM chat_channels c
            CROSS JOIN people p
            JOIN user_profiles up ON up.person_id = p.id
            WHERE c.name = '#staff-general' AND up.email = 'ksheevon@gmail.com'
            ON CONFLICT DO NOTHING
            RETURNING *
        `);

        if (insertResult.rowCount > 0) {
            console.log('✅ Successfully added Sheevon to #staff-general!');
        } else {
            console.log('ℹ️  Sheevon was already a member or not found');
        }

        // Show all members
        console.log('\n👥 Current #staff-general members:');
        const membersResult = await client.query(`
            SELECT p.first_name, p.last_name, up.email, ccm.role, ccm.joined_at
            FROM chat_channel_members ccm
            JOIN people p ON p.id = ccm.person_id
            JOIN user_profiles up ON up.person_id = p.id
            JOIN chat_channels c ON c.id = ccm.channel_id
            WHERE c.name = '#staff-general'
            ORDER BY ccm.joined_at
        `);

        membersResult.rows.forEach((member, idx) => {
            console.log(`   ${idx + 1}. ${member.first_name} ${member.last_name} (${member.email}) - ${member.role}`);
        });

        console.log('\n✅ Done! Sheevon should now receive notifications when you send messages to #staff-general');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

addSheevonToChannel();
