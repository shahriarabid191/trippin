import pool from "../../config/db.js";
import { parseListParams, listEnvelope } from "../../utils/adminQuery.js";

// =====================================================================
// GET/PATCH /api/admin/bookings
//
// Read-only oversight across all three booking tables, presented as one
// ledger. Amounts exist only for hotel bookings on this schema
// (car_bookings / guide_bookings have no amount column) so car/guide
// rows show amount = null.
// =====================================================================

const LEDGER = `
    SELECT 'hotel'::text AS type, b.id, b.status, b.created_at::timestamptz AS created_at,
           b.user_email, NULL::int AS user_id,
           h.name AS item_name, h.location AS item_location,
           b.check_in::text AS start_date, b.check_out::text AS end_date,
           b.total_amount AS amount, b.transaction_id, b.admin_note, b.num_rooms
      FROM bookings b
      LEFT JOIN hotels h ON h.id = b.hotel_id
    UNION ALL
    SELECT 'car'::text, cb.id, cb.status, cb.created_at::timestamptz,
           u.email, cb.user_id,
           c.name, c.location,
           cb.start_date::text, cb.end_date::text,
           NULL::numeric, NULL::text, cb.admin_note, NULL::int
      FROM car_bookings cb
      LEFT JOIN cars c  ON c.id = cb.car_id
      LEFT JOIN users u ON u.id = cb.user_id
    UNION ALL
    SELECT 'guide'::text, gb.id, gb.status, gb.created_at::timestamptz,
           u.email, gb.user_id,
           g.name, g.location,
           gb.booking_date::text, gb.booking_date::text,
           NULL::numeric, NULL::text, gb.admin_note, NULL::int
      FROM guide_bookings gb
      LEFT JOIN guides g ON g.id = gb.guide_id
      LEFT JOIN users u  ON u.id = gb.user_id
`;

const FILTER = `
    WHERE ($1 = 'all' OR type = $1)
      AND ($2 = '' OR status = $2)
      AND ($3 = '' OR user_email ILIKE '%'||$3||'%' OR item_name ILIKE '%'||$3||'%')
`;

const TABLE = { hotel: "bookings", car: "car_bookings", guide: "guide_bookings" };

// GET /api/admin/bookings?type=all|hotel|car|guide&status=&search=&page=&limit=
export const listBookings = async (req, res) => {
    const { limit, offset, search, page } = parseListParams(req.query, {});
    const type = ["hotel", "car", "guide"].includes(req.query.type) ? req.query.type : "all";
    const status = typeof req.query.status === "string" ? req.query.status.trim() : "";

    const rows = await pool.query(
        `WITH ledger AS (${LEDGER})
         SELECT * FROM ledger ${FILTER}
         ORDER BY created_at DESC
         LIMIT $4 OFFSET $5`,
        [type, status, search, limit, offset]
    );
    const total = await pool.query(
        `WITH ledger AS (${LEDGER}) SELECT COUNT(*)::int AS n FROM ledger ${FILTER}`,
        [type, status, search]
    );

    res.json(listEnvelope(rows.rows, total.rows[0].n, { page, limit }));
};

// GET /api/admin/bookings/summary  — small counts for the header strip
export const bookingsSummary = async (req, res) => {
    const { rows } = await pool.query(
        `WITH ledger AS (${LEDGER})
         SELECT
            COUNT(*)::int                                          AS total,
            COUNT(*) FILTER (WHERE type = 'hotel')::int            AS hotel,
            COUNT(*) FILTER (WHERE type = 'car')::int              AS car,
            COUNT(*) FILTER (WHERE type = 'guide')::int            AS guide,
            COUNT(*) FILTER (WHERE status = 'cancelled')::int      AS cancelled,
            COUNT(*) FILTER (WHERE status = 'refunded')::int       AS refunded,
            COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')::int AS this_week
         FROM ledger`
    );
    res.json(rows[0]);
};

const mutate = async (req, res, newStatus) => {
    const { type, id } = req.params;
    if (!TABLE[type]) return res.status(400).json({ message: "Unknown booking type" });

    if (newStatus === "refunded" && type !== "hotel") {
        return res.status(400).json({
            message: "Only hotel bookings carry a simulated payment that can be refunded",
        });
    }

    const note = (req.body?.note || "").toString().trim().slice(0, 1000) || null;

    const { rows } = await pool.query(
        `UPDATE ${TABLE[type]}
            SET status = $1,
                admin_note = COALESCE($2, admin_note)
          WHERE id = $3
          RETURNING id, status`,
        [newStatus, note, id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Booking not found" });
    res.json({ ...rows[0], type });
};

// PATCH /api/admin/bookings/:type/:id/cancel   body: { note }
export const cancelBooking = (req, res) => mutate(req, res, "cancelled");

// PATCH /api/admin/bookings/:type/:id/refund   body: { note }   (hotel only)
export const refundBooking = (req, res) => mutate(req, res, "refunded");
