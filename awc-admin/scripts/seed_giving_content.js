import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkAndSeedGivingContent() {
    const client = await pool.connect();

    try {
        console.log('Checking giving_content table...');

        // Check if table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'giving_content'
            );
        `);

        if (!tableCheck.rows[0].exists) {
            console.log('❌ giving_content table does not exist');
            console.log('Creating giving_content table...');

            await client.query(`
                CREATE TABLE IF NOT EXISTS giving_content (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    key TEXT NOT NULL UNIQUE,
                    value TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            `);
            console.log('✓ Created giving_content table');
        } else {
            console.log('✓ giving_content table exists');
        }

        // Check current content
        const contentCheck = await client.query('SELECT * FROM giving_content');
        console.log(`Found ${contentCheck.rows.length} content rows`);

        if (contentCheck.rows.length === 0) {
            console.log('Seeding default content...');

            await client.query(`
                INSERT INTO giving_content (key, value) VALUES
                ('why_we_give', 'We give because God has been generous to us. Our tithes and offerings support the mission of spreading the Gospel, caring for our community, and building God''s kingdom here on earth. Every gift makes a difference!'),
                ('giving_help', 'If you need assistance with giving or have questions about your contributions, please contact our finance team at finance@anointedworshipcenter.org or call (555) 123-4567.')
                ON CONFLICT (key) DO NOTHING;
            `);

            console.log('✓ Seeded default content');
        } else {
            console.log('Content already exists:');
            contentCheck.rows.forEach(row => {
                console.log(`  - ${row.key}: ${row.value.substring(0, 50)}...`);
            });
        }

        console.log('\n✅ Giving content is ready!');

    } catch (err) {
        console.error('Error:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

checkAndSeedGivingContent();
