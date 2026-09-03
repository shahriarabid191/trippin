import pool from "../config/db.js";

/**
 * Create a new notification.
 */
export const createNotification = async ({
    userId,
    eventId,
    type,
    title,
    message,
    priority = "normal",
    metadata = {}
}) => {
    const result = await pool.query(
        `
        INSERT INTO notifications (
            user_id,
            event_id,
            type,
            title,
            message,
            priority,
            metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (event_id, user_id) DO NOTHING
        RETURNING *
        `,
        [
            userId,
            eventId,
            type,
            title,
            message,
            priority,
            metadata
        ]
    );

    return result.rows[0] || null;
};



/**
 * Get notifications for a user.
 */
export const getNotifications = async (userId, limit = 50) => {
    const result = await pool.query(
        `
        SELECT
            id,
            user_id,
            event_id,
            type,
            title,
            message,
            priority,
            metadata,
            is_read,
            read_at,
            created_at AT TIME ZONE 'UTC' AS created_at
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
        `,
        [userId, limit]
    );

    return result.rows;
};




/**
 * Get unread notification count.
 */
export const getUnreadCount = async (userId) => {
    const result = await pool.query(
        `
        SELECT COUNT(*)::int AS count
        FROM notifications
        WHERE user_id = $1
          AND is_read = false
        `,
        [userId]
    );

    return result.rows[0].count;
};


/**
 * Mark one notification as read.
 */
export const markAsRead = async (notificationId, userId) => {
    const result = await pool.query(
        `
        UPDATE notifications
        SET
            is_read = true,
            read_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND user_id = $2
          AND is_read = false
        RETURNING *
        `,
        [notificationId, userId]
    );

    return result.rows[0] || null;
};


/**
 * Mark all notifications as read.
 */
export const markAllAsRead = async (userId) => {
    const result = await pool.query(
        `
        UPDATE notifications
        SET
            is_read = true,
            read_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
          AND is_read = false
        RETURNING id
        `,
        [userId]
    );

    return result.rows.length;
};