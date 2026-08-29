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

async function addStoreItemColor() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('Adding color column to store_order_items...\n');

    await client.query(`
      ALTER TABLE store_order_items
      ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT '';
    `);
    console.log('✓ color column ready');

    await client.query('COMMIT');
    console.log('\nMigration complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

addStoreItemColor();
