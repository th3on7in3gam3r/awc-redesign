/**
 * Helper functions for chat notifications
 */

import { query } from '../db.mjs';

/**
 * Parse @username mentions from message body and create notifications
 */
export async function createMentionNotifications(channelId, senderId, messageBody) {
    try {
        // 1. Extract @username mentions (3-20 chars, a-z0-9_)
        const mentionRegex = /@([a-z0-9_]{3,20})/g;
        const mentions = [...messageBody.matchAll(mentionRegex)].map(m => m[1]);

        if (mentions.length === 0) return;

        // De-duplicate mentions
        const uniqueMentions = [...new Set(mentions)];

        // 2. Get channel info
        const channel = await query('SELECT name, type FROM chat_channels WHERE id = $1', [channelId]);
        if (channel.rows.length === 0) return;
        const channelName = channel.rows[0]?.name || 'chat';
        const channelType = channel.rows[0]?.type;

        // 3. Get sender info
        const sender = await query(`
            SELECT p.first_name, p.last_name, up.username
            FROM people p
            JOIN user_profiles up ON up.person_id = p.id
            WHERE p.id = $1
        `, [senderId]);

        if (sender.rows.length === 0) return;
        const senderName = `${sender.rows[0].first_name} ${sender.rows[0].last_name}`;
        const senderUsername = sender.rows[0].username || senderName;

        // 4. Resolve mentions to users
        for (const mentionedUsername of uniqueMentions) {
            const user = await query(`
                SELECT up.id as profile_id, p.id as person_id
                FROM user_profiles up
                JOIN people p ON up.person_id = p.id
                WHERE up.username_lower = LOWER($1)
            `, [mentionedUsername]);

            if (user.rows.length === 0) continue;
            const { profile_id, person_id } = user.rows[0];

            // Don't notify yourself
            if (person_id === senderId) continue;

            // Verify user is member of channel (for private channels)
            if (channelType === 'private') {
                const isMember = await query(`
                    SELECT 1 FROM chat_channel_members 
                    WHERE channel_id = $1 AND person_id = $2
                `, [channelId, person_id]);

                if (isMember.rows.length === 0) continue;
            }

            // 5. Create notification
            const snippet = messageBody.substring(0, 50) + (messageBody.length > 50 ? '...' : '');

            await query(`
                INSERT INTO notifications (profile_id, type, title, body, href)
                VALUES ($1, $2, $3, $4, $5)
            `, [
                profile_id,
                'CHAT_MENTION',
                `You were mentioned by @${senderUsername}`,
                `@${senderUsername}: "${snippet}"`,
                `/staff/chat?channel=${channelId}`
            ]);

            console.log(`✅ Created CHAT_MENTION notification for @${mentionedUsername}`);
        }
    } catch (error) {
        console.error('Error creating mention notifications:', error);
    }
}

/**
 * Create notification for direct messages
 */
export async function createDMNotification(channelId, senderId, messageBody) {
    try {
        // 1. Check if channel is DM (type='private' + 2 members)
        const channel = await query(`
            SELECT type, 
                   (SELECT COUNT(*) FROM chat_channel_members WHERE channel_id = $1) as member_count
            FROM chat_channels 
            WHERE id = $1
        `, [channelId]);

        if (channel.rows.length === 0) return;

        const { type, member_count } = channel.rows[0];
        if (type !== 'private' || parseInt(member_count) !== 2) {
            return; // Not a DM
        }

        // 2. Get the other member (recipient)
        const recipient = await query(`
            SELECT person_id FROM chat_channel_members 
            WHERE channel_id = $1 AND person_id != $2
        `, [channelId, senderId]);

        if (recipient.rows.length === 0) return;
        const recipientPersonId = recipient.rows[0].person_id;

        // Get user_profile id for notifications table
        const profile = await query('SELECT id FROM user_profiles WHERE person_id = $1', [recipientPersonId]);
        if (profile.rows.length === 0) return;
        const recipientProfileId = profile.rows[0].id;

        // 3. Get sender info
        const sender = await query('SELECT first_name, last_name FROM people WHERE id = $1', [senderId]);
        if (sender.rows.length === 0) return;
        const senderName = `${sender.rows[0].first_name} ${sender.rows[0].last_name}`;

        // 4. Create notification
        const snippet = messageBody.substring(0, 100) + (messageBody.length > 100 ? '...' : '');

        await query(`
            INSERT INTO notifications (profile_id, type, title, body, href)
            VALUES ($1, $2, $3, $4, $5)
        `, [
            recipientProfileId,
            'CHAT_DM',
            `New message from ${senderName}`,
            snippet,
            `/staff/chat?channel=${channelId}`
        ]);

        console.log(`✅ Created CHAT_DM notification for user ${recipientPersonId}`);
    } catch (error) {
        console.error('Error creating DM notification:', error);
    }
}

/**
 * Create notifications for group channel messages
 * Notifies all channel members except the sender
 */
export async function createGroupChannelNotification(channelId, senderId, messageBody) {
    try {
        // 1. Get channel info
        const channel = await query(`
            SELECT name, type,
                   (SELECT COUNT(*) FROM chat_channel_members WHERE channel_id = $1) as member_count
            FROM chat_channels 
            WHERE id = $1
        `, [channelId]);

        if (channel.rows.length === 0) return;

        const { name, type, member_count } = channel.rows[0];

        // Skip if it's a DM (handled by createDMNotification)
        if (type === 'private' && parseInt(member_count) === 2) {
            return;
        }

        // 2. Get sender info
        const sender = await query('SELECT first_name, last_name FROM people WHERE id = $1', [senderId]);
        if (sender.rows.length === 0) return;
        const senderName = `${sender.rows[0].first_name} ${sender.rows[0].last_name}`;

        // 3. Get all channel members except sender
        const members = await query(`
            SELECT ccm.person_id, up.id as profile_id
            FROM chat_channel_members ccm
            JOIN user_profiles up ON up.person_id = ccm.person_id
            WHERE ccm.channel_id = $1 AND ccm.person_id != $2
        `, [channelId, senderId]);

        if (members.rows.length === 0) return;

        // 4. Create notification for each member
        const snippet = messageBody.substring(0, 100) + (messageBody.length > 100 ? '...' : '');

        for (const member of members.rows) {
            await query(`
                INSERT INTO notifications (profile_id, type, title, body, href)
                VALUES ($1, $2, $3, $4, $5)
            `, [
                member.profile_id,
                'CHAT_MESSAGE',
                `${senderName} in ${name}`,
                snippet,
                `/staff/chat?channel=${channelId}`
            ]);
        }

        console.log(`✅ Created ${members.rows.length} CHAT_MESSAGE notification(s) for channel ${name}`);
    } catch (error) {
        console.error('Error creating group channel notifications:', error);
    }
}
