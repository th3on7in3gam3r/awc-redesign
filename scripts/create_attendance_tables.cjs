const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });
const db = require('../server/db');

const createTables = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                date DATE NOT NULL,
                checkin_code VARCHAR(50) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Created 'events' table.");

        await db.query(`
            CREATE TABLE IF NOT EXISTS attendance (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                event_id INTEGER REFERENCES events(id),
                checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, event_id)
            );
        `);
        console.log("Created 'attendance' table.");

    } catch (err) {
        console.error('Error creating tables:', err);
    } finally {
        process.exit();
    }
};

createTables();
