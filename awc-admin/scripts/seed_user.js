import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcrypt';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    try {
        console.log('Seeding database...');

        // Check if user exists
        const email = 'alex.johnson@example.com';
        const check = await pool.query('SELECT * FROM user_profiles WHERE email = $1', [email]);

        if (check.rows.length === 0) {
            console.log('Creating seed user...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password', salt);

            await pool.query(
                `INSERT INTO user_profiles (first_name, last_name, email, password_hash, role, joined_date, last_login)
                 VALUES ($1, $2, $3, $4, 'member', CURRENT_DATE, NOW())`,
                ['Alex', 'Johnson', email, hashedPassword]
            );
            console.log('User created: alex.johnson@example.com / password');
        } else {
            console.log('User already exists.');
        }

    } catch (err) {
        console.error('Error seeding:', err);
    } finally {
        await pool.end();
    }
}

run();
