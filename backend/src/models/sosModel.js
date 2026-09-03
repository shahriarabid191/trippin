import pool from '../config/db.js';


// Create SOS contact request
export const createSosRequest = async (userId, contactUid) => {

    const result = await pool.query(
        `
        INSERT INTO sos_contacts (
            user_id,
            contact_uid
        )
        VALUES ($1, $2)
        RETURNING *
        `,
        [
            userId,
            contactUid
        ]
    );

    return result.rows[0];

};



// Get all accepted SOS contacts of a user
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
        [
            userId
        ]
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
        [
            contactUid
        ]
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
        SET status = 'ACCEPTED'
        WHERE id = $1
          AND contact_uid = $2
          AND status = 'PENDING'
        RETURNING *
        `,
        [
            requestId,
            userId
        ]
    );

    const request = result.rows[0];

    if (!request) {
        return null;
    }


    /*
     * Create the reverse accepted relationship.
     *
     * Original:
     * user_id = requester
     * contact_uid = receiver
     *
     * Reverse:
     * user_id = receiver
     * contact_uid = requester
     */
    await pool.query(
        `
        INSERT INTO sos_contacts (
            user_id,
            contact_uid,
            status
        )
        VALUES ($1, $2, 'ACCEPTED')
        `,
        [
            request.contact_uid,
            request.user_id
        ]
    );


    return request;

};



// Reject SOS request
export const rejectSosRequest = async (
    requestId,
    userId
) => {

    const result = await pool.query(
        `
        UPDATE sos_contacts
        SET status = 'REJECTED'
        WHERE id = $1
          AND contact_uid = $2
          AND status = 'PENDING'
        RETURNING *
        `,
        [
            requestId,
            userId
        ]
    );

    return result.rows[0] || null;

};



// Remove SOS contact
export const removeSosContact = async (
    id,
    userId
) => {

    /*
     * The relationship can be represented from
     * either side. Make sure the authenticated user
     * belongs to the relationship being removed.
     */
    const result = await pool.query(
        `
        DELETE FROM sos_contacts
        WHERE id = $1
          AND status = 'ACCEPTED'
          AND (
                user_id = $2
                OR
                contact_uid = $2
          )
        RETURNING *
        `,
        [
            id,
            userId
        ]
    );

    const contact = result.rows[0];

    if (!contact) {
        return null;
    }


    /*
     * Remove the reverse relationship too.
     */
    await pool.query(
        `
        DELETE FROM sos_contacts
        WHERE status = 'ACCEPTED'
          AND user_id = $1
          AND contact_uid = $2
        `,
        [
            contact.contact_uid,
            contact.user_id
        ]
    );


    return contact;

};

