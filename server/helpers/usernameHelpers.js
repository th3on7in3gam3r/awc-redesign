/**
 * Username helper functions
 */

import { query } from '../db.mjs';

/**
 * Generate suggested username from name
 */
export function generateSuggestedUsername(firstName, lastName) {
    if (!firstName || !lastName) return null;

    // Base: first initial + last name (e.g., jmahabir)
    let base = (firstName[0] + lastName).toLowerCase();

    // Remove non-alphanumeric except underscore
    base = base.replace(/[^a-z0-9_]/g, '');

    // Ensure minimum 3 chars
    if (base.length < 3) {
        base = base + '123';
    }

    // Ensure maximum 20 chars
    if (base.length > 20) {
        base = base.substring(0, 20);
    }

    return base;
}

/**
 * Find available username with numeric suffix if needed
 */
export async function findAvailableUsername(base) {
    let username = base;
    let suffix = 1;

    while (await usernameExists(username)) {
        username = base + suffix;
        suffix++;

        // Truncate if too long
        if (username.length > 20) {
            const suffixStr = suffix.toString();
            username = base.substring(0, 20 - suffixStr.length) + suffixStr;
        }

        // Safety limit
        if (suffix > 999) {
            throw new Error('Could not find available username');
        }
    }

    return username;
}

/**
 * Check if username exists
 */
export async function usernameExists(username) {
    const result = await query(
        'SELECT 1 FROM user_profiles WHERE username_lower = LOWER($1)',
        [username]
    );
    return result.rows.length > 0;
}

/**
 * Validate username format
 */
export function validateUsername(username) {
    const usernameRegex = /^[a-z0-9_]{3,20}$/;
    return usernameRegex.test(username);
}
