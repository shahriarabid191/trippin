import db from "../config/db.js";

// Get all reviews for a car
export const getReviewsByCarID = async (carID) => {
    const result = await db.query(
        `
        SELECT cr.*, u.email AS user_name
        FROM car_reviews cr
        JOIN users u ON u.id = cr.user_id
        WHERE cr.car_id=$1
        ORDER BY cr.created_at DESC
        `,
        [carID]
    ); 
    return result.rows;
};

// Get average rating + review count for a car
export const getRatingSummary = async (carID) => {
    const result = await db.query(
        `
        SELECT COALESCE(AVG(rating),0)::numeric(2,1) AS avg_rating, COUNT(*) AS review_count
        FROM car_reviews
        WHERE car_id=$1
        `,
        [carID]
    );
    return result.rows[0];
};

// Get average ratings for ALL cars at once (for the browse list)
export const getAllRatingSummaries = async () => {
    const result = await db.query(
        `
        SELECT car_id, COALESCE(AVG(rating),0)::numeric(2,1) AS avg_rating, COUNT(*) AS review_count
        FROM car_reviews
        GROUP BY car_id
        `
    );
    return result.rows;
};

// Add a review
export const addReview = async (review) => {
    const result = await db.query(
        `
        INSERT INTO car_reviews(car_id, user_id, rating, comment)
        VALUES($1,$2,$3,$4)
        RETURNING *
        `,
        [review.carID, review.userID, review.rating, review.comment]
    );
    return result.rows[0];
};

// Delete a review
export const deleteReview = async (id, userID) => {
    const result = await db.query(
        "DELETE FROM car_reviews WHERE id=$1 AND user_id=$2",
        [id, userID]
    );
    return result.rowCount;
}; 