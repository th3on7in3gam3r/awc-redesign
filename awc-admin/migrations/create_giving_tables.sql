-- Tithes & Offerings System Migration
-- Creates giving_options, giving_intents, and giving_content tables

-- Create giving_options table
CREATE TABLE IF NOT EXISTS giving_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    url TEXT,
    provider TEXT NOT NULL DEFAULT 'vanco',
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create giving_intents table
CREATE TABLE IF NOT EXISTS giving_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    giving_option_id UUID REFERENCES giving_options(id) ON DELETE CASCADE,
    amount NUMERIC(10,2),
    frequency TEXT DEFAULT 'one-time',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create giving_content table
CREATE TABLE IF NOT EXISTS giving_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_giving_options_active ON giving_options(is_active);
CREATE INDEX IF NOT EXISTS idx_giving_options_primary ON giving_options(is_primary);
CREATE INDEX IF NOT EXISTS idx_giving_intents_user ON giving_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_giving_content_key ON giving_content(key);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_giving_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_giving_options_timestamp ON giving_options;
CREATE TRIGGER update_giving_options_timestamp
    BEFORE UPDATE ON giving_options
    FOR EACH ROW
    EXECUTE FUNCTION update_giving_updated_at();

DROP TRIGGER IF EXISTS update_giving_content_timestamp ON giving_content;
CREATE TRIGGER update_giving_content_timestamp
    BEFORE UPDATE ON giving_content
    FOR EACH ROW
    EXECUTE FUNCTION update_giving_updated_at();

-- Seed giving options
INSERT INTO giving_options (title, category, url, provider, is_primary, is_active, sort_order)
VALUES 
    ('Tithes & Offering', 'Tithes & Offering', 'https://secure.myvanco.com/YKB0/campaign/C-1218E?access=tile_direct', 'vanco', true, true, 1),
    ('Building Fund', 'Building Fund', 'https://secure.myvanco.com/YKB0/campaign/C-1218F?access=tile_direct', 'vanco', false, true, 2),
    ('Stripe Giving', 'Online Giving', NULL, 'stripe', false, false, 3)
ON CONFLICT DO NOTHING;

-- Seed giving content
INSERT INTO giving_content (key, value)
VALUES 
    ('why_we_give', 'Giving is an act of worship and obedience to God. When we give our tithes and offerings, we acknowledge that everything we have comes from Him. Your generosity helps us spread the Gospel, support our community, and maintain our church facilities. Every gift, no matter the size, makes a difference in advancing God''s kingdom.'),
    ('giving_help', 'Need help with giving? Contact our finance team at finance@awc.org or call (555) 123-4567 during office hours.')
ON CONFLICT (key) DO NOTHING;
