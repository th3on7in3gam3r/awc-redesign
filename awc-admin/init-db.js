const db = require('./db');
const bcrypt = require('bcrypt');

async function initDb() {
    try {
        console.log('Initializing database...');

        // Create users table
        await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'member',
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        last_login TIMESTAMP,
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✅ Users table ready');

        // Create Events Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                date DATE NOT NULL,
                checkin_code VARCHAR(10) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Events table ready');

        // Create Attendance Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS attendance (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
                checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, event_id)
            )
        `);
        console.log('✅ Attendance table ready');

        // Create Engagement Tables (Ministries, Prayer, Donations)
        await db.query(`
            CREATE TABLE IF NOT EXISTS ministries (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                leader_id INTEGER REFERENCES users(id),
                schedule VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS ministry_members (
                id SERIAL PRIMARY KEY,
                ministry_id UUID REFERENCES ministries(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                role VARCHAR(100) DEFAULT 'Volunteer',
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(ministry_id, user_id)
            );

            CREATE TABLE IF NOT EXISTS prayer_requests (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                request_text TEXT NOT NULL,
                is_anonymous BOOLEAN DEFAULT false,
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS donations (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                amount DECIMAL(10, 2) NOT NULL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                method VARCHAR(50) DEFAULT 'Online',
                notes TEXT
            );
        `);
        console.log('✅ Engagement tables ready');


        // Check for admin user
        const adminEmail = 'admin@anointed.com';
        const result = await db.query('SELECT * FROM users WHERE email = $1', [adminEmail]);

        if (result.rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await db.query(
                'INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES ($1, $2, $3, $4, $5)',
                [adminEmail, hashedPassword, 'admin', 'Admin', 'User']
            );
            console.log('✅ Default admin user created (admin@anointed.com / admin123)');
        } else {
            console.log('ℹ️ Admin user already exists');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Database initialization failed:', err);
        process.exit(1);
    }
}

initDb();
