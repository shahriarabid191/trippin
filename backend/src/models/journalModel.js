import db from "../config/db.js";

// Get all journal entries belonging to a user (their own, private + public)
export const getJournalsByUserID = async (userID) => {
    const result = await db.query(
        "SELECT * FROM journals WHERE user_id=$1 ORDER BY created_at DESC",
        [userID]
    );
    return result.rows;
};

// Get all public journal entries (for the community feed)
export const getPublicJournals = async () => {
    const result = await db.query(
        "SELECT * FROM journals WHERE is_public=true ORDER BY created_at DESC"
    );
    return result.rows;
};

// Delete journal entry
export const deleteJournal = async (id, userID) => {
    const result = await db.query(
        "DELETE FROM journals WHERE id=$1 AND user_id=$2",
        [id, userID]
    );
    return result.rowCount;
};

// Add journal entry
export const addJournal = async (journal) => {
    const result = await db.query(
        `
        INSERT INTO journals(title, content, is_public, user_id)
        VALUES($1,$2,$3,$4)
        RETURNING *
        `,
        [journal.title, journal.content, journal.isPublic, journal.userID]
    );
    return result.rows[0];
};

// Update journal entry
export const updateJournal = async (id, userID, journal) => {
    const result = await db.query(
        `
        UPDATE journals
        SET title=$1, content=$2, is_public=$3
        WHERE id=$4 AND user_id=$5
        `,
        [journal.title, journal.content, journal.isPublic, id, userID]
    );
    return result.rowCount;
}; 