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

// GET /api/reviews/highlights
// Public: best real guest reviews across all hotels, for homepage testimonials.
export const getFeaturedReviews = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT r.id, r.rating, r.comment, r.user_email, r.created_at,
                    h.name AS hotel_name
             FROM reviews r
             JOIN hotels h ON h.id = r.hotel_id
             WHERE r.rating >= 4 AND r.comment <> ''
             ORDER BY r.rating DESC, r.created_at DESC
             LIMIT 6`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching featured reviews:', error);
        res.status(500).json({ error: 'Server error fetching featured reviews' });
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
