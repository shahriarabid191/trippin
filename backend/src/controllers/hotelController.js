import pool from '../config/db.js';

// Get all hotels for the Booking page
export const getHotels = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM hotels ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching hotels:', error);
        res.status(500).json({ error: 'Server error fetching hotels' });
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