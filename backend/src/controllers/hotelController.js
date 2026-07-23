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
    const { name, location, price_per_night, image_url, rating, total_rooms } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO hotels (name, location, price_per_night, image_url, rating, total_rooms) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, location, price_per_night, image_url, rating || 5.0, total_rooms || 10]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding hotel:', error);
        res.status(500).json({ error: 'Server error adding hotel' });
    }
};

// GET /api/hotels/:id/availability?check_in=YYYY-MM-DD&check_out=YYYY-MM-DD
// How many rooms are free for the given date range. A room is "taken" only
// for bookings whose stay overlaps the requested range, so a room booked
// next week does not block this week.
export const getAvailability = async (req, res) => {
    const { id } = req.params;
    const { check_in, check_out } = req.query;

    if (!check_in || !check_out) {
        return res.status(400).json({ error: 'check_in and check_out query params are required' });
    }
    if (new Date(check_out) <= new Date(check_in)) {
        return res.status(400).json({ error: 'check_out must be after check_in' });
    }

    try {
        const hotelRes = await pool.query('SELECT total_rooms FROM hotels WHERE id = $1', [id]);
        if (hotelRes.rows.length === 0) {
            return res.status(404).json({ error: 'Hotel not found' });
        }
        const totalRooms = Number(hotelRes.rows[0].total_rooms);

        // Two date ranges overlap iff existing.check_in < requested.check_out
        //                          AND existing.check_out > requested.check_in
        const bookedRes = await pool.query(
            `SELECT COALESCE(SUM(num_rooms), 0)::int AS rooms_booked
               FROM bookings
              WHERE hotel_id = $1
                AND status <> 'cancelled'
                AND check_in < $3
                AND check_out > $2`,
            [id, check_in, check_out]
        );
        const roomsBooked = Number(bookedRes.rows[0].rooms_booked);
        const roomsAvailable = Math.max(0, totalRooms - roomsBooked);

        res.status(200).json({
            total_rooms: totalRooms,
            rooms_booked: roomsBooked,
            rooms_available: roomsAvailable,
        });
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({ error: 'Server error checking availability' });
    }
};