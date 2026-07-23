import pool from '../config/db.js';

// Create SOS alert
export const createSosAlert = async (
    senderId,
    receiverId,
    lat,
    long,
    type = 'INSTANT',
    cntdownEnd = null
) => {
    const result = await pool.query(
        `INSERT INTO sos_alerts
        (
            sender_id,
            receiver_id,
            lat,
            long,
            type,
            cntdown_end
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
            senderId,
            receiverId,
            lat,
            long,
            type,
            cntdownEnd
        ]
    );

    return result.rows[0];
};


// Get alerts received by a user
// Get alerts received by a user
export const getReceivedSosAlerts = async (receiverId) => {
    const result = await pool.query(
        `
        SELECT
            sa.*,
            u.username AS sender_username
        FROM sos_alerts sa
        JOIN users u
            ON sa.sender_id = u.id
        WHERE sa.receiver_id = $1
        AND sa.acked = FALSE
        ORDER BY sa.created_at DESC
        `,
        [receiverId]
    );

    return result.rows;
};

// Get alerts sent by a user
export const getSentSosAlerts = async (senderId) => {
    const result = await pool.query(
        `
        SELECT
            sa.*,
            u.username AS receiver_username
        FROM sos_alerts sa
        JOIN users u
            ON sa.receiver_id = u.id
        WHERE sa.sender_id = $1
        ORDER BY sa.created_at DESC
        `,
        [senderId]
    );

    return result.rows;
};


// Acknowledge an SOS alert
export const acknowledgeSosAlert = async (
    alertId,
    receiverId
) => {
    const result = await pool.query(
        `
        UPDATE sos_alerts
        SET
            acked = TRUE,
            acked_at = CURRENT_TIMESTAMP
        WHERE id = $1
        AND receiver_id = $2
        RETURNING *
        `,
        [
            alertId,
            receiverId
        ]
    );

    return result.rows[0];
};
