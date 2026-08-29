/**
 * Seed Sermons
 * Adds 3 specific YouTube videos to the sermons table.
 */

import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://neondb_owner:npg_CfeLg5kpm4lv@ep-broad-recipe-ah242um6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const sermons = [
    {
        title: "Sunday Service - Worship & Word",
        scripture: "Psalm 23",
        speaker: "Pastor",
        description: "Join us for a powerful time of worship and the word.",
        video_url: "https://www.youtube.com/watch?v=fLDoPJmcri0&t=2258s",
        thumbnail_url: "https://img.youtube.com/vi/fLDoPJmcri0/maxresdefault.jpg",
        preached_at: new Date('2024-01-14T10:00:00'), // Recent Sunday
        type: 'sunday_service',
        is_published: true
    },
    {
        title: "Mid-Week Service",
        scripture: "Romans 8",
        speaker: "Pastor",
        description: "Deep dive into scripture during our mid-week service.",
        video_url: "https://www.youtube.com/watch?v=m0uirC7weF4&t=1s",
        thumbnail_url: "https://img.youtube.com/vi/m0uirC7weF4/maxresdefault.jpg",
        preached_at: new Date('2024-01-10T19:00:00'), // Recent Wednesday
        type: 'midweek_service',
        is_published: true
    },
    {
        title: "Special Worship Event",
        scripture: "Isaiah 40:31",
        speaker: "Guest Speaker",
        description: "A special time of seeking God's presence.",
        video_url: "https://www.youtube.com/watch?v=tRcnTAZR5CA&t=11s",
        thumbnail_url: "https://img.youtube.com/vi/tRcnTAZR5CA/maxresdefault.jpg",
        preached_at: new Date('2024-01-07T10:00:00'), // Previous Sunday
        type: 'special_event',
        is_published: true
    }
];

async function seedSermons() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database\n');

        console.log('🌱 Seeding sermons...');

        for (const sermon of sermons) {
            await client.query(`
                INSERT INTO sermons (
                    title, scripture, speaker, description, video_url, thumbnail_url, preached_at, type, is_published, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
            `, [
                sermon.title,
                sermon.scripture,
                sermon.speaker,
                sermon.description,
                sermon.video_url,
                sermon.thumbnail_url,
                sermon.preached_at,
                sermon.type,
                sermon.is_published
            ]);
            console.log(`   - Added: ${sermon.title}`);
        }

        console.log('\n✅ Sermons seeded successfully!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

seedSermons();
