import db from "../config/db.js";

// Get all bookings made by a user
export const getBookingsByUserID = async (userID) => {
    const result = await db.query(
        `
        SELECT gb.id, gb.guide_id, gb.user_id, gb.status, gb.notes, gb.created_at,
            gb.booking_date::date::text AS booking_date,
            g.name AS guide_name, g.location, g.price_per_day
        FROM guide_bookings gb
        JOIN guides g ON g.id = gb.guide_id
        WHERE gb.user_id=$1
        ORDER BY gb.booking_date DESC
        `,
        [userID]
    );
    return result.rows;
}; 

// Add a booking
export const addBooking = async (booking) => {
    const result = await db.query(
        `
        INSERT INTO guide_bookings(guide_id, user_id, booking_date, notes)
        VALUES($1,$2,$3,$4)
        RETURNING id, guide_id, user_id, status, notes, created_at,
            booking_date::date::text AS booking_date
        `,
        [booking.guideID, booking.userID, booking.bookingDate, booking.notes]
    );
    return result.rows[0];
};

// Cancel/delete a booking
export const deleteBooking = async (id, userID) => {
    const result = await db.query(
        "DELETE FROM guide_bookings WHERE id=$1 AND user_id=$2",
        [id, userID]
    );
    return result.rowCount;
}; 