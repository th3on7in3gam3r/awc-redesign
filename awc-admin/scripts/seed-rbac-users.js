/**
 * Seed RBAC Users
 * Creates a user for each staff role to test permissions
 */

import pg from 'pg';
import bcrypt from 'bcrypt';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const ROLES_TO_SEED = [
    {
        role: 'pastor',
        firstName: 'Pastor',
        lastName: 'User',
        email: 'pastor@test.com',
        description: 'Senior Pastor - Full System Access'
    },
    {
        role: 'first_lady',
        firstName: 'First',
        lastName: 'Lady',
        email: 'firstlady@test.com',
        description: 'Executive Dashboard Access'
    },
    {
        role: 'administrator',
        firstName: 'Admin',
        lastName: 'Ops',
        email: 'administrator@test.com',
        description: 'Operations Dashboard'
    },
    {
        role: 'ministry_leader',
        firstName: 'Ministry',
        lastName: 'Leader',
        email: 'leader@test.com',
        description: 'Ministry Management'
    },
    {
        role: 'staff',
        firstName: 'General',
        lastName: 'Staff',
        email: 'staff@test.com',
        description: 'General Staff Access'
    },
    {
        role: 'checkin_team',
        firstName: 'Checkin',
        lastName: 'Team',
        email: 'checkin@test.com',
        description: 'Kids Check-in Access'
    }
];

async function seedRoles() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        const defaultPassword = await bcrypt.hash('awc2024', 10);

        // Get #staff-general channel for auto-adding
        const channelRes = await client.query("SELECT id FROM chat_channels WHERE name = '#staff-general'");
        const channelId = channelRes.rows[0]?.id;

        console.log('🚀 Seeding users for each role...\n');

        for (const user of ROLES_TO_SEED) {
            // 1. Create Person
            const personResult = await client.query(`
                INSERT INTO people (first_name, last_name, email)
                VALUES ($1, $2, $3)
                RETURNING id
            `, [user.firstName, user.lastName, user.email]);

            const personId = personResult.rows[0].id;

            // 2. Create User Profile
            await client.query(`
                INSERT INTO user_profiles (person_id, email, password_hash, username, role)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (email) DO UPDATE SET role = $5
            `, [personId, user.email, defaultPassword, user.role + '_user', user.role]);

            console.log(`✅ Created ${user.role}: ${user.email}`);

            // 3. Add to #staff-general
            if (channelId) {
                await client.query(`
                    INSERT INTO chat_channel_members (channel_id, person_id, role)
                    VALUES ($1, $2, 'member')
                    ON CONFLICT DO NOTHING
                `, [channelId, personId]);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 ROLES SEEDED SUCCESSFULLY');
        console.log('=' + '='.repeat(59));
        console.log('Password for all users: awc2024\n');

        ROLES_TO_SEED.forEach(u => {
            console.log(`- ${u.role.padEnd(15)} : ${u.email}`);
        });
        console.log('=' + '='.repeat(59));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

seedRoles();
