import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcrypt';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    const email = 'jerlessm@gmail.com';
    const password = 'amps236*Yeah';
    const firstName = 'Jerless'; // Assuming based on email
    const lastName = 'Member';   // Placeholder

    try {
        console.log(`Checking for user: ${email}`);
        const check = await pool.query('SELECT * FROM user_profiles WHERE email = $1', [email]);

        if (check.rows.length === 0) {
            console.log('User not found. Creating...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await pool.query(
                `INSERT INTO user_profiles (first_name, last_name, email, password_hash, role, joined_date, last_login)
                 VALUES ($1, $2, $3, $4, 'member', CURRENT_DATE, NOW())`,
                [firstName, lastName, email, hashedPassword]
            );
            console.log(`User created successfully: ${email}`);
        } else {
            console.log('User already exists in database.');
            // Optional: Update password if needed, but for now just confirming existence
            const user = check.rows[0];
            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) {
                console.log('Password mismatch! Updating password...');
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                await pool.query('UPDATE user_profiles SET password_hash = $1 WHERE id = $2', [hashedPassword, user.id]);
                console.log('Password updated.');
            } else {
                console.log('Password matches existing record.');
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

run();
