/**
 * Reset Member User
 * Creates or resets a standard member user for testing.
 */

import pg from 'pg';
import bcrypt from 'bcrypt';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function resetMemberUser() {
    const client = new Client({ connectionString });

    try {
        await client.connect();

        const email = 'member@test.com';
        const password = 'member123';
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(`🔑 Resetting user: ${email}`);

        // Check if exists
        const res = await client.query('SELECT id FROM user_profiles WHERE email = $1', [email]);

        if (res.rows.length > 0) {
            // Update
            await client.query(`
                UPDATE user_profiles 
                SET password_hash = $1, role = 'member'
                WHERE email = $2
            `, [hashedPassword, email]);
            console.log('✅ User updated successfully');
        } else {
            // Create
            await client.query(`
                INSERT INTO user_profiles (
                    email, password_hash, role, first_name, last_name, 
                    created_at, updated_at
                ) VALUES ($1, $2, 'member', 'Test', 'Member', NOW(), NOW())
            `, [email, hashedPassword]);
            console.log('✅ User created successfully');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

resetMemberUser();
