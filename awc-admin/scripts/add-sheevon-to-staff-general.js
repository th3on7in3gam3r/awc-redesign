/**
 * Add Sheevon Mahabir to #staff-general channel
 */

import { query } from '../db.mjs';

async function addSheevonToStaffGeneral() {
    try {
        console.log('🔍 Finding Sheevon Mahabir...');

        // Find Sheevon by email
        const sheevonResult = await query(`
            SELECT p.id, p.first_name, p.last_name, up.email, up.role
            FROM people p
            JOIN user_profiles up ON up.person_id = p.id
            WHERE up.email = $1
        `, ['ksheevon@gmail.com']);

        if (sheevonResult.rows.length === 0) {
            console.log('❌ Sheevon not found with email ksheevon@gmail.com');
            return;
        }

        const sheevon = sheevonResult.rows[0];
        console.log(`✅ Found: ${sheevon.first_name} ${sheevon.last_name} (${sheevon.role})`);

        // Find #staff-general channel
        console.log('\n🔍 Finding #staff-general channel...');
        const channelResult = await query(`
            SELECT id, name, type
            FROM chat_channels
            WHERE name = $1
        `, ['#staff-general']);

        if (channelResult.rows.length === 0) {
            console.log('❌ #staff-general channel not found');
            return;
        }

        const channel = channelResult.rows[0];
        console.log(`✅ Found channel: ${channel.name} (${channel.type})`);

        // Check if already a member
        console.log('\n🔍 Checking if already a member...');
        const memberCheck = await query(`
            SELECT 1 FROM chat_channel_members
            WHERE channel_id = $1 AND person_id = $2
        `, [channel.id, sheevon.id]);

        if (memberCheck.rows.length > 0) {
            console.log('ℹ️  Sheevon is already a member of #staff-general');
        } else {
            // Add Sheevon to channel
            console.log('\n➕ Adding Sheevon to #staff-general...');
            await query(`
                INSERT INTO chat_channel_members (channel_id, person_id, role)
                VALUES ($1, $2, $3)
            `, [channel.id, sheevon.id, 'member']);
            console.log('✅ Successfully added Sheevon to #staff-general!');
        }

        // Show all current members
        console.log('\n👥 Current #staff-general members:');
        const membersResult = await query(`
            SELECT p.first_name, p.last_name, up.email, ccm.role, ccm.joined_at
            FROM chat_channel_members ccm
            JOIN people p ON p.id = ccm.person_id
            JOIN user_profiles up ON up.person_id = p.id
            WHERE ccm.channel_id = $1
            ORDER BY ccm.joined_at ASC
        `, [channel.id]);

        membersResult.rows.forEach((member, idx) => {
            console.log(`   ${idx + 1}. ${member.first_name} ${member.last_name} (${member.email}) - ${member.role}`);
        });

        console.log('\n✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addSheevonToStaffGeneral();
