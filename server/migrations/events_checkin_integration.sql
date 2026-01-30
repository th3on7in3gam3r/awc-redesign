-- Events-CheckIn Integration Migration
-- This migration creates the proper schema for connecting Events and Check-In systems

-- Drop old tables if they exist (clean slate)
DROP TABLE IF EXISTS checkins CASCADE;
DROP TABLE IF EXISTS checkin_sessions CASCADE;
DROP TABLE IF EXISTS event_sessions CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- 1. EVENTS TABLE
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'scheduled',
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_event_status CHECK (status IN ('draft', 'scheduled', 'live', 'completed', 'cancelled'))
);

-- Index for filtering by status and date
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_starts_at ON events(starts_at);
CREATE INDEX idx_events_created_by ON events(created_by);

-- 2. EVENT_SESSIONS TABLE
CREATE TABLE event_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    started_by UUID REFERENCES user_profiles(id),
    CONSTRAINT valid_session_status CHECK (status IN ('active', 'ended'))
);

-- Create unique partial index to ensure only one active session per event
CREATE UNIQUE INDEX unique_active_session_per_event ON event_sessions(event_id) WHERE status = 'active';

-- Indexes for fast lookups
CREATE INDEX idx_event_sessions_event ON event_sessions(event_id);
CREATE INDEX idx_event_sessions_active ON event_sessions(event_id, status) WHERE status = 'active';
CREATE INDEX idx_event_sessions_code ON event_sessions(code) WHERE status = 'active';

-- 3. CHECKINS TABLE
CREATE TABLE checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES event_sessions(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id),
    guest_name TEXT,
    guest_phone TEXT,
    guest_email TEXT,
    adults INT DEFAULT 1,
    children INT DEFAULT 0,
    first_time BOOLEAN DEFAULT FALSE,
    contact_ok BOOLEAN DEFAULT TRUE,
    type TEXT NOT NULL DEFAULT 'member',
    prayer_request TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_checkin_type CHECK (type IN ('member', 'guest')),
    -- Ensure either user_id OR guest info is provided
    CONSTRAINT valid_checkin_data CHECK (
        (type = 'member' AND user_id IS NOT NULL) OR
        (type = 'guest' AND guest_name IS NOT NULL AND guest_phone IS NOT NULL)
    )
);

-- Create unique partial index to prevent duplicate member check-ins
CREATE UNIQUE INDEX unique_member_checkin ON checkins(session_id, user_id) WHERE user_id IS NOT NULL;

-- Indexes for roster queries
CREATE INDEX idx_checkins_session ON checkins(session_id);
CREATE INDEX idx_checkins_event ON checkins(event_id);
CREATE INDEX idx_checkins_user ON checkins(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_checkins_created_at ON checkins(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on events
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample events for testing
INSERT INTO events (title, description, location, starts_at, status) VALUES
    ('Sunday Morning Worship', 'Weekly worship service with praise and teaching', 'Main Sanctuary', NOW() + INTERVAL '3 days', 'scheduled'),
    ('Wednesday Bible Study', 'Midweek Bible study and prayer', 'Fellowship Hall', NOW() + INTERVAL '5 days', 'scheduled'),
    ('Prayer Night', 'Corporate prayer gathering', 'Prayer Room', NOW() + INTERVAL '7 days', 'scheduled');

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL ON events TO your_app_user;
-- GRANT ALL ON event_sessions TO your_app_user;
-- GRANT ALL ON checkins TO your_app_user;

COMMENT ON TABLE events IS 'Church events that can have check-in sessions';
COMMENT ON TABLE event_sessions IS 'Live check-in sessions for events with unique codes';
COMMENT ON TABLE checkins IS 'Individual check-ins (members and guests) for event sessions';
COMMENT ON INDEX unique_active_session_per_event IS 'Ensures only one active session per event';
COMMENT ON INDEX unique_member_checkin IS 'Prevents duplicate member check-ins in the same session';
