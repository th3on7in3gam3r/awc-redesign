/**
 * Reset Sheevon Password
 * Updates ksheevon@gmail.com with the requested password.
 */

import pg from 'pg';
import bcrypt from 'bcrypt';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function resetSheevonPassword() {
    const client = new Client({ connectionString });

    try {
        await client.connect();

        const email = 'ksheevon@gmail.com';
        const password = 'amps236*Yeah';
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(`🔐 Resetting password for: ${email}`);

        const res = await client.query('UPDATE user_profiles SET password_hash = $1 WHERE email = $2 RETURNING id, role', [hashedPassword, email]);

        if (res.rows.length > 0) {
            console.log(`✅ Password updated successfully! User ID: ${res.rows[0].id}, Role: ${res.rows[0].role}`);
        } else {
            console.log('❌ User not found!');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

resetSheevonPassword();
