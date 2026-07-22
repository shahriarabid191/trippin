import pool from '../config/db.js';

// GET /api/reviews/:hotelId
// Public: returns all reviews for a given hotel, newest first.
export const getReviewsByHotel = async (req, res) => {
    const { hotelId } = req.params;

    try {
        const result = await pool.query(
            'SELECT id, hotel_id, user_email, rating, comment, created_at FROM reviews WHERE hotel_id = $1 ORDER BY created_at DESC',
            [hotelId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Server error fetching reviews' });
    }
};

// POST /api/reviews
// Requires: hotel_id, user_email, rating (1-5), comment
export const addReview = async (req, res) => {
    const { hotel_id, user_email, rating, comment } = req.body;

    // Basic validation
    if (!hotel_id || !user_email || rating === undefined || rating === null) {
        return res.status(400).json({ error: 'hotel_id, user_email and rating are required' });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO reviews (hotel_id, user_email, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
            [hotel_id, user_email, numericRating, comment || '']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ error: 'Server error adding review' });
    }
};
