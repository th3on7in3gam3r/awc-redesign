const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function createMember() {
    try {
        const email = 'member@anointed.com';
        const password = 'member123';
        const firstName = 'Jane';
        const lastName = 'Member';
        const role = 'member';

        // Check if user exists
        const checkRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkRes.rows.length > 0) {
            console.log('Member user already exists');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await pool.query(
            'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5)',
            [email, hash, firstName, lastName, role]
        );

        console.log(`Member user created successfully: ${email} / ${password}`);
    } catch (err) {
        console.error('Error creating member user:', err);
    } finally {
        await pool.end();
    }
}

createMember();
