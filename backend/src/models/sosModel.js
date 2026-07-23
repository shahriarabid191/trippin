import pool from '../config/db.js';

// Create SOS contact request
export const createSosRequest = async (userId, contactUid) => {
    const result = await pool.query(
        `INSERT INTO sos_contacts (user_id, contact_uid)
         VALUES ($1, $2)
         RETURNING *`,
        [userId, contactUid]
    );

    return result.rows[0];
};


// Get all SOS contacts of a user
export const getSosContacts = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            sc.id,
            sc.user_id,
            sc.contact_uid,
            sc.status,
            sc.created_at,
            u.username
        FROM sos_contacts sc
        JOIN users u
            ON sc.contact_uid = u.id
        WHERE sc.user_id = $1
        AND sc.status = 'ACCEPTED'
        ORDER BY u.username
        `,
        [userId]
    );

    return result.rows;
};


// Get pending SOS requests received by a user
export const getPendingSosRequests = async (contactUid) => {
    const result = await pool.query(
        `
        SELECT
            sc.id,
            sc.user_id,
            sc.contact_uid,
            sc.status,
            sc.created_at,
            u.username
        FROM sos_contacts sc
        JOIN users u
            ON sc.user_id = u.id
        WHERE sc.contact_uid = $1
        AND sc.status = 'PENDING'
        ORDER BY sc.created_at DESC
        `,
        [contactUid]
    );

    return result.rows;
};


// Accept SOS request
export const acceptSosRequest = async (
    requestId,
    userId
) => {


    const result = await pool.query(
        `
        UPDATE sos_contacts
        SET status='ACCEPTED'
        WHERE id=$1
        AND contact_uid=$2
        AND status='PENDING'
        RETURNING *
        `,
        [
            requestId,
            userId
        ]
    );


    const request=result.rows[0];


    if(!request)
        return null;



    await pool.query(
        `
        INSERT INTO sos_contacts
        (
            user_id,
            contact_uid,
            status
        )
        VALUES
        ($1,$2,'ACCEPTED')
        `,
        [
            request.contact_uid,
            request.user_id
        ]
    );


    return request;

};

// Reject SOS request
export const rejectSosRequest = async (requestId) => {
    const result = await pool.query(
        `UPDATE sos_contacts
         SET status = 'REJECTED'
         WHERE id = $1
         RETURNING *`,
        [requestId]
    );

    return result.rows[0];
};


// Remove SOS contact
export const removeSosContact = async (id) => {
    const result = await pool.query(
        `DELETE FROM sos_contacts
         WHERE id = $1
         RETURNING *`,
        [id]
    );

    return result.rows[0];
};