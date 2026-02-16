import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function createGivingOptionsSchema() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('Starting giving options schema migration...\n');

        // 1. Create giving_options table
        console.log('1. Creating giving_options table...');

        await client.query(`
            CREATE TABLE IF NOT EXISTS giving_options (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title TEXT NOT NULL,
                provider TEXT NOT NULL,
                category TEXT NOT NULL,
                url TEXT,
                handle TEXT,
                subtitle TEXT,
                is_primary BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        // Create index for active options
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_giving_options_active 
            ON giving_options(is_active, sort_order);
        `);

        // Create index for primary option
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_giving_options_primary 
            ON giving_options(is_primary) 
            WHERE is_primary = TRUE;
        `);

        console.log('   ✓ Created giving_options table with indexes');

        // 2. Insert seed data
        console.log('2. Inserting seed data...');

        // Vanco URLs
        const vancoTithesUrl = 'https://secure.myvanco.com/YKB0/campaign/C-1218E?access=tile_direct';
        const vancoBuildingUrl = 'https://secure.myvanco.com/YKB0/campaign/C-1218F?access=tile_direct';

        // Cash App handle (can be configured via env)
        const cashAppHandle = process.env.CASHAPP_HANDLE || '$AnointedWorshipCenter';
        const cashAppUrl = process.env.CASHAPP_URL || null;

        // Seed Offering URL (optional, can be null)
        const seedOfferingUrl = process.env.VANCO_SEED_URL || null;

        // Upsert giving options (using ON CONFLICT to avoid duplicates on re-run)
        const seedData = [
            {
                title: 'Tithes & Offering',
                provider: 'vanco',
                category: 'tithes',
                url: vancoTithesUrl,
                subtitle: 'Support our church ministry',
                is_primary: true,
                is_active: true,
                sort_order: 1
            },
            {
                title: 'Building Fund',
                provider: 'vanco',
                category: 'building',
                url: vancoBuildingUrl,
                subtitle: 'Invest in our church facility',
                is_primary: false,
                is_active: true,
                sort_order: 2
            },
            {
                title: 'Seed Offering',
                provider: 'vanco',
                category: 'seed',
                url: seedOfferingUrl,
                subtitle: 'Sow into special projects',
                is_primary: false,
                is_active: seedOfferingUrl ? true : true, // Active but may be disabled in UI if no URL
                sort_order: 3
            },
            {
                title: 'Cash App',
                provider: 'cashapp',
                category: 'general',
                url: cashAppUrl,
                handle: cashAppHandle,
                subtitle: 'Give via Cash App',
                is_primary: false,
                is_active: true,
                sort_order: 4
            },
            {
                title: 'Stripe (Coming Soon)',
                provider: 'stripe',
                category: 'general',
                url: null,
                subtitle: 'Online giving via credit/debit card',
                is_primary: false,
                is_active: true,
                sort_order: 5
            }
        ];

        for (const option of seedData) {
            // Check if this option already exists by title
            const existing = await client.query(
                'SELECT id FROM giving_options WHERE title = $1',
                [option.title]
            );

            if (existing.rows.length === 0) {
                await client.query(`
                    INSERT INTO giving_options (
                        title, provider, category, url, handle, subtitle, 
                        is_primary, is_active, sort_order
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `, [
                    option.title,
                    option.provider,
                    option.category,
                    option.url,
                    option.handle || null,
                    option.subtitle,
                    option.is_primary,
                    option.is_active,
                    option.sort_order
                ]);

                console.log(`   ✓ Seeded: ${option.title}`);
            } else {
                console.log(`   ⏭ Skipped (exists): ${option.title}`);
            }
        }

        // 3. Verify the data
        console.log('\n3. Verifying seed data...');

        const result = await client.query(`
            SELECT id, title, provider, category, url, handle, is_primary, is_active, sort_order
            FROM giving_options
            ORDER BY sort_order
        `);

        console.log(`   Found ${result.rows.length} giving options:`);
        result.rows.forEach(row => {
            const primaryBadge = row.is_primary ? '⭐ PRIMARY' : '';
            const urlStatus = row.url ? '✓ URL' : row.handle ? '✓ Handle' : '⚠ No URL';
            console.log(`     - ${row.title} (${row.provider}) ${primaryBadge} ${urlStatus}`);
        });

        await client.query('COMMIT');

        console.log('\n✅ Giving options schema migration completed successfully!');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run the migration
createGivingOptionsSchema().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
