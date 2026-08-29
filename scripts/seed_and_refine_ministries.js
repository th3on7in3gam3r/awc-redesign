import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const MINISTRIES_TO_SEED = [
    { name: "Tech Team", description: "Audio, video, lighting support" },
    { name: "Ushers", description: "Welcoming and assisting guests" },
    { name: "Worship Team", description: "Leading praise and worship" },
    { name: "Children’s Ministry", description: "Serve families and kids" },
    { name: "Youth Ministry", description: "Mentoring and youth discipleship" },
    { name: "Men’s Ministry", description: "Brotherhood, growth, accountability" },
    { name: "Women’s Ministry", description: "Encouragement, fellowship, prayer" }
];

async function run() {
    try {
        console.log('Refining Ministry/Request Schema & Seeding...');

        // 1. Refine Constraints on ministry_requests
        // Drop old index if exists (from previous step)
        await pool.query(`DROP INDEX IF EXISTS idx_ministry_requests_unique_req`);

        // Create new partial unique index
        await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_ministry_requests_unique_pending 
            ON ministry_requests (user_id, ministry_id) 
            WHERE status = 'pending'
        `);
        console.log('Partial unique index (pending) created.');

        // 2. Seed Ministries
        for (const m of MINISTRIES_TO_SEED) {
            await pool.query(`
                INSERT INTO ministries (name, description)
                VALUES ($1, $2)
                ON CONFLICT (name) DO UPDATE 
                SET description = EXCLUDED.description
            `, [m.name, m.description]);
        }
        console.log(`Seeded ${MINISTRIES_TO_SEED.length} ministries.`);

    } catch (err) {
        console.error('Error in script:', err);
    } finally {
        await pool.end();
    }
}

run();
