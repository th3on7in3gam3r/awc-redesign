
import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function listUsers() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query('SELECT email, role, id FROM user_profiles');
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
listUsers();
