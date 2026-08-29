-- Migration: Live Session Check-In System

-- 1. Check-in Sessions
CREATE TABLE IF NOT EXISTS checkin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type TEXT NOT NULL,
    location TEXT,
    code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'ended'
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP
);

-- 2. Check-ins
CREATE TABLE IF NOT EXISTS checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES checkin_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) NULL, -- NULL for guests
    guest_name TEXT NULL,
    guest_phone TEXT NULL,
    guest_email TEXT NULL,
    adults INT DEFAULT 1,
    children INT DEFAULT 0,
    first_time BOOLEAN DEFAULT FALSE,
    contact_ok BOOLEAN DEFAULT TRUE,
    type TEXT NOT NULL DEFAULT 'member', -- 'member' | 'guest'
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Add session_id to prayer_requests if not exists
DO $$ 
BEGIN 
    BEGIN ALTER TABLE prayer_requests ADD COLUMN session_id UUID REFERENCES checkin_sessions(id); EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE prayer_requests ADD COLUMN guest_name TEXT; EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- 4. Constraints
-- Ensure only one active session at a time (this is usually enforced in application logic, 
-- but we can add a partial unique index for 'active' status if the DB supports it)
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_session ON checkin_sessions (status) WHERE (status = 'active');

-- Prevent duplicate member check-in for the same session
CREATE UNIQUE INDEX IF NOT EXISTS idx_session_user ON checkins (session_id, user_id) WHERE (user_id IS NOT NULL);
