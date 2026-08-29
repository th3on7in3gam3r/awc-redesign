import { query } from './db.mjs';

const sermons = [
    {
        title: 'The Power of Worship',
        speaker: 'Pastor John Smith',
        preached_at: '2026-01-12',
        scripture: 'Psalm 150:1-6',
        summary: 'Discover the transformative power of authentic worship and how it changes our perspective on life.',
        video_url: 'https://www.youtube.com/watch?v=fLDoPJmcri0'
    },
    {
        title: 'Walking in Faith',
        speaker: 'Pastor Sarah Johnson',
        preached_at: '2026-01-05',
        scripture: 'Hebrews 11:1-6',
        summary: 'Learn what it means to walk by faith and not by sight, trusting God in every circumstance.',
        video_url: 'https://www.youtube.com/watch?v=m0uirC7weF4'
    },
    {
        title: 'Love Without Limits',
        speaker: 'Pastor John Smith',
        preached_at: '2025-12-29',
        scripture: 'John 13:34-35',
        summary: 'Exploring the radical love of Christ and how we can love others unconditionally.',
        video_url: 'https://www.youtube.com/watch?v=tRcnTAZR5CA'
    }
];

async function addSermons() {
    try {
        for (const sermon of sermons) {
            await query(
                `INSERT INTO sermons (title, speaker, preached_at, type, scripture, summary, video_url, is_published)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [sermon.title, sermon.speaker, sermon.preached_at, 'Sunday', sermon.scripture, sermon.summary, sermon.video_url, true]
            );
        }
        console.log('✅ Added 3 real sermon videos to database');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed:', err.message);
        process.exit(1);
    }
}

addSermons();
