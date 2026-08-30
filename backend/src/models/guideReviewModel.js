import db from "../config/db.js";

// Get all reviews for a guide
export const getReviewsByGuideID = async (guideID) => {
    const result = await db.query(
        `
        SELECT gr.*, u.email AS user_name
        FROM guide_reviews gr
        JOIN users u ON u.id = gr.user_id 
        WHERE gr.guide_id=$1
        ORDER BY gr.created_at DESC
        `,
        [guideID]
    );
    return result.rows;
};

// Get average rating + review count for a guide
export const getRatingSummary = async (guideID) => {
    const result = await db.query(
        `
        SELECT COALESCE(AVG(rating),0)::numeric(2,1) AS avg_rating, COUNT(*) AS review_count
        FROM guide_reviews
        WHERE guide_id=$1
        `,
        [guideID]
    );
    return result.rows[0];
};

// Get average ratings for ALL guides at once (for the browse list)
export const getAllRatingSummaries = async () => {
    const result = await db.query(
        `
        SELECT guide_id, COALESCE(AVG(rating),0)::numeric(2,1) AS avg_rating, COUNT(*) AS review_count
        FROM guide_reviews
        GROUP BY guide_id
        `
    );
    return result.rows;
};

// Add a review
export const addReview = async (review) => {
    const result = await db.query(
        `
        INSERT INTO guide_reviews(guide_id, user_id, rating, comment)
        VALUES($1,$2,$3,$4)
        RETURNING *
        `,
        [review.guideID, review.userID, review.rating, review.comment]
    );
    return result.rows[0];
};

// Delete a review (only by the person who wrote it)
export const deleteReview = async (id, userID) => {
    const result = await db.query(
        "DELETE FROM guide_reviews WHERE id=$1 AND user_id=$2",
        [id, userID]
    );
    return result.rowCount;
}; 