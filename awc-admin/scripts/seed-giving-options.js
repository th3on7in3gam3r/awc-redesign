/**
 * Seed Giving Options
 * Populates the giving_options table with user-requested data.
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function seedGivingOptions() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        console.log('🌱 Seeding Giving Options...');

        // Clear existing options to avoid duplicates
        await client.query('DELETE FROM giving_options');

        const options = [
            {
                title: 'Tithes & Offerings',
                subtitle: 'Support the general ministry',
                provider: 'Vanco',
                category: 'General',
                url: 'https://secure.myvanco.com/YKB0/campaign/C-1218E?access=tile_direct',
                is_primary: true,
                sort_order: 1
            },
            {
                title: 'Building Fund',
                subtitle: 'Support our expansion',
                provider: 'Vanco',
                category: 'Building',
                url: 'https://secure.myvanco.com/YKB0/campaign/C-1218F?access=tile_direct',
                is_primary: false,
                sort_order: 2
            },
            {
                title: 'Seeding',
                subtitle: 'Coming Soon',
                provider: 'Vanco',
                category: 'Seed',
                url: '#',
                is_primary: false,
                sort_order: 3
            },
            {
                title: 'CashApp',
                subtitle: 'Quick mobile giving',
                provider: 'CashApp',
                category: 'General',
                handle: '$AWCGIVEPLUS',
                url: 'https://cash.app/$AWCGIVEPLUS',
                is_primary: false,
                sort_order: 4
            },
            {
                title: 'Credit / Debit Card',
                subtitle: 'Coming Soon',
                provider: 'Stripe',
                category: 'General',
                url: '#',
                is_primary: false,
                sort_order: 5
            }
        ];

        for (const opt of options) {
            await client.query(`
                INSERT INTO giving_options 
                (title, subtitle, provider, category, url, handle, is_primary, sort_order, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
            `, [opt.title, opt.subtitle, opt.provider, opt.category, opt.url, opt.handle, opt.is_primary, opt.sort_order]);
        }

        console.log(`✅ Seeded ${options.length} giving options!`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

seedGivingOptions();
