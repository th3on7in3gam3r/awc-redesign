/**
 * Create #staff-general channel and add members
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function setupStaffGeneralChannel() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database');

        // Get all staff users
        console.log('\n🔍 Finding staff users...');
        const staffResult = await client.query(`
            SELECT p.id, p.first_name, p.last_name, up.email, up.role
            FROM people p
            JOIN user_profiles up ON up.person_id = p.id
            WHERE up.role IN ('admin', 'pastor', 'staff', 'finance', 'administrator', 'first_lady', 'ministry_leader', 'checkin_team')
            ORDER BY p.first_name
        `);

        console.log(`Found ${staffResult.rows.length} staff members:`);
        staffResult.rows.forEach((staff, idx) => {
            console.log(`   ${idx + 1}. ${staff.first_name} ${staff.last_name} (${staff.email}) - ${staff.role}`);
        });

        // Create or get #staff-general channel
        console.log('\n📢 Creating #staff-general channel...');
        const channelResult = await client.query(`
            INSERT INTO chat_channels (name, type, description)
            VALUES ('#staff-general', 'general', 'General discussion for all staff members')
            ON CONFLICT DO NOTHING
            RETURNING id
        `);

        let channelId;
        if (channelResult.rows.length > 0) {
            channelId = channelResult.rows[0].id;
            console.log('✅ Created #staff-general channel');
        } else {
            const existing = await client.query(`SELECT id FROM chat_channels WHERE name = '#staff-general'`);
            channelId = existing.rows[0].id;
            console.log('ℹ️  #staff-general channel already exists');
        }

        // Add all staff to the channel
        console.log('\n➕ Adding all staff members to #staff-general...');
        let addedCount = 0;

        for (const staff of staffResult.rows) {
            const result = await client.query(`
                INSERT INTO chat_channel_members (channel_id, person_id, role)
                VALUES ($1, $2, 'member')
                ON CONFLICT DO NOTHING
                RETURNING id
            `, [channelId, staff.id]);

            if (result.rows.length > 0) {
                console.log(`   ✅ Added ${staff.first_name} ${staff.last_name}`);
                addedCount++;
            }
        }

        console.log(`\n✅ Added ${addedCount} new members to #staff-general`);

        // Show final member list
        console.log('\n👥 Final #staff-general members:');
        const membersResult = await client.query(`
            SELECT p.first_name, p.last_name, up.email, ccm.role
            FROM chat_channel_members ccm
            JOIN people p ON p.id = ccm.person_id
            JOIN user_profiles up ON up.person_id = p.id
            WHERE ccm.channel_id = $1
            ORDER BY p.first_name
        `, [channelId]);

        membersResult.rows.forEach((member, idx) => {
            console.log(`   ${idx + 1}. ${member.first_name} ${member.last_name} (${member.email})`);
        });

        console.log('\n✅ Done! All staff can now chat in #staff-general and receive notifications!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await client.end();
    }
}

setupStaffGeneralChannel();
