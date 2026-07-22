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
// (card_number / payment_method are accepted but never stored — mock only)
export const processPayment = async (req, res) => {
    const { hotel_id, user_email, check_in, check_out } = req.body;

    if (!hotel_id || !user_email || !check_in || !check_out) {
        return res.status(400).json({ error: 'hotel_id, user_email, check_in and check_out are required' });
    }

    const nights = nightsBetween(check_in, check_out);
    if (nights === null || nights < 1) {
        return res.status(400).json({ error: 'check_out must be at least one day after check_in' });
    }

    try {
        // Look up the real price server-side so the client can't tamper with the total.
        const hotelResult = await pool.query(
            'SELECT id, name, price_per_night FROM hotels WHERE id = $1',
            [hotel_id]
        );

        if (hotelResult.rows.length === 0) {
            return res.status(404).json({ error: 'Hotel not found' });
        }

        const hotel = hotelResult.rows[0];
        const totalAmount = Number(hotel.price_per_night) * nights;

        // 1. Charge (mock)
        const charge = chargeMockGateway({ amount: totalAmount });
        if (!charge.success) {
            return res.status(402).json({ error: charge.error || 'Payment failed' });
        }

        // 2. Persist the completed booking
        const bookingResult = await pool.query(
            `INSERT INTO bookings
                (hotel_id, user_email, check_in, check_out, total_amount, transaction_id, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'completed')
             RETURNING *`,
            [hotel_id, user_email, check_in, check_out, totalAmount, charge.transactionId]
        );

        res.status(201).json({
            message: 'Payment successful',
            transaction_id: charge.transactionId,
            nights,
            total_amount: totalAmount,
            booking: bookingResult.rows[0],
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ error: 'Server error processing payment' });
    }
};
