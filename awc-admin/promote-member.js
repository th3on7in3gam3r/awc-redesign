const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function promoteMember() {
    try {
        const res = await pool.query("UPDATE users SET role = 'admin' WHERE email = $1 RETURNING *", ['member@anointed.com']);
        if (res.rows.length > 0) {
            console.log('User promoted to Admin:', res.rows[0].first_name, res.rows[0].role);
        } else {
            console.log('Member not found');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

promoteMember();
