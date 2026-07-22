import pool from '../config/db.js';

// Get all hotels for the Booking page (with review aggregates for the card badges)
export const getHotels = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT h.*,
                    COALESCE(AVG(r.rating), h.rating)::numeric(3,1) AS avg_rating,
                    COUNT(r.id)::int AS review_count
             FROM hotels h
             LEFT JOIN reviews r ON r.hotel_id = h.id
             GROUP BY h.id
             ORDER BY h.created_at DESC`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching hotels:', error);
        res.status(500).json({ error: 'Server error fetching hotels' });
    }
};

// Get a single hotel for the Hotel Details page
export const getHotelById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT h.*,
                    COALESCE(AVG(r.rating), h.rating)::numeric(3,1) AS avg_rating,
                    COUNT(r.id)::int AS review_count
             FROM hotels h
             LEFT JOIN reviews r ON r.hotel_id = h.id
             WHERE h.id = $1
             GROUP BY h.id`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Hotel not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching hotel:', error);
        res.status(500).json({ error: 'Server error fetching hotel' });
    }
};

// Admin only: Add a new hotel
export const addHotel = async (req, res) => {
    const { name, location, price_per_night, image_url, rating } = req.body;
    
    try {
        const result = await pool.query(
            'INSERT INTO hotels (name, location, price_per_night, image_url, rating) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, location, price_per_night, image_url, rating || 5.0]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding hotel:', error);
        res.status(500).json({ error: 'Server error adding hotel' });
    }
};