import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        const email = 'jerlessm@gmail.com'; // Target user
        console.log(`Promoting ${email} to admin...`);

        const res = await pool.query(
            "UPDATE user_profiles SET role = 'admin' WHERE email = $1 RETURNING id, email, role",
            [email]
        );

        if (res.rows.length > 0) {
            console.log('Success:', res.rows[0]);
        } else {
            console.log('User not found.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();
