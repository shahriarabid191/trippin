import pool from '../config/db.js';

// Create travel buddy request
export const createTravelBuddyRequest = async (userId, buddyId) => {
    const result = await pool.query(
        `INSERT INTO travel_buddies (user_id, buddy_id)
         VALUES ($1, $2)
         RETURNING *`,
        [userId, buddyId]
    );

    return result.rows[0];
};


// Get all accepted travel buddies of a user
export const getTravelBuddies = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            tb.id,
            tb.user_id,
            tb.buddy_id,
            tb.status,
            tb.created_at,
            u.username
        FROM travel_buddies tb
        JOIN users u
            ON tb.buddy_id = u.id
        WHERE tb.user_id = $1
        AND tb.status = 'ACCEPTED'
        ORDER BY u.username
        `,
        [userId]
    );

    return result.rows;
};


// Get pending travel buddy requests received by a user
export const getPendingTravelBuddyRequests = async (buddyId) => {
    const result = await pool.query(
        `
        SELECT
            tb.id,
            tb.user_id,
            tb.buddy_id,
            tb.status,
            tb.created_at,
            u.username
        FROM travel_buddies tb
        JOIN users u
            ON tb.user_id = u.id
        WHERE tb.buddy_id = $1
        AND tb.status = 'PENDING'
        ORDER BY tb.created_at DESC
        `,
        [buddyId]
    );

    return result.rows;
};


// Accept travel buddy request
export const acceptTravelBuddyRequest = async (
    requestId,
    buddyId
) => {

    const result = await pool.query(
        `
        UPDATE travel_buddies
        SET status = 'ACCEPTED'
        WHERE id = $1
        AND buddy_id = $2
        AND status = 'PENDING'
        RETURNING *
        `,
        [
            requestId,
            buddyId
        ]
    );

    const request = result.rows[0];

    if (!request) {
        return null;
    }


    // Create reverse relationship
    await pool.query(
        `
        INSERT INTO travel_buddies
        (
            user_id,
            buddy_id,
            status
        )
        VALUES
        ($1, $2, 'ACCEPTED')
        `,
        [
            request.buddy_id,
            request.user_id
        ]
    );


    return request;
};


// Reject travel buddy request
export const rejectTravelBuddyRequest = async (
    requestId,
    buddyId
) => {

    const result = await pool.query(
        `
        UPDATE travel_buddies
        SET status = 'REJECTED'
        WHERE id = $1
        AND buddy_id = $2
        AND status = 'PENDING'
        RETURNING *
        `,
        [
            requestId,
            buddyId
        ]
    );

    return result.rows[0];
};


// Remove travel buddy
export const removeTravelBuddy = async (
    id,
    userId
) => {

    const result = await pool.query(
        `
        DELETE FROM travel_buddies
        WHERE
            status = 'ACCEPTED'
            AND (
                (id = $1 AND user_id = $2)
                OR
                (id = $1 AND buddy_id = $2)
            )
        RETURNING *
        `,
        [
            id,
            userId
        ]
    );

    const buddy = result.rows[0];

    if (!buddy) {
        return null;
    }


    // Remove reverse relationship
    await pool.query(
        `
        DELETE FROM travel_buddies
        WHERE
            status = 'ACCEPTED'
            AND user_id = $1
            AND buddy_id = $2
        `,
        [
            buddy.buddy_id,
            buddy.user_id
        ]
    );


    return buddy;
};