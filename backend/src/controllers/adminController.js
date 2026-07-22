import pool from '../config/db.js';

// =====================================================================
// Admin oversight controller.
//
// NOTE: Per project decision, these endpoints are intentionally left
// open (no authenticateUser/authorizeAdmin middleware). Access control
// is enforced on the frontend via the admin route guard only. If you
// later want to lock these down, wrap the routes in adminRoutes.js with
// authenticateUser + authorizeAdmin from middlewares/authMiddleware.js.
// =====================================================================

// GET /api/admin/bookings
// Every booking joined to its hotel, newest first. Answers
// "which guest has paid for what hotel and what dates".
export const getAllBookings = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT b.id,
                    b.user_email,
                    b.check_in,
                    b.check_out,
                    b.num_rooms,
                    b.total_amount,
                    b.transaction_id,
                    b.status,
                    b.created_at,
                    h.name     AS hotel_name,
                    h.location AS hotel_location
             FROM bookings b
             LEFT JOIN hotels h ON h.id = b.hotel_id
             ORDER BY b.created_at DESC`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Server error fetching bookings' });
    }
};

// PATCH /api/admin/bookings/:id/cancel
// Soft cancel: keep the row, flip status to 'cancelled' so history is
// preserved and the reserved dates free up.
export const cancelBooking = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ error: 'Server error cancelling booking' });
    }
};

// GET /api/admin/users
// Roster of registered accounts (no password hashes).
export const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, email, role FROM users ORDER BY id ASC`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Server error fetching users' });
    }
};

// PUT /api/admin/hotels/:id
// Edit an existing property. Any omitted field is left unchanged.
export const updateHotel = async (req, res) => {
    const { id } = req.params;
    const { name, location, price_per_night, image_url, rating, total_rooms } = req.body;
    try {
        const result = await pool.query(
            `UPDATE hotels
                SET name            = COALESCE($1, name),
                    location        = COALESCE($2, location),
                    price_per_night = COALESCE($3, price_per_night),
                    image_url       = COALESCE($4, image_url),
                    rating          = COALESCE($5, rating),
                    total_rooms     = COALESCE($6, total_rooms)
              WHERE id = $7
              RETURNING *`,
            [
                name ?? null,
                location ?? null,
                price_per_night ?? null,
                image_url ?? null,
                rating ?? null,
                total_rooms ?? null,
                id,
            ]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Hotel not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating hotel:', error);
        res.status(500).json({ error: 'Server error updating hotel' });
    }
};

// DELETE /api/admin/hotels/:id
// Removes the hotel. Because bookings.hotel_id and reviews.hotel_id use
// ON DELETE CASCADE, any bookings/reviews for this hotel are removed too.
export const deleteHotel = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `DELETE FROM hotels WHERE id = $1 RETURNING id`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Hotel not found' });
        }
        res.status(200).json({ message: 'Hotel deleted', id: result.rows[0].id });
    } catch (error) {
        console.error('Error deleting hotel:', error);
        res.status(500).json({ error: 'Server error deleting hotel' });
    }
};
