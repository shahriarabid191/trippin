import pool from "../../config/db.js";
import { parseListParams, listEnvelope } from "../../utils/adminQuery.js";

// =====================================================================
// /api/admin/users
//
// PRIVACY BOUNDARIES (enforced here, not just in the UI):
//   - Vault: only file COUNT + document type / size / upload date.
//     display_name, stored_name and file_path are never selected.
//   - Journals: only entries the user made public (is_public = true) or
//     that a moderator unpublished. Private entries are never selected.
//   - Buddy chat: no endpoint. Not surfaced anywhere in this module.
// =====================================================================

const ROLES = ["user", "moderator", "admin"];

const ACTIVITY = `
    (SELECT COUNT(*) FROM bookings b        WHERE b.user_email = u.email)::int
  + (SELECT COUNT(*) FROM car_bookings cb   WHERE cb.user_id   = u.id)::int
  + (SELECT COUNT(*) FROM guide_bookings gb WHERE gb.user_id   = u.id)::int   AS booking_count,
    (SELECT COUNT(*) FROM reviews r         WHERE r.user_email = u.email)::int
  + (SELECT COUNT(*) FROM guide_reviews gr  WHERE gr.user_id   = u.id)::int
  + (SELECT COUNT(*) FROM car_reviews cr    WHERE cr.user_id   = u.id)::int   AS review_count,
    (SELECT COUNT(*) FROM gallery_photos p  WHERE p.user_id    = u.id)::int   AS photo_count,
    (SELECT COUNT(*) FROM files f           WHERE f.user_id    = u.id)::int   AS vault_doc_count,
    (SELECT COUNT(*) FROM journals j        WHERE j.user_id    = u.id AND j.is_public = true)::int AS public_journal_count
`;

// GET /api/admin/users?search=&role=&status=&page=&limit=
export const listUsers = async (req, res) => {
    const { limit, offset, search, sort, order, page } = parseListParams(req.query, {
        allowedSort: ["email", "username", "role", "created_at"],
        defaultSort: "created_at",
    });
    const role = ROLES.includes(req.query.role) ? req.query.role : "";
    const status = ["active", "suspended"].includes(req.query.status) ? req.query.status : "";

    const where = `WHERE ($1 = '' OR u.email ILIKE '%'||$1||'%' OR u.username ILIKE '%'||$1||'%')
                     AND ($2 = '' OR u.role = $2)
                     AND ($3 = '' OR ($3 = 'suspended' AND u.suspended_at IS NOT NULL)
                                  OR ($3 = 'active'    AND u.suspended_at IS NULL))`;

    const rows = await pool.query(
        `SELECT u.id, u.email, u.username, u.role, u.created_at,
                u.suspended_at, u.suspend_reason,
                ${ACTIVITY}
           FROM users u
           ${where}
          ORDER BY ${sort} ${order}
          LIMIT $4 OFFSET $5`,
        [search, role, status, limit, offset]
    );
    const total = await pool.query(`SELECT COUNT(*)::int AS n FROM users u ${where}`, [search, role, status]);

    res.json(listEnvelope(rows.rows, total.rows[0].n, { page, limit }));
};

// GET /api/admin/users/:id
export const getUser = async (req, res) => {
    const { id } = req.params;

    const profile = await pool.query(
        `SELECT u.id, u.email, u.username, u.role, u.created_at,
                u.suspended_at, u.suspend_reason, ${ACTIVITY}
           FROM users u WHERE u.id = $1`,
        [id]
    );
    if (profile.rows.length === 0) return res.status(404).json({ message: "User not found" });
    const user = profile.rows[0];

    const [bookings, reviews, photos, journals, vault] = await Promise.all([
        pool.query(
            `SELECT 'hotel' AS type, b.id, b.status, b.created_at, h.name AS item_name,
                    b.check_in::text AS start_date, b.check_out::text AS end_date, b.total_amount AS amount
               FROM bookings b LEFT JOIN hotels h ON h.id = b.hotel_id
              WHERE b.user_email = $1
             UNION ALL
             SELECT 'car', cb.id, cb.status, cb.created_at, c.name,
                    cb.start_date::text, cb.end_date::text, NULL::numeric
               FROM car_bookings cb LEFT JOIN cars c ON c.id = cb.car_id
              WHERE cb.user_id = $2
             UNION ALL
             SELECT 'guide', gb.id, gb.status, gb.created_at, g.name,
                    gb.booking_date::text, gb.booking_date::text, NULL::numeric
               FROM guide_bookings gb LEFT JOIN guides g ON g.id = gb.guide_id
              WHERE gb.user_id = $2
             ORDER BY created_at DESC`,
            [user.email, id]
        ),
        pool.query(
            `SELECT 'hotel' AS type, r.id, r.rating, r.comment, r.created_at, r.flagged_at, h.name AS item_name
               FROM reviews r LEFT JOIN hotels h ON h.id = r.hotel_id
              WHERE r.user_email = $1
             UNION ALL
             SELECT 'guide', gr.id, gr.rating, gr.comment, gr.created_at, gr.flagged_at, g.name
               FROM guide_reviews gr LEFT JOIN guides g ON g.id = gr.guide_id
              WHERE gr.user_id = $2
             UNION ALL
             SELECT 'car', cr.id, cr.rating, cr.comment, cr.created_at, cr.flagged_at, c.name
               FROM car_reviews cr LEFT JOIN cars c ON c.id = cr.car_id
              WHERE cr.user_id = $2
             ORDER BY created_at DESC`,
            [user.email, id]
        ),
        pool.query(
            `SELECT id, caption, is_public, created_at, flagged_at, flag_reason, unpublished_at
               FROM gallery_photos WHERE user_id = $1 ORDER BY created_at DESC`,
            [id]
        ),
        // PUBLIC journals only — private entries are never returned.
        pool.query(
            `SELECT id, title, is_public, unpublished_at, created_at
               FROM journals
              WHERE user_id = $1 AND (is_public = true OR unpublished_at IS NOT NULL)
              ORDER BY created_at DESC`,
            [id]
        ),
        // Vault: metadata only. No name, no path.
        pool.query(
            `SELECT id, mime_type AS document_type, file_size, created_at AS uploaded_at
               FROM files WHERE user_id = $1 ORDER BY created_at DESC`,
            [id]
        ),
    ]);

    res.json({
        user,
        bookings: bookings.rows,
        reviews: reviews.rows,
        photos: photos.rows,
        publicJournals: journals.rows,
        vaultDocuments: vault.rows, // metadata only, by design
    });
};

// PATCH /api/admin/users/:id/suspend   body: { reason }
export const suspendUser = async (req, res) => {
    if (Number(req.params.id) === req.user.id) {
        return res.status(400).json({ message: "You cannot suspend your own account" });
    }
    const reason = (req.body?.reason || "").toString().trim().slice(0, 500) || null;
    const { rows } = await pool.query(
        `UPDATE users SET suspended_at = now(), suspend_reason = $1
          WHERE id = $2 RETURNING id, email, suspended_at, suspend_reason`,
        [reason, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
};

// PATCH /api/admin/users/:id/unsuspend
export const unsuspendUser = async (req, res) => {
    const { rows } = await pool.query(
        `UPDATE users SET suspended_at = NULL, suspend_reason = NULL
          WHERE id = $1 RETURNING id, email, suspended_at`,
        [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
};

// PATCH /api/admin/users/:id/role   body: { role }   (admin only — route guarded)
export const setUserRole = async (req, res) => {
    const role = req.body?.role;
    if (!ROLES.includes(role)) {
        return res.status(400).json({ message: `role must be one of ${ROLES.join(", ")}` });
    }
    if (Number(req.params.id) === req.user.id) {
        return res.status(400).json({ message: "You cannot change your own role" });
    }
    const { rows } = await pool.query(
        "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, username, role",
        [role, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
};
