import pool from "../../config/db.js";
import { parseListParams, listEnvelope } from "../../utils/adminQuery.js";

// =====================================================================
// GET /api/admin/ai/*
//
// AI oversight is limited to what this schema records: the itinerary
// questionnaire. `itineraries` keeps one upsert row per user (their
// current draft) with the questionnaire `answers` and the generated
// `content`, plus created_at / updated_at.
//
// Chatbot sessions, translation requests and feature kill-switches have
// no table on this schema and are intentionally not surfaced. See
// ADMIN_PANEL_NOTES.md for the extension points.
// =====================================================================

// GET /api/admin/ai/itineraries?search=&page=&limit=
export const listItineraryRequests = async (req, res) => {
    const { limit, offset, search, sort, order, page } = parseListParams(req.query, {
        allowedSort: ["created_at", "updated_at"],
        defaultSort: "updated_at",
    });

    const where = `WHERE ($1 = '' OR u.email ILIKE '%'||$1||'%' OR i.answers::text ILIKE '%'||$1||'%')`;

    const rows = await pool.query(
        `SELECT i.id, i.answers, i.created_at, i.updated_at,
                (i.updated_at > i.created_at) AS regenerated,
                jsonb_array_length(COALESCE(i.content->'days', '[]'::jsonb)) AS day_count,
                u.id AS user_id, u.email AS user_email
           FROM itineraries i
           JOIN users u ON u.id = i.user_id
           ${where}
          ORDER BY ${sort} ${order}
          LIMIT $2 OFFSET $3`,
        [search, limit, offset]
    );
    const total = await pool.query(
        `SELECT COUNT(*)::int AS n FROM itineraries i JOIN users u ON u.id = i.user_id ${where}`,
        [search]
    );

    res.json(listEnvelope(rows.rows, total.rows[0].n, { page, limit }));
};

// GET /api/admin/ai/summary
export const aiSummary = async (req, res) => {
    const { rows } = await pool.query(
        `SELECT
            COUNT(*)::int                                                     AS total_drafts,
            COUNT(*) FILTER (WHERE updated_at > created_at)::int              AS regenerated,
            COUNT(*) FILTER (WHERE updated_at >= now() - interval '7 days')::int AS last_7_days
         FROM itineraries`
    );
    res.json(rows[0]);
};
