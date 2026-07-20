import db from "../config/db.js";

// Get the current draft itinerary for a user
export const getDraftByUserID = async (userID) => {
    const result = await db.query(
        "SELECT * FROM itineraries WHERE user_id=$1",
        [userID]
    );
    return result.rows[0];
};

// Create or replace the user's current draft itinerary
export const upsertDraft = async (userID, answers, content) => {
    const result = await db.query(
        `
        INSERT INTO itineraries(user_id, answers, content)
        VALUES($1, $2, $3)
        ON CONFLICT (user_id)
        DO UPDATE SET answers=$2, content=$3, updated_at=now()
        RETURNING *
        `,
        [userID, answers, content]
    );
    return result.rows[0];
};

// Delete the user's current draft itinerary
export const deleteDraft = async (userID) => {
    const result = await db.query(
        "DELETE FROM itineraries WHERE user_id=$1",
        [userID]
    );
    return result.rowCount;
};
