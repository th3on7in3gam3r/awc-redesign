import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Updating ministry_requests schema...');

        // 1. Add missing columns
        await pool.query(`
            DO $$ 
            BEGIN 
                -- Add 'ministry_name' if missing
                BEGIN 
                    ALTER TABLE ministry_requests ADD COLUMN ministry_name TEXT; 
                EXCEPTION 
                    WHEN duplicate_column THEN NULL; 
                END;

                -- Add 'availability' if missing
                BEGIN 
                    ALTER TABLE ministry_requests ADD COLUMN availability TEXT; 
                EXCEPTION 
                    WHEN duplicate_column THEN NULL; 
                END;

                 -- Add 'status' if missing
                BEGIN 
                    ALTER TABLE ministry_requests ADD COLUMN status TEXT DEFAULT 'pending'; 
                EXCEPTION 
                    WHEN duplicate_column THEN NULL; 
                END;
            END $$;
        `);
        console.log('Columns verified/added.');

        // 2. Add Unique Constraint
        // We use a unique index on the expression to handle the COALESCE logic if possible, 
        // OR standard unique constraint if standard columns. 
        // User asked for: UNIQUE(user_id, COALESCE(ministry_id::text, ministry_name))

        // This syntax typically requires a UNIQUE INDEX in Postgres for expressions
        await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_ministry_requests_unique_req 
            ON ministry_requests (user_id, COALESCE(ministry_id::text, ministry_name));
        `);
        console.log('Unique constraint added.');

    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        await pool.end();
    }
}

run();
