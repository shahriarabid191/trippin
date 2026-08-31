import pool from "../../config/db.js";
import { parseListParams, listEnvelope } from "../../utils/adminQuery.js";

// =====================================================================
// GET/PATCH /api/admin/emergency/*
//
// Bachao monitoring. One "trigger" writes one sos_alerts row per
// emergency contact (fan-out), so the admin view collapses those back
// into a single incident keyed by (sender_id, type, cntdown_end) and
// the admin lifecycle columns (admin_status / admin_note / ...) are
// written to every row of the incident at once.
//
// The feed is intentionally returned in full (sorted by urgency) and
// paginated in JS — an operator needs to see every open incident, and
// the table is small.
// =====================================================================

const INCIDENT_SELECT = `
    SELECT
        MIN(sa.id)                                            AS id,
        sa.sender_id,
        su.username                                           AS sender_username,
        su.email                                              AS sender_email,
        sa.type,
        sa.cntdown_end,
        MIN(sa.created_at)                                    AS created_at,
        (array_agg(sa.lat  ORDER BY sa.id DESC))[1]           AS lat,
        (array_agg(sa.long ORDER BY sa.id DESC))[1]           AS long,
        COUNT(*)::int                                         AS contacts_notified,
        COUNT(*) FILTER (WHERE sa.acked)::int                 AS contacts_acked,
        COALESCE(MAX(sa.admin_status), 'open')                AS status,
        MAX(sa.admin_note)                                    AS admin_note,
        MAX(sa.admin_ack_at)                                  AS admin_ack_at,
        MAX(sa.admin_resolved_at)                             AS admin_resolved_at,
        (SELECT username FROM users WHERE id = MAX(sa.admin_handled_by)) AS handled_by,
        COALESCE(
            json_agg(
                json_build_object('username', ru.username, 'acked', sa.acked)
                ORDER BY ru.username
            ) FILTER (WHERE ru.id IS NOT NULL),
            '[]'
        )                                                    AS contacts
    FROM sos_alerts sa
    JOIN users su      ON su.id = sa.sender_id
    LEFT JOIN users ru ON ru.id = sa.receiver_id
    GROUP BY sa.sender_id, su.username, su.email, sa.type, sa.cntdown_end
`;

// Attach the derived phase the UI colours by.
const decorate = (row) => {
    const isCountdown = row.type === "COUNTDOWN";
    const expiry = row.cntdown_end ? new Date(row.cntdown_end).getTime() : null;
    const expired = expiry !== null && expiry <= Date.now();

    let phase;
    if (row.status === "resolved") phase = "resolved";
    else if (isCountdown && !expired) phase = "counting_down";
    else phase = "triggered";

    return { ...row, phase, expired };
};

const URGENCY = { triggered: 0, counting_down: 1, resolved: 3 };
const rank = (r) => {
    if (r.phase === "triggered") return r.status === "acknowledged" ? 1.5 : 0;
    return URGENCY[r.phase] ?? 2;
};

// GET /api/admin/emergency/alerts?status=&view=active&page=&limit=
export const listAlerts = async (req, res) => {
    const { page, limit } = parseListParams(req.query, {});

    const { rows } = await pool.query(INCIDENT_SELECT);
    let incidents = rows.map(decorate);

    if (req.query.status && ["open", "acknowledged", "resolved"].includes(req.query.status)) {
        incidents = incidents.filter((r) => r.status === req.query.status);
    }
    if (req.query.view === "active") {
        incidents = incidents.filter((r) => r.status !== "resolved");
    }
    if (req.query.phase) {
        incidents = incidents.filter((r) => r.phase === req.query.phase);
    }

    incidents.sort((a, b) => {
        const d = rank(a) - rank(b);
        if (d !== 0) return d;
        // Within a phase: soonest countdown / most recent trigger first.
        if (a.phase === "counting_down") {
            return new Date(a.cntdown_end) - new Date(b.cntdown_end);
        }
        return new Date(b.created_at) - new Date(a.created_at);
    });

    const total = incidents.length;
    const paged = incidents.slice((page - 1) * limit, (page - 1) * limit + limit);

    res.json(listEnvelope(paged, total, { page, limit }));
};

// GET /api/admin/emergency/summary  — sidebar badge + top-of-dashboard widget
export const alertSummary = async (req, res) => {
    const { rows } = await pool.query(INCIDENT_SELECT);
    const incidents = rows.map(decorate);

    res.json({
        open: incidents.filter((r) => r.status === "open").length,
        acknowledged: incidents.filter((r) => r.status === "acknowledged").length,
        countingDown: incidents.filter((r) => r.phase === "counting_down").length,
        triggeredUnresolved: incidents.filter(
            (r) => r.phase === "triggered" && r.status !== "resolved"
        ).length,
        mostUrgent: incidents.sort((a, b) => rank(a) - rank(b)).slice(0, 5),
    });
};

// Resolve the incident an alert id belongs to, then run `mutate` on
// every row of that incident.
const updateIncident = async (alertId, res, sets, params) => {
    const found = await pool.query(
        "SELECT sender_id, type, cntdown_end FROM sos_alerts WHERE id = $1",
        [alertId]
    );
    if (found.rows.length === 0) {
        return res.status(404).json({ message: "Alert not found" });
    }
    const { sender_id, type, cntdown_end } = found.rows[0];

    await pool.query(
        `UPDATE sos_alerts
            SET ${sets}
          WHERE sender_id = $1
            AND type = $2
            AND cntdown_end IS NOT DISTINCT FROM $3`,
        [sender_id, type, cntdown_end, ...params]
    );

    const refreshed = await pool.query(
        `${INCIDENT_SELECT} HAVING sa.sender_id = $1 AND sa.type = $2
           AND sa.cntdown_end IS NOT DISTINCT FROM $3`,
        [sender_id, type, cntdown_end]
    );
    res.json(decorate(refreshed.rows[0]));
};

// PATCH /api/admin/emergency/alerts/:id/acknowledge
export const acknowledgeAlert = async (req, res) => {
    await updateIncident(
        req.params.id,
        res,
        `admin_status = 'acknowledged',
         admin_ack_at = COALESCE(admin_ack_at, now()),
         admin_handled_by = $4`,
        [req.user.id]
    );
};

// PATCH /api/admin/emergency/alerts/:id/resolve   body: { note }
export const resolveAlert = async (req, res) => {
    const note = (req.body?.note || "").toString().trim().slice(0, 1000) || null;
    await updateIncident(
        req.params.id,
        res,
        `admin_status = 'resolved',
         admin_ack_at = COALESCE(admin_ack_at, now()),
         admin_resolved_at = now(),
         admin_note = $4,
         admin_handled_by = $5`,
        [note, req.user.id]
    );
};

// PATCH /api/admin/emergency/alerts/:id/reopen
export const reopenAlert = async (req, res) => {
    await updateIncident(
        req.params.id,
        res,
        `admin_status = 'open',
         admin_resolved_at = NULL,
         admin_handled_by = $4`,
        [req.user.id]
    );
};
