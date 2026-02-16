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

async function migrateFinanceSchema() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        console.log('Starting Finance Schema Migration...\n');

        // 1. Create finance_funds
        console.log('1. Creating finance_funds table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS finance_funds (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT UNIQUE NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('   ✓ finance_funds created');

        // 2. Create finance_sources
        console.log('2. Creating finance_sources table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS finance_sources (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT UNIQUE NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('   ✓ finance_sources created');

        // 3. Create finance_entries
        console.log('3. Creating finance_entries table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS finance_entries (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                entry_date DATE NOT NULL,
                fund_id UUID NOT NULL REFERENCES finance_funds(id),
                source_id UUID NOT NULL REFERENCES finance_sources(id),
                amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
                memo TEXT,
                created_by_person_id UUID NOT NULL REFERENCES user_profiles(id),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        // Indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_finance_entries_date ON finance_entries(entry_date);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_finance_entries_fund ON finance_entries(fund_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_finance_entries_source ON finance_entries(source_id);`);

        console.log('   ✓ finance_entries created');

        // 4. Create audit_log
        console.log('4. Creating audit_log table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS audit_log (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                actor_person_id UUID REFERENCES user_profiles(id),
                action TEXT NOT NULL, -- CREATE, UPDATE, DELETE
                entity TEXT NOT NULL, -- finance_entry, ministry, etc
                entity_id UUID NOT NULL,
                metadata_json JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity, entity_id);`);
        console.log('   ✓ audit_log created');

        // 5. Seed Data
        console.log('5. Seeding default data...');

        const funds = ["Tithes & Offering", "Building Fund", "Seed Offering"];
        for (const f of funds) {
            await client.query(`INSERT INTO finance_funds (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`, [f]);
        }

        const sources = ["Vanco", "Cash App", "Stripe", "Cash / Check"];
        for (const s of sources) {
            await client.query(`INSERT INTO finance_sources (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`, [s]);
        }

        console.log('   ✓ Seed data inserted');

        await client.query('COMMIT');
        console.log('\n✅ Finance Schema Migration completed successfully!');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

migrateFinanceSchema().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
