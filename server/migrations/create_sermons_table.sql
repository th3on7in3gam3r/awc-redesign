-- Sermon Archive Migration
-- Creates sermons table with full metadata support

-- Drop table if exists (clean slate)
DROP TABLE IF EXISTS sermons CASCADE;

-- Create sermons table
CREATE TABLE sermons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    speaker TEXT NOT NULL,
    preached_at DATE NOT NULL,
    type TEXT NOT NULL DEFAULT 'Sunday',
    series TEXT,
    scripture TEXT,
    summary TEXT,
    key_points TEXT[],
    small_group_questions TEXT[],
    tags TEXT[] DEFAULT '{}',
    video_url TEXT,
    audio_url TEXT,
    notes_url TEXT,
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_sermon_type CHECK (type IN ('Sunday', 'Bible Study', 'Prayer'))
);

-- Indexes for performance
CREATE INDEX idx_sermons_published ON sermons(is_published, preached_at DESC);
CREATE INDEX idx_sermons_type ON sermons(type);
CREATE INDEX idx_sermons_series ON sermons(series) WHERE series IS NOT NULL;
CREATE INDEX idx_sermons_speaker ON sermons(speaker);
CREATE INDEX idx_sermons_preached_at ON sermons(preached_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sermon_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_sermons_updated_at
    BEFORE UPDATE ON sermons
    FOR EACH ROW
    EXECUTE FUNCTION update_sermon_updated_at();

-- Insert sample sermons for testing
INSERT INTO sermons (
    title, speaker, preached_at, type, series, scripture, summary,
    key_points, small_group_questions, tags, video_url, is_published
) VALUES
(
    'Walking in Faith',
    'Pastor John Smith',
    CURRENT_DATE - INTERVAL '7 days',
    'Sunday',
    'Faith Series',
    'Hebrews 11:1-6',
    'Exploring what it means to walk by faith and not by sight, trusting God in every circumstance.',
    ARRAY['Faith is confidence in what we hope for', 'Faith requires action', 'God rewards those who seek Him'],
    ARRAY['What does walking by faith look like in your daily life?', 'Share a time when God rewarded your faith', 'How can we encourage others to have faith?'],
    ARRAY['faith', 'trust', 'obedience'],
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    true
),
(
    'The Power of Prayer',
    'Pastor Sarah Johnson',
    CURRENT_DATE - INTERVAL '14 days',
    'Bible Study',
    'Prayer Life',
    'Matthew 6:5-15',
    'Understanding the Lord''s Prayer and developing a consistent prayer life.',
    ARRAY['Prayer is communication with God', 'The Lord''s Prayer is our model', 'Pray without ceasing'],
    ARRAY['What challenges do you face in maintaining a prayer life?', 'How has prayer changed your relationship with God?'],
    ARRAY['prayer', 'communication', 'relationship'],
    'https://www.youtube.com/watch?v=example2',
    true
),
(
    'Love Your Neighbor',
    'Pastor John Smith',
    CURRENT_DATE - INTERVAL '21 days',
    'Sunday',
    'Love Series',
    'Luke 10:25-37',
    'The parable of the Good Samaritan teaches us what it truly means to love our neighbor.',
    ARRAY['Love transcends boundaries', 'Actions speak louder than words', 'We are called to serve'],
    ARRAY['Who is your neighbor?', 'How can you show love to someone different from you this week?'],
    ARRAY['love', 'service', 'compassion'],
    NULL,
    true
),
(
    'Upcoming Message - Draft',
    'Pastor John Smith',
    CURRENT_DATE + INTERVAL '7 days',
    'Sunday',
    'Faith Series',
    'Romans 8:28',
    'God works all things together for good for those who love Him.',
    NULL,
    NULL,
    ARRAY['faith', 'trust'],
    NULL,
    false
);

COMMENT ON TABLE sermons IS 'Sermon archive with metadata, links, and study materials';
COMMENT ON COLUMN sermons.key_points IS 'Main takeaways from the sermon';
COMMENT ON COLUMN sermons.small_group_questions IS 'Discussion questions for small groups';
COMMENT ON COLUMN sermons.is_published IS 'Only published sermons visible to non-admin members';
