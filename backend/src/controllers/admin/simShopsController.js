import fs from "fs";
import pool from "../../config/db.js";
import { parseListParams, listEnvelope } from "../../utils/adminQuery.js";
import {
    cleanOperators,
    cleanServices,
    isValidDistrict,
    SHOP_STATUSES
} from "../../data/simShopReference.js";

// =====================================================================
// /api/admin/sim-shops   (admin tier)
//
// The curated SIM / eSIM shop directory + the review queue for
// user-submitted shops. Public reads (GET /api/sim-shops) only return
// status = 'approved' AND is_active = true.
// =====================================================================

const docUrl = (req, storedName) =>
    storedName ? `${req.protocol}://${req.get("host")}/uploads/${storedName}` : null;

const shape = (req, r) => ({
    id: r.id,
    name: r.name,
    district: r.district,
    area: r.area,
    address: r.address,
    landmark: r.landmark,
    phone: r.phone,
    altPhone: r.alt_phone,
    email: r.email,
    hours: r.hours,
    established: r.established,
    operators: r.operators || [],
    services: r.services || [],
    esimSupport: r.esim_support,
    mapLink: r.map_link,
    status: r.status,
    isActive: r.is_active,
    rejectionReason: r.rejection_reason,
    source: r.source,
    submittedByEmail: r.submitted_by_email || null,
    reviewedByName: r.reviewed_by_name || null,
    reviewedAt: r.reviewed_at,
    documentUrl: docUrl(req, r.doc_stored_name),
    createdAt: r.created_at,
    updatedAt: r.updated_at
});

const SELECT = `
    SELECT s.*,
           u.email    AS submitted_by_email,
           rv.username AS reviewed_by_name
      FROM sim_shops s
      LEFT JOIN users u  ON u.id  = s.submitted_by
      LEFT JOIN users rv ON rv.id = s.reviewed_by
`;

// GET /api/admin/sim-shops?status=&district=&active=&search=&page=&limit=&sort=&order=
export const listShops = async (req, res) => {
    const { limit, offset, search, sort, order, page } = parseListParams(req.query, {
        allowedSort: ["name", "district", "status", "created_at", "reviewed_at"],
        defaultSort: "created_at"
    });
    const status = SHOP_STATUSES.includes(req.query.status) ? req.query.status : "";
    const district = typeof req.query.district === "string" ? req.query.district : "";
    const active = req.query.active === "true" ? true : req.query.active === "false" ? false : null;

    const where = `
        WHERE ($1 = '' OR s.name ILIKE '%'||$1||'%' OR s.area ILIKE '%'||$1||'%'
               OR s.address ILIKE '%'||$1||'%' OR u.email ILIKE '%'||$1||'%')
          AND ($2 = '' OR s.status = $2)
          AND ($3 = '' OR s.district = $3)
          AND ($4::boolean IS NULL OR s.is_active = $4::boolean)
    `;

    const rows = await pool.query(
        `${SELECT} ${where}
         ORDER BY (s.status = 'pending') DESC, ${sort} ${order}
         LIMIT $5 OFFSET $6`,
        [search, status, district, active, limit, offset]
    );
    const total = await pool.query(
        `SELECT COUNT(*)::int AS n
           FROM sim_shops s LEFT JOIN users u ON u.id = s.submitted_by ${where}`,
        [search, status, district, active]
    );

    res.json(listEnvelope(rows.rows.map((r) => shape(req, r)), total.rows[0].n, { page, limit }));
};

// GET /api/admin/sim-shops/summary
export const shopsSummary = async (req, res) => {
    const { rows } = await pool.query(
        `SELECT
            COUNT(*)::int                                       AS total,
            COUNT(*) FILTER (WHERE status = 'pending')::int     AS pending,
            COUNT(*) FILTER (WHERE status = 'approved')::int    AS approved,
            COUNT(*) FILTER (WHERE status = 'rejected')::int    AS rejected,
            COUNT(*) FILTER (WHERE is_active = false)::int      AS inactive
         FROM sim_shops`
    );
    res.json(rows[0]);
};

// Normalise an incoming body. Empty strings collapse to null: for the
// required columns the UPDATE COALESCEs a null back to the existing
// value, and for the optional columns a null clears the field.
const parseBody = (b) => {
    const s = (v, max) => {
        if (v == null) return null;
        const t = String(v).trim();
        return t ? (max ? t.slice(0, max) : t) : null;
    };
    return {
        name: s(b.name, 150),
        district: s(b.district),
        area: s(b.area, 120),
        address: s(b.address),
        landmark: s(b.landmark),
        phone: s(b.phone, 40),
        alt_phone: s(b.altPhone, 40),
        email: s(b.email, 150),
        hours: s(b.hours, 200),
        established: s(b.established, 10),
        operators: b.operators != null ? cleanOperators(b.operators) : null,
        services: b.services != null ? cleanServices(b.services) : null,
        esim_support: typeof b.esimSupport === "boolean" ? b.esimSupport : null,
        map_link: s(b.mapLink)
    };
};

// POST /api/admin/sim-shops   (admin creates a shop directly — auto-approved)
export const createShop = async (req, res) => {
    const b = parseBody(req.body);

    if (!b.name || !b.district || !b.area || !b.address || !b.phone || !b.hours) {
        return res.status(400).json({ message: "name, district, area, address, phone and hours are required" });
    }
    if (!isValidDistrict(b.district)) {
        return res.status(400).json({ message: "Unknown district" });
    }

    const { rows } = await pool.query(
        `INSERT INTO sim_shops (
            name, district, area, address, landmark, phone, alt_phone, email,
            hours, established, operators, services, esim_support, map_link,
            status, source, is_active, reviewed_by, reviewed_at
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
                 COALESCE($11, '{}'::text[]), COALESCE($12, '{}'::text[]),
                 COALESCE($13, false), $14,
                 'approved', 'admin', true, $15, now())
         RETURNING *`,
        [
            b.name, b.district, b.area, b.address, b.landmark, b.phone, b.alt_phone, b.email,
            b.hours, b.established, b.operators, b.services, b.esim_support, b.map_link,
            req.user.id
        ]
    );
    res.status(201).json(shape(req, rows[0]));
};

// PUT /api/admin/sim-shops/:id   (edit any field; omitted fields unchanged)
export const updateShop = async (req, res) => {
    const b = parseBody(req.body);

    if (b.district && !isValidDistrict(b.district)) {
        return res.status(400).json({ message: "Unknown district" });
    }

    const { rows } = await pool.query(
        `UPDATE sim_shops SET
            name         = COALESCE($1, name),
            district     = COALESCE($2, district),
            area         = COALESCE($3, area),
            address      = COALESCE($4, address),
            landmark     = $5,
            phone        = COALESCE($6, phone),
            alt_phone    = $7,
            email        = $8,
            hours        = COALESCE($9, hours),
            established  = $10,
            operators    = COALESCE($11::text[], operators),
            services     = COALESCE($12::text[], services),
            esim_support = COALESCE($13, esim_support),
            map_link     = $14,
            updated_at   = now()
          WHERE id = $15
          RETURNING *`,
        [
            b.name, b.district, b.area, b.address, b.landmark, b.phone, b.alt_phone,
            b.email, b.hours, b.established, b.operators, b.services, b.esim_support,
            b.map_link, req.params.id
        ]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Shop not found" });
    res.json(shape(req, rows[0]));
};

// PATCH /api/admin/sim-shops/:id/approve
export const approveShop = async (req, res) => {
    const { rows } = await pool.query(
        `UPDATE sim_shops
            SET status = 'approved', rejection_reason = NULL,
                reviewed_by = $1, reviewed_at = now(), updated_at = now()
          WHERE id = $2
          RETURNING id, status`,
        [req.user.id, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Shop not found" });
    res.json(rows[0]);
};

// PATCH /api/admin/sim-shops/:id/reject   body: { reason }
export const rejectShop = async (req, res) => {
    const reason = (req.body?.reason || "").toString().trim().slice(0, 1000) || null;
    const { rows } = await pool.query(
        `UPDATE sim_shops
            SET status = 'rejected', rejection_reason = $1,
                reviewed_by = $2, reviewed_at = now(), updated_at = now()
          WHERE id = $3
          RETURNING id, status`,
        [reason, req.user.id, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Shop not found" });
    res.json(rows[0]);
};

// PATCH /api/admin/sim-shops/:id/active   body: { is_active }
export const setShopActive = async (req, res) => {
    const { rows } = await pool.query(
        "UPDATE sim_shops SET is_active = $1, updated_at = now() WHERE id = $2 RETURNING id, is_active",
        [!!req.body.is_active, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Shop not found" });
    res.json(rows[0]);
};

// DELETE /api/admin/sim-shops/:id
export const deleteShop = async (req, res) => {
    const found = await pool.query("SELECT doc_file_path FROM sim_shops WHERE id = $1", [req.params.id]);
    if (found.rows.length === 0) return res.status(404).json({ message: "Shop not found" });

    const { doc_file_path } = found.rows[0];
    if (doc_file_path && fs.existsSync(doc_file_path)) {
        try { fs.unlinkSync(doc_file_path); } catch { /* orphan file — ignore */ }
    }
    await pool.query("DELETE FROM sim_shops WHERE id = $1", [req.params.id]);
    res.json({ message: "Shop deleted", id: Number(req.params.id) });
};
