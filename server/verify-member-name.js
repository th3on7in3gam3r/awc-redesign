const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function verifyMember() {
    try {
        const res = await pool.query('SELECT * FROM users WHERE email = $1', ['member@anointed.com']);
        if (res.rows.length > 0) {
            console.log('Member Found:', res.rows[0].first_name, res.rows[0].last_name);
        } else {
            console.log('Member not found');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

verifyMember();
