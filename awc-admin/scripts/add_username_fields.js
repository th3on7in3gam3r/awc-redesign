/**
 * Add username fields to user_profiles table
 * For @username mention system
 */

import { query } from '../db.mjs';

async function migrate() {
    console.log('🚀 Adding username fields to user_profiles...');

    try {
        // Add columns
        await query(`
            ALTER TABLE user_profiles 
            ADD COLUMN IF NOT EXISTS username TEXT,
            ADD COLUMN IF NOT EXISTS username_lower TEXT
        `);
        console.log('✅ Added username columns');

        // Add unique constraints
        await query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'username_unique'
                ) THEN
                    ALTER TABLE user_profiles ADD CONSTRAINT username_unique UNIQUE (username);
                END IF;
            END $$;
        `);
        console.log('✅ Added username unique constraint');

        await query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'username_lower_unique'
                ) THEN
                    ALTER TABLE user_profiles ADD CONSTRAINT username_lower_unique UNIQUE (username_lower);
                END IF;
            END $$;
        `);
        console.log('✅ Added username_lower unique constraint');

        // Add format constraints
        await query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'username_format'
                ) THEN
                    ALTER TABLE user_profiles
                    ADD CONSTRAINT username_format 
                    CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,20}$');
                END IF;
            END $$;
        `);
        console.log('✅ Added username format constraint');

        await query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'username_lower_format'
                ) THEN
                    ALTER TABLE user_profiles
                    ADD CONSTRAINT username_lower_format 
                    CHECK (username_lower IS NULL OR username_lower ~ '^[a-z0-9_]{3,20}$');
                END IF;
            END $$;
        `);
        console.log('✅ Added username_lower format constraint');

        // Add index
        await query(`
            CREATE INDEX IF NOT EXISTS idx_user_profiles_username_lower 
            ON user_profiles(username_lower)
        `);
        console.log('✅ Added index on username_lower');

        console.log('✨ Username fields migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

migrate()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
