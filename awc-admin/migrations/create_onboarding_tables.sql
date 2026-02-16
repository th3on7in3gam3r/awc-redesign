-- Member Onboarding Migration
-- Creates onboarding_progress table and adds profile fields

-- Create onboarding_progress table
CREATE TABLE IF NOT EXISTS onboarding_progress (
    user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    current_step INTEGER DEFAULT 1,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add onboarding-related columns to user_profiles if they don't exist
DO $$ 
BEGIN
    -- Phone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='phone') THEN
        ALTER TABLE user_profiles ADD COLUMN phone VARCHAR(20);
    END IF;

    -- Birthday
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='birthday') THEN
        ALTER TABLE user_profiles ADD COLUMN birthday DATE;
    END IF;

    -- Address
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='address') THEN
        ALTER TABLE user_profiles ADD COLUMN address TEXT;
    END IF;

    -- Profile photo URL
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='profile_photo_url') THEN
        ALTER TABLE user_profiles ADD COLUMN profile_photo_url TEXT;
    END IF;

    -- Ministry interests (array)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='ministry_interests') THEN
        ALTER TABLE user_profiles ADD COLUMN ministry_interests TEXT[] DEFAULT '{}';
    END IF;

    -- Email notifications
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='email_notifications') THEN
        ALTER TABLE user_profiles ADD COLUMN email_notifications BOOLEAN DEFAULT true;
    END IF;

    -- SMS notifications
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='sms_notifications') THEN
        ALTER TABLE user_profiles ADD COLUMN sms_notifications BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_onboarding_timestamp ON onboarding_progress;
CREATE TRIGGER update_onboarding_timestamp
    BEFORE UPDATE ON onboarding_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_onboarding_updated_at();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_completed ON onboarding_progress(completed);
