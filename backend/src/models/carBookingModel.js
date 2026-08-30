import db from "../config/db.js";

// Get all bookings made by a user
export const getBookingsByUserID = async (userID) => {
    const result = await db.query(
        `
        SELECT cb.id, cb.car_id, cb.user_id, cb.status, cb.notes, cb.created_at,
            cb.start_date::date::text AS start_date,
            cb.end_date::date::text AS end_date,
            c.name AS car_name, c.type, c.location, c.price_per_day
        FROM car_bookings cb
        JOIN cars c ON c.id = cb.car_id
        WHERE cb.user_id=$1
        ORDER BY cb.start_date DESC
        `,
        [userID]
    );
    return result.rows;
};

// Add a booking
export const addBooking = async (booking) => {
    const result = await db.query(
        `
        INSERT INTO car_bookings(car_id, user_id, start_date, end_date, notes)
        VALUES($1,$2,$3,$4,$5)
        RETURNING id, car_id, user_id, status, notes, created_at,
            start_date::date::text AS start_date,
            end_date::date::text AS end_date
        `,
        [booking.carID, booking.userID, booking.startDate, booking.endDate, booking.notes]
    );
    return result.rows[0];
};

// Cancel/delete a booking
export const deleteBooking = async (id, userID) => {
    const result = await db.query(
        "DELETE FROM car_bookings WHERE id=$1 AND user_id=$2",
        [id, userID]
    );
    return result.rowCount;
}; 