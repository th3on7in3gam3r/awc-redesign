/**
 * Fresh Start - Create Admin and Sheevon accounts
 */

import pg from 'pg';
import bcrypt from 'bcrypt';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function freshStart() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        // 1. Create Admin (Jehvon Mahabir)
        console.log('👤 Creating Admin account (Jehvon Mahabir)...');
        const adminPassword = await bcrypt.hash('admin123', 10);

        const adminPerson = await client.query(`
            INSERT INTO people (first_name, last_name, email, phone)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `, ['Jehvon', 'Mahabir', 'jehvonmahabir@gmail.com', '']);

        const adminPersonId = adminPerson.rows[0].id;

        await client.query(`
            INSERT INTO user_profiles (person_id, email, password_hash, username, username_lower, role)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [adminPersonId, 'jehvonmahabir@gmail.com', adminPassword, 'jehvon', 'jehvon', 'admin']);

        console.log('✅ Admin created: jehvonmahabir@gmail.com / admin123');

        // 2. Create Sheevon (Finance)
        console.log('\n👤 Creating Finance account (Sheevon Mahabir)...');
        const sheevonPassword = await bcrypt.hash('finance123', 10);

        const sheevonPerson = await client.query(`
            INSERT INTO people (first_name, last_name, email, phone)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `, ['Sheevon', 'Mahabir', 'ksheevon@gmail.com', '']);

        const sheevonPersonId = sheevonPerson.rows[0].id;

        await client.query(`
            INSERT INTO user_profiles (person_id, email, password_hash, username, username_lower, role)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [sheevonPersonId, 'ksheevon@gmail.com', sheevonPassword, 'sheevon', 'sheevon', 'finance']);

        console.log('✅ Finance created: ksheevon@gmail.com / finance123');

        // 3. Create #staff-general channel
        console.log('\n📢 Creating #staff-general channel...');
        const channelResult = await client.query(`
            INSERT INTO chat_channels (name, type, description, created_by)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `, ['#staff-general', 'general', 'General discussion for all staff members', adminPersonId]);

        const channelId = channelResult.rows[0].id;
        console.log('✅ Channel created');

        // 4. Add both to channel
        console.log('\n➕ Adding members to #staff-general...');
        await client.query(`
            INSERT INTO chat_channel_members (channel_id, person_id, role)
            VALUES ($1, $2, $3)
        `, [channelId, adminPersonId, 'owner']);
        console.log('✅ Added Jehvon (owner)');

        await client.query(`
            INSERT INTO chat_channel_members (channel_id, person_id, role)
            VALUES ($1, $2, $3)
        `, [channelId, sheevonPersonId, 'member']);
        console.log('✅ Added Sheevon (member)');

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 FRESH START COMPLETE!');
        console.log('='.repeat(60));
        console.log('\n📋 Login Credentials:\n');
        console.log('👨‍💼 Admin Account:');
        console.log('   Email: jehvonmahabir@gmail.com');
        console.log('   Password: admin123');
        console.log('   Role: admin\n');
        console.log('💰 Finance Account:');
        console.log('   Email: ksheevon@gmail.com');
        console.log('   Password: finance123');
        console.log('   Role: finance\n');
        console.log('💬 Chat Channel:');
        console.log('   #staff-general (both members added)\n');
        console.log('='.repeat(60));
        console.log('\n⚠️  NEXT STEPS:');
        console.log('1. Restart your server (Ctrl+C, then npm run dev)');
        console.log('2. Login as admin: jehvonmahabir@gmail.com / admin123');
        console.log('3. Go to Team Chat → #staff-general');
        console.log('4. Send a test message');
        console.log('5. Login as Sheevon in another browser/incognito');
        console.log('6. Check notification bell - should see your message!');
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await client.end();
    }
}

freshStart();
