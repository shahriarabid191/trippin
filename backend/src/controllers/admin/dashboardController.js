import pool from "../../config/db.js";

// =====================================================================
// GET /api/admin/dashboard/*
//
// KPI cards + time-series for the Overview screen. Everything here is
// read-only and derived from tables that already exist. Metrics that
// have no data source on this schema (chatbot usage, real payment
// volume, buddy reports) are deliberately not surfaced.
// =====================================================================

const clampDays = (raw) => {
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n)) return 30;
    return Math.min(180, Math.max(7, n));
};

// GET /api/admin/dashboard/stats
export const getStats = async (req, res) => {

    const [
        users,
        activeTrips,
        bookingsWeek,
        revenue,
        emergencies,
        flagged,
    ] = await Promise.all([
        pool.query("SELECT COUNT(*)::int AS n FROM users"),

        // "Active trip" = a hotel stay that has not checked out yet and
        // was not cancelled. It is the only forward-looking booking
        // signal on this schema.
        pool.query(
            `SELECT COUNT(*)::int AS n
               FROM bookings
              WHERE status <> 'cancelled'
                AND check_out >= CURRENT_DATE`
        ),

        pool.query(
            `SELECT
               (SELECT COUNT(*) FROM bookings       WHERE created_at >= now() - interval '7 days')
             + (SELECT COUNT(*) FROM car_bookings   WHERE created_at >= now() - interval '7 days')
             + (SELECT COUNT(*) FROM guide_bookings WHERE created_at >= now() - interval '7 days')
               AS n`
        ),

        // Simulated revenue — hotel bookings only. car_bookings /
        // guide_bookings carry no amount column on this schema.
        pool.query(
            `SELECT COALESCE(SUM(total_amount), 0)::numeric AS n
               FROM bookings
              WHERE status NOT IN ('cancelled', 'refunded')`
        ),

        // Open emergency incidents (one trigger = many fan-out rows).
        pool.query(
            `SELECT COUNT(*)::int AS n FROM (
               SELECT 1
                 FROM sos_alerts
                WHERE admin_resolved_at IS NULL
                GROUP BY sender_id, type, cntdown_end
             ) t`
        ),

        pool.query(
            `SELECT
               (SELECT COUNT(*) FROM gallery_photos WHERE flagged_at IS NOT NULL)
             + (SELECT COUNT(*) FROM reviews        WHERE flagged_at IS NOT NULL)
             + (SELECT COUNT(*) FROM guide_reviews  WHERE flagged_at IS NOT NULL)
             + (SELECT COUNT(*) FROM car_reviews    WHERE flagged_at IS NOT NULL)
               AS n`
        ),
    ]);

    res.json({
        totalUsers: users.rows[0].n,
        activeTrips: activeTrips.rows[0].n,
        bookingsThisWeek: Number(bookingsWeek.rows[0].n),
        simulatedRevenue: Number(revenue.rows[0].n),
        openEmergencies: emergencies.rows[0].n,
        flaggedContent: Number(flagged.rows[0].n),
    });
};

// GET /api/admin/dashboard/charts/signups?days=30
export const getSignupsSeries = async (req, res) => {
    const days = clampDays(req.query.days);

    const { rows } = await pool.query(
        `SELECT d::date AS date, COALESCE(c.n, 0)::int AS count
           FROM generate_series(
                  CURRENT_DATE - make_interval(days => $1::int - 1),
                  CURRENT_DATE,
                  '1 day'
                ) d
           LEFT JOIN (
                  SELECT created_at::date AS dt, COUNT(*) AS n
                    FROM users
                   WHERE created_at >= CURRENT_DATE - make_interval(days => $1::int - 1)
                   GROUP BY 1
                ) c ON c.dt = d::date
          ORDER BY d`,
        [days]
    );

    res.json(rows);
};

// GET /api/admin/dashboard/charts/bookings?days=30
export const getBookingsSeries = async (req, res) => {
    const days = clampDays(req.query.days);

    const { rows } = await pool.query(
        `SELECT d::date AS date,
                COALESCE(h.n, 0)::int  AS hotel,
                COALESCE(cr.n, 0)::int AS car,
                COALESCE(g.n, 0)::int  AS guide
           FROM generate_series(
                  CURRENT_DATE - make_interval(days => $1::int - 1),
                  CURRENT_DATE, '1 day'
                ) d
           LEFT JOIN (SELECT created_at::date dt, COUNT(*) n FROM bookings
                       WHERE created_at >= CURRENT_DATE - make_interval(days => $1::int - 1)
                       GROUP BY 1) h  ON h.dt  = d::date
           LEFT JOIN (SELECT created_at::date dt, COUNT(*) n FROM car_bookings
                       WHERE created_at >= CURRENT_DATE - make_interval(days => $1::int - 1)
                       GROUP BY 1) cr ON cr.dt = d::date
           LEFT JOIN (SELECT created_at::date dt, COUNT(*) n FROM guide_bookings
                       WHERE created_at >= CURRENT_DATE - make_interval(days => $1::int - 1)
                       GROUP BY 1) g  ON g.dt  = d::date
          ORDER BY d`,
        [days]
    );

    res.json(rows);
};

// GET /api/admin/dashboard/charts/itineraries?days=30
// The itineraries table keeps one upsert row per user, so this tracks
// "draft generated / regenerated" activity by updated_at. It is the
// closest available proxy for AI-utility usage over time.
export const getItinerarySeries = async (req, res) => {
    const days = clampDays(req.query.days);

    const { rows } = await pool.query(
        `SELECT d::date AS date, COALESCE(c.n, 0)::int AS count
           FROM generate_series(
                  CURRENT_DATE - make_interval(days => $1::int - 1),
                  CURRENT_DATE, '1 day'
                ) d
           LEFT JOIN (
                  SELECT updated_at::date AS dt, COUNT(*) AS n
                    FROM itineraries
                   WHERE updated_at >= CURRENT_DATE - make_interval(days => $1::int - 1)
                   GROUP BY 1
                ) c ON c.dt = d::date
          ORDER BY d`,
        [days]
    );

    res.json(rows);
};
