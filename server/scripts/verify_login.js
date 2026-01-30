import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcrypt';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    console.log('Verifying login for alex.johnson@example.com...');
    const email = 'alex.johnson@example.com';
    const password = 'password';

    try {
        const result = await pool.query('SELECT * FROM user_profiles WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            console.log('User NOT FOUND in database.');
            return;
        }

        const user = result.rows[0];
        console.log('User found:', user.email);
        console.log('Stored Hash:', user.password_hash);
        console.log('Role:', user.role);

        const match = await bcrypt.compare(password, user.password_hash);
        console.log('Password match result:', match);

        if (match) {
            console.log('LOGIN SUCCESSFUL (Simulation)');
        } else {
            console.log('LOGIN FAILED (Simulation) - Hash mismatch');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

run();
