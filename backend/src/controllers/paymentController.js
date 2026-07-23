import crypto from 'crypto';
import pool from '../config/db.js';

/**
 * Mock payment gateway.
 *
 * This simulates charging a card and always succeeds for well-formed input.
 * To swap in real Stripe later, replace the body of this function with a call
 * to stripe.paymentIntents.create({ amount, currency, ... }) and return the
 * PaymentIntent id as `transactionId`. The rest of processPayment stays the same.
 */
const chargeMockGateway = ({ amount }) => {
    // A tiny bit of realism: reject a zero/negative charge.
    if (!amount || amount <= 0) {
        return { success: false, error: 'Invalid charge amount' };
    }

    return {
        success: true,
        transactionId: `txn_${crypto.randomUUID()}`,
    };
};

const nightsBetween = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    const ms = end.getTime() - start.getTime();
    return Math.round(ms / (1000 * 60 * 60 * 24));
};

// POST /api/payments/process
// Requires: hotel_id, user_email, check_in, check_out
// Optional: num_rooms (default 1)
// (card_number / payment_method are accepted but never stored — mock only)
export const processPayment = async (req, res) => {
    const { hotel_id, user_email, check_in, check_out, num_rooms } = req.body;

    if (!hotel_id || !user_email || !check_in || !check_out) {
        return res.status(400).json({ error: 'hotel_id, user_email, check_in and check_out are required' });
    }

    const rooms = Number.parseInt(num_rooms, 10) || 1;
    if (rooms < 1) {
        return res.status(400).json({ error: 'num_rooms must be at least 1' });
    }

    const nights = nightsBetween(check_in, check_out);
    if (nights === null || nights < 1) {
        return res.status(400).json({ error: 'check_out must be at least one day after check_in' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Lock the hotel row so concurrent bookings for the SAME hotel serialize.
        // Without this, two guests could each read "1 room left" and both book it.
        const hotelResult = await client.query(
            'SELECT id, name, price_per_night, total_rooms FROM hotels WHERE id = $1 FOR UPDATE',
            [hotel_id]
        );

        if (hotelResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Hotel not found' });
        }

        const hotel = hotelResult.rows[0];
        const totalRooms = Number(hotel.total_rooms);

        // Rooms already held by active bookings that overlap these dates.
        const bookedResult = await client.query(
            `SELECT COALESCE(SUM(num_rooms), 0)::int AS rooms_booked
               FROM bookings
              WHERE hotel_id = $1
                AND status <> 'cancelled'
                AND check_in < $3
                AND check_out > $2`,
            [hotel_id, check_in, check_out]
        );
        const roomsBooked = Number(bookedResult.rows[0].rooms_booked);
        const roomsAvailable = totalRooms - roomsBooked;

        if (rooms > roomsAvailable) {
            await client.query('ROLLBACK');
            return res.status(409).json({
                error: roomsAvailable <= 0
                    ? 'Sorry, this hotel is fully booked for the selected dates.'
                    : `Only ${roomsAvailable} room${roomsAvailable === 1 ? '' : 's'} left for these dates.`,
                rooms_available: Math.max(0, roomsAvailable),
            });
        }

        // Real price is computed server-side (per room, per night) so the client can't tamper.
        const totalAmount = Number(hotel.price_per_night) * nights * rooms;

        // 1. Charge (mock)
        const charge = chargeMockGateway({ amount: totalAmount });
        if (!charge.success) {
            await client.query('ROLLBACK');
            return res.status(402).json({ error: charge.error || 'Payment failed' });
        }

        // 2. Persist the completed booking
        const bookingResult = await client.query(
            `INSERT INTO bookings
                (hotel_id, user_email, check_in, check_out, num_rooms, total_amount, transaction_id, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed')
             RETURNING *`,
            [hotel_id, user_email, check_in, check_out, rooms, totalAmount, charge.transactionId]
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Payment successful',
            transaction_id: charge.transactionId,
            nights,
            num_rooms: rooms,
            total_amount: totalAmount,
            booking: bookingResult.rows[0],
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error processing payment:', error);
        res.status(500).json({ error: 'Server error processing payment' });
    } finally {
        client.release();
    }
};
