import pool from '../config/db.js';

/**
 * Insert a new message into the chat between sender and receiver.
 */
export const sendMessage = async (senderId, receiverId, body) => {

    const result = await pool.query(
        `
        INSERT INTO buddy_messages (sender_id, receiver_id, body)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [senderId, receiverId, body]
    );

    return result.rows[0];

};


/**
 * Fetch all messages in the conversation between two users.
 * Returns messages with aggregated reactions.
 */
export const getMessages = async (userId, buddyId) => {

    const result = await pool.query(
        `
        SELECT
            m.id,
            m.sender_id,
            m.receiver_id,
            m.body,
            m.created_at,
            COALESCE(
                json_agg(
                    json_build_object(
                        'emoji',   r.emoji,
                        'user_id', r.user_id
                    )
                ) FILTER (WHERE r.id IS NOT NULL),
                '[]'
            ) AS reactions
        FROM buddy_messages m
        LEFT JOIN buddy_message_reactions r ON r.message_id = m.id
        WHERE
            (m.sender_id = $1 AND m.receiver_id = $2)
            OR
            (m.sender_id = $2 AND m.receiver_id = $1)
        GROUP BY m.id
        ORDER BY m.created_at ASC
        `,
        [userId, buddyId]
    );

    return result.rows;

};


/**
 * Exclusive reaction toggle — one reaction per user per message.
 * - Same emoji clicked again → remove (unreact)
 * - Different emoji clicked  → swap (remove old, add new)
 * - No existing reaction     → add
 * Returns { action: 'added' | 'removed' | 'changed', from?, to? }
 */
export const toggleReaction = async (messageId, userId, emoji) => {

    // Get any existing reaction this user has on this message
    const existing = await pool.query(
        `
        SELECT id, emoji FROM buddy_message_reactions
        WHERE message_id = $1
          AND user_id    = $2
        `,
        [messageId, userId]
    );

    if (existing.rows.length > 0) {

        const prevEmoji = existing.rows[0].emoji;

        // Always remove the existing reaction first
        await pool.query(
            `
            DELETE FROM buddy_message_reactions
            WHERE message_id = $1
              AND user_id    = $2
            `,
            [messageId, userId]
        );

        // Same emoji → just remove (toggle off)
        if (prevEmoji === emoji) {
            return { action: 'removed' };
        }

        // Different emoji → add the new one (swap)
        await pool.query(
            `
            INSERT INTO buddy_message_reactions (message_id, user_id, emoji)
            VALUES ($1, $2, $3)
            `,
            [messageId, userId, emoji]
        );

        return { action: 'changed', from: prevEmoji, to: emoji };

    } else {

        // No existing reaction → add it
        await pool.query(
            `
            INSERT INTO buddy_message_reactions (message_id, user_id, emoji)
            VALUES ($1, $2, $3)
            `,
            [messageId, userId, emoji]
        );

        return { action: 'added' };

    }

};




export const getUnreadMessages = async (userId) => {

    const result = await pool.query(
        `
        SELECT
            m.sender_id,
            u.username AS sender_username,
            COUNT(*)::int AS unread_count,
            MAX(m.created_at) AS last_at
        FROM buddy_messages m
        JOIN users u ON u.id = m.sender_id
        WHERE m.receiver_id = $1
          AND m.is_read = false
        GROUP BY m.sender_id, u.username
        ORDER BY last_at DESC
        `,
        [userId]
    );

    return result.rows;

};


/**
 * Mark all messages from a specific sender to userId as read.
 */
export const markMessagesRead = async (userId, senderId) => {

    await pool.query(
        `
        UPDATE buddy_messages
        SET is_read = true
        WHERE receiver_id = $1
          AND sender_id   = $2
          AND is_read     = false
        `,
        [userId, senderId]
    );

};

