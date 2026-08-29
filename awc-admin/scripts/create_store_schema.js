import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function createStoreSchema() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('Creating AWC Store schema...\n');

    await client.query(`
      CREATE TABLE IF NOT EXISTS store_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        fulfillment TEXT NOT NULL CHECK (fulfillment IN ('pickup', 'ship')),
        address_line1 TEXT,
        address_line2 TEXT,
        city TEXT,
        state TEXT,
        zip TEXT,
        payment_method TEXT NOT NULL CHECK (payment_method IN ('pickup', 'cashapp', 'zelle')),
        status TEXT NOT NULL DEFAULT 'pending_payment',
        total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
        member_user_id UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ store_orders');

    await client.query(`
      CREATE TABLE IF NOT EXISTS store_order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        size TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✓ store_order_items');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_store_orders_email ON store_orders (email);
      CREATE INDEX IF NOT EXISTS idx_store_orders_created_at ON store_orders (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_store_order_items_order_id ON store_order_items (order_id);
    `);
    console.log('✓ indexes');

    await client.query('COMMIT');
    console.log('\nStore schema ready.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Store schema migration failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

createStoreSchema();
