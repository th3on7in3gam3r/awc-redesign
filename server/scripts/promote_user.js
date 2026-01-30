import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function promoteUser() {
    const email = 'ksheevon@gmail.com';
    const newRole = 'admin';

    try {
        console.log(`Promoting ${email} to ${newRole}...`);

        const result = await pool.query(
            'UPDATE user_profiles SET role = $1 WHERE email = $2 RETURNING id, first_name, last_name, email, role',
            [newRole, email]
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log('✅ User promoted successfully!');
            console.log(`   Name: ${user.first_name} ${user.last_name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
        } else {
            console.log('❌ User not found with email:', email);
        }
    } catch (err) {
        console.error('❌ Error promoting user:', err);
    } finally {
        await pool.end();
    }
}

promoteUser();
