import fs from "fs";
import pool from "../../config/db.js";
import { parseListParams, listEnvelope } from "../../utils/adminQuery.js";

// =====================================================================
// /api/admin/moderation/*   (admin + moderator)
//
// Gallery photos, photo comments, marketplace reviews and PUBLIC
// journal entries. Removals are hard deletes to match the owner-facing
// behaviour elsewhere in the app; flags are metadata written to the
// columns added in migration 001.
//
// Journals: every query is constrained to
//   is_public = true OR unpublished_at IS NOT NULL
// so a private journal can never be listed, read, unpublished further,
// or deleted from here.
// =====================================================================

const fileURL = (req, storedName) =>
    `${req.protocol}://${req.get("host")}/uploads/${storedName}`;

const boolFilter = (raw) => (raw === "true" ? true : raw === "false" ? false : null);

const REVIEW_TABLE = { hotel: "reviews", guide: "guide_reviews", car: "car_reviews" };

/* --------------------------- GALLERY PHOTOS --------------------------- */

export const listPhotos = async (req, res) => {
    const { limit, offset, search, page } = parseListParams(req.query, {});
    const flagged = boolFilter(req.query.flagged);

    const where = `WHERE (p.is_public = true OR p.unpublished_at IS NOT NULL OR p.flagged_at IS NOT NULL)
                     AND ($1 = '' OR p.caption ILIKE '%'||$1||'%' OR u.email ILIKE '%'||$1||'%')
                     AND ($2::boolean IS NULL OR (p.flagged_at IS NOT NULL) = $2::boolean)`;

    const rows = await pool.query(
        `SELECT p.id, p.caption, p.stored_name, p.is_public, p.created_at,
                p.flagged_at, p.flag_reason, p.unpublished_at,
                u.id AS uploader_id, u.email AS uploader_email,
                (SELECT COUNT(*) FROM gallery_likes l    WHERE l.photo_id = p.id)::int AS like_count,
                (SELECT COUNT(*) FROM gallery_comments c WHERE c.photo_id = p.id)::int AS comment_count
           FROM gallery_photos p
           JOIN users u ON u.id = p.user_id
           ${where}
          ORDER BY (p.flagged_at IS NOT NULL) DESC, p.created_at DESC
          LIMIT $3 OFFSET $4`,
        [search, flagged, limit, offset]
    );
    const total = await pool.query(
        `SELECT COUNT(*)::int AS n FROM gallery_photos p JOIN users u ON u.id = p.user_id ${where}`,
        [search, flagged]
    );

    res.json(listEnvelope(
        rows.rows.map((r) => ({ ...r, url: fileURL(req, r.stored_name) })),
        total.rows[0].n,
        { page, limit }
    ));
};

export const flagPhoto = async (req, res) => {
    const reason = (req.body?.reason || "").toString().trim().slice(0, 500) || null;
    const { rows } = await pool.query(
        `UPDATE gallery_photos
            SET flagged_at = now(), flag_reason = $1, moderated_by = $2
          WHERE id = $3 RETURNING id`,
        [reason, req.user.id, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Photo not found" });
    res.json({ id: rows[0].id, flagged: true });
};

export const unflagPhoto = async (req, res) => {
    const { rows } = await pool.query(
        `UPDATE gallery_photos SET flagged_at = NULL, flag_reason = NULL WHERE id = $1 RETURNING id`,
        [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Photo not found" });
    res.json({ id: rows[0].id, flagged: false });
};

export const unpublishPhoto = async (req, res) => {
    const reason = (req.body?.reason || "").toString().trim().slice(0, 500) || null;
    const { rows } = await pool.query(
        `UPDATE gallery_photos
            SET is_public = false, unpublished_at = now(),
                flag_reason = COALESCE($1, flag_reason), moderated_by = $2
          WHERE id = $3 RETURNING id, is_public`,
        [reason, req.user.id, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Photo not found" });
    res.json(rows[0]);
};

export const republishPhoto = async (req, res) => {
    const { rows } = await pool.query(
        `UPDATE gallery_photos SET is_public = true, unpublished_at = NULL WHERE id = $1 RETURNING id, is_public`,
        [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Photo not found" });
    res.json(rows[0]);
};

export const deletePhoto = async (req, res) => {
    const found = await pool.query("SELECT file_path FROM gallery_photos WHERE id = $1", [req.params.id]);
    if (found.rows.length === 0) return res.status(404).json({ message: "Photo not found" });

    const { file_path } = found.rows[0];
    if (file_path && fs.existsSync(file_path)) {
        try { fs.unlinkSync(file_path); } catch { /* orphan file — ignore */ }
    }
    await pool.query("DELETE FROM gallery_photos WHERE id = $1", [req.params.id]);
    res.json({ message: "Photo deleted", id: Number(req.params.id) });
};

/* ------------------------------ COMMENTS ------------------------------ */

export const listComments = async (req, res) => {
    const { limit, offset, search, page } = parseListParams(req.query, {});
    const photoId = parseInt(req.query.photoId, 10);
    const photoFilter = Number.isFinite(photoId) ? photoId : null;

    const where = `WHERE ($1 = '' OR c.body ILIKE '%'||$1||'%' OR u.email ILIKE '%'||$1||'%')
                     AND ($2::int IS NULL OR c.photo_id = $2::int)`;

    const rows = await pool.query(
        `SELECT c.id, c.body, c.created_at, c.photo_id, c.parent_id,
                u.id AS author_id, u.email AS author_email,
                p.caption AS photo_caption,
                (SELECT COUNT(*) FROM gallery_comment_likes cl WHERE cl.comment_id = c.id)::int AS like_count
           FROM gallery_comments c
           JOIN users u          ON u.id = c.user_id
           LEFT JOIN gallery_photos p ON p.id = c.photo_id
           ${where}
          ORDER BY c.created_at DESC
          LIMIT $3 OFFSET $4`,
        [search, photoFilter, limit, offset]
    );
    const total = await pool.query(
        `SELECT COUNT(*)::int AS n FROM gallery_comments c JOIN users u ON u.id = c.user_id ${where}`,
        [search, photoFilter]
    );

    res.json(listEnvelope(rows.rows, total.rows[0].n, { page, limit }));
};

export const deleteComment = async (req, res) => {
    const { rows } = await pool.query(
        "DELETE FROM gallery_comments WHERE id = $1 RETURNING id",
        [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Comment not found" });
    res.json({ message: "Comment deleted", id: rows[0].id });
};

/* ------------------------------ REVIEWS ------------------------------ */

const REVIEW_LEDGER = `
    SELECT 'hotel'::text AS type, r.id, r.rating, r.comment, r.created_at,
           r.flagged_at, r.flag_reason, r.user_email, NULL::int AS user_id, h.name AS item_name
      FROM reviews r LEFT JOIN hotels h ON h.id = r.hotel_id
    UNION ALL
    SELECT 'guide'::text, gr.id, gr.rating, gr.comment, gr.created_at,
           gr.flagged_at, gr.flag_reason, u.email, gr.user_id, g.name
      FROM guide_reviews gr LEFT JOIN guides g ON g.id = gr.guide_id LEFT JOIN users u ON u.id = gr.user_id
    UNION ALL
    SELECT 'car'::text, cr.id, cr.rating, cr.comment, cr.created_at,
           cr.flagged_at, cr.flag_reason, u.email, cr.user_id, c.name
      FROM car_reviews cr LEFT JOIN cars c ON c.id = cr.car_id LEFT JOIN users u ON u.id = cr.user_id
`;

export const listReviews = async (req, res) => {
    const { limit, offset, search, page } = parseListParams(req.query, {});
    const type = ["hotel", "guide", "car"].includes(req.query.type) ? req.query.type : "all";
    const flagged = boolFilter(req.query.flagged);

    const where = `WHERE ($1 = 'all' OR type = $1)
                     AND ($2 = '' OR comment ILIKE '%'||$2||'%' OR user_email ILIKE '%'||$2||'%' OR item_name ILIKE '%'||$2||'%')
                     AND ($3::boolean IS NULL OR (flagged_at IS NOT NULL) = $3::boolean)`;

    const rows = await pool.query(
        `WITH r AS (${REVIEW_LEDGER})
         SELECT * FROM r ${where}
         ORDER BY (flagged_at IS NOT NULL) DESC, created_at DESC
         LIMIT $4 OFFSET $5`,
        [type, search, flagged, limit, offset]
    );
    const total = await pool.query(
        `WITH r AS (${REVIEW_LEDGER}) SELECT COUNT(*)::int AS n FROM r ${where}`,
        [type, search, flagged]
    );

    res.json(listEnvelope(rows.rows, total.rows[0].n, { page, limit }));
};

export const flagReview = async (req, res) => {
    const table = REVIEW_TABLE[req.params.type];
    if (!table) return res.status(400).json({ message: "Unknown review type" });
    const reason = (req.body?.reason || "").toString().trim().slice(0, 500) || null;
    const { rows } = await pool.query(
        `UPDATE ${table} SET flagged_at = now(), flag_reason = $1, moderated_by = $2 WHERE id = $3 RETURNING id`,
        [reason, req.user.id, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Review not found" });
    res.json({ id: rows[0].id, type: req.params.type, flagged: true });
};

export const unflagReview = async (req, res) => {
    const table = REVIEW_TABLE[req.params.type];
    if (!table) return res.status(400).json({ message: "Unknown review type" });
    const { rows } = await pool.query(
        `UPDATE ${table} SET flagged_at = NULL, flag_reason = NULL WHERE id = $1 RETURNING id`,
        [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Review not found" });
    res.json({ id: rows[0].id, type: req.params.type, flagged: false });
};

export const deleteReview = async (req, res) => {
    const table = REVIEW_TABLE[req.params.type];
    if (!table) return res.status(400).json({ message: "Unknown review type" });
    const { rows } = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING id`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review removed", id: rows[0].id, type: req.params.type });
};

/* --------------------------- PUBLIC JOURNALS --------------------------- */

const PUBLIC_ONLY = "(j.is_public = true OR j.unpublished_at IS NOT NULL)";

export const listJournals = async (req, res) => {
    const { limit, offset, search, page } = parseListParams(req.query, {});

    const where = `WHERE ${PUBLIC_ONLY}
                     AND ($1 = '' OR j.title ILIKE '%'||$1||'%' OR j.content ILIKE '%'||$1||'%' OR u.email ILIKE '%'||$1||'%')`;

    const rows = await pool.query(
        `SELECT j.id, j.title, j.content, j.is_public, j.unpublished_at, j.moderation_note, j.created_at,
                u.id AS author_id, u.email AS author_email
           FROM journals j
           JOIN users u ON u.id = j.user_id
           ${where}
          ORDER BY j.created_at DESC
          LIMIT $2 OFFSET $3`,
        [search, limit, offset]
    );
    const total = await pool.query(
        `SELECT COUNT(*)::int AS n FROM journals j JOIN users u ON u.id = j.user_id ${where}`,
        [search]
    );

    res.json(listEnvelope(rows.rows, total.rows[0].n, { page, limit }));
};

export const unpublishJournal = async (req, res) => {
    const note = (req.body?.note || "").toString().trim().slice(0, 500) || null;
    // Only a currently-public entry can be unpublished from here.
    const { rows } = await pool.query(
        `UPDATE journals
            SET is_public = false, unpublished_at = now(), moderation_note = $1, moderated_by = $2
          WHERE id = $3 AND is_public = true
          RETURNING id, is_public`,
        [note, req.user.id, req.params.id]
    );
    if (rows.length === 0) {
        return res.status(404).json({ message: "Public journal entry not found" });
    }
    res.json(rows[0]);
};

export const republishJournal = async (req, res) => {
    const { rows } = await pool.query(
        `UPDATE journals SET is_public = true, unpublished_at = NULL
          WHERE id = $1 AND unpublished_at IS NOT NULL
          RETURNING id, is_public`,
        [req.params.id]
    );
    if (rows.length === 0) {
        return res.status(404).json({ message: "Unpublished journal entry not found" });
    }
    res.json(rows[0]);
};

export const deleteJournal = async (req, res) => {
    // Guard: never delete a purely-private journal from the admin panel.
    const { rows } = await pool.query(
        `DELETE FROM journals j
          WHERE j.id = $1 AND ${PUBLIC_ONLY}
          RETURNING j.id`,
        [req.params.id]
    );
    if (rows.length === 0) {
        return res.status(404).json({ message: "Public journal entry not found" });
    }
    res.json({ message: "Journal entry deleted", id: rows[0].id });
};
