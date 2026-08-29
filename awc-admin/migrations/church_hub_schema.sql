-- Migration: Setup Church Hub Schema (Fixed Reference Syntax)

-- 1. Update user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW()
);

DO $$ 
BEGIN 
    -- Add columns if they don't exist
    BEGIN ALTER TABLE user_profiles ADD COLUMN auth_user_id TEXT UNIQUE; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE user_profiles ADD COLUMN first_name TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE user_profiles ADD COLUMN last_name TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE user_profiles ADD COLUMN email TEXT UNIQUE; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE user_profiles ADD COLUMN phone TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE user_profiles ADD COLUMN role TEXT DEFAULT 'member'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE user_profiles ADD COLUMN membership_status TEXT DEFAULT 'active'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE user_profiles ADD COLUMN joined_date DATE DEFAULT CURRENT_DATE; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE user_profiles ADD COLUMN preferred_contact TEXT DEFAULT 'email'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE user_profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE user_profiles ADD COLUMN last_login TIMESTAMP; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE user_profiles ADD COLUMN password_hash TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE user_profiles ADD COLUMN avatar TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE user_profiles ADD COLUMN address TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE user_profiles ADD COLUMN bio TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE user_profiles ADD COLUMN updated_at TIMESTAMP DEFAULT NOW(); EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE user_profiles ADD COLUMN gender TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE user_profiles ADD COLUMN city TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE user_profiles ADD COLUMN state TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE user_profiles ADD COLUMN date_of_birth DATE; EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- 2. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id),
    service_date DATE NOT NULL,
    service_type TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Ministries Table
CREATE TABLE IF NOT EXISTS ministries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

DO $$ 
BEGIN 
    BEGIN ALTER TABLE ministries ADD COLUMN description TEXT; EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- 4. User Ministries (Link Table)
CREATE TABLE IF NOT EXISTS user_ministries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id),
    ministry_id UUID REFERENCES ministries(id),
    role TEXT DEFAULT 'volunteer',
    joined_at TIMESTAMP DEFAULT NOW()
);

-- 5. Prayer Requests
CREATE TABLE IF NOT EXISTS prayer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id),
    request_text TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. User Notes (Pastoral/Admin notes)
CREATE TABLE IF NOT EXISTS user_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id),
    note TEXT NOT NULL,
    created_by UUID, -- Can references user_profiles(id)
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Seed Data (Idempotent)
INSERT INTO ministries (name, description)
SELECT 'Worship Team', 'Leading the congregation in praise'
WHERE NOT EXISTS (SELECT 1 FROM ministries WHERE name = 'Worship Team');

INSERT INTO ministries (name, description)
SELECT 'Ushers', 'Welcoming and assisting guests'
WHERE NOT EXISTS (SELECT 1 FROM ministries WHERE name = 'Ushers');

INSERT INTO ministries (name, description)
SELECT 'Tech Team', 'Audio, Video, and Lighting support'
WHERE NOT EXISTS (SELECT 1 FROM ministries WHERE name = 'Tech Team');
