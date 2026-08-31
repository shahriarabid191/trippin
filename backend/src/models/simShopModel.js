import pool from "../config/db.js";

// =====================================================================
// SIM / eSIM shop directory — data access.
//
// Public reads only ever return status = 'approved' AND is_active = true,
// and never expose the verification-document columns.
// =====================================================================

// DB row -> public API shape. Keys match the objects the frontend
// SimShops page already expects (shop.operator, shop.esimSupport, ...).
const toPublic = (row) => ({
    id: row.id,
    name: row.name,
    district: row.district,
    area: row.area,
    address: row.address,
    landmark: row.landmark,
    phone: row.phone,
    altPhone: row.alt_phone,
    email: row.email,
    hours: row.hours,
    established: row.established,
    operator: row.operators || [],
    services: row.services || [],
    esimSupport: row.esim_support,
    mapLink: row.map_link,
    submittedBy: row.submitted_by,
    createdAt: row.created_at
});

// GET /api/sim-shops  — public browse with optional filters
export const getPublicShops = async ({ district, area, esim, search }) => {
    const result = await pool.query(
        `SELECT *
           FROM sim_shops
          WHERE status = 'approved'
            AND is_active = true
            AND ($1 = '' OR district = $1)
            AND ($2 = '' OR area ILIKE $2)
            AND ($3::boolean IS NULL OR esim_support = $3::boolean)
            AND ($4 = '' OR name ILIKE '%'||$4||'%' OR area ILIKE '%'||$4||'%' OR address ILIKE '%'||$4||'%')
          ORDER BY district, area, name`,
        [
            district || "",
            area || "",
            typeof esim === "boolean" ? esim : null,
            search || ""
        ]
    );
    return result.rows.map(toPublic);
};

// Districts (and their areas) that currently have a published shop —
// used to drive the public filter dropdowns.
export const getPublishedGeography = async () => {
    const result = await pool.query(
        `SELECT district, area, COUNT(*)::int AS shop_count
           FROM sim_shops
          WHERE status = 'approved' AND is_active = true
          GROUP BY district, area
          ORDER BY district, area`
    );

    const byDistrict = {};
    for (const r of result.rows) {
        (byDistrict[r.district] ||= []).push({ area: r.area, shopCount: r.shop_count });
    }
    return byDistrict;
};

// Fetch one row (raw) — for ownership checks and file cleanup.
export const getShopById = async (id) => {
    const result = await pool.query("SELECT * FROM sim_shops WHERE id = $1", [id]);
    return result.rows[0];
};

// POST /api/sim-shops — a logged-in user submits a shop for review.
export const createSubmission = async (data) => {
    const result = await pool.query(
        `INSERT INTO sim_shops (
            name, district, area, address, landmark, phone, alt_phone, email,
            hours, established, operators, services, esim_support, map_link,
            doc_stored_name, doc_file_path,
            status, source, submitted_by
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'pending','user',$17)
         RETURNING *`,
        [
            data.name, data.district, data.area, data.address, data.landmark || null,
            data.phone, data.altPhone || null, data.email || null,
            data.hours, data.established || null,
            data.operators, data.services, !!data.esimSupport, data.mapLink || null,
            data.docStoredName || null, data.docFilePath || null,
            data.submittedBy
        ]
    );
    return result.rows[0];
};

// GET /api/sim-shops/mine — the caller's own submissions + their status.
export const getSubmissionsByUser = async (userId) => {
    const result = await pool.query(
        `SELECT *
           FROM sim_shops
          WHERE submitted_by = $1
          ORDER BY created_at DESC`,
        [userId]
    );
    return result.rows.map(row => ({
        ...toPublic(row),
        status: row.status,
        rejection_reason: row.rejection_reason,
        reviewed_at: row.reviewed_at,
        isActive: row.is_active
    }));
};

// DELETE /api/sim-shops/:id — a user withdraws their own submission.
export const deleteOwnSubmission = async (id, userId) => {
    const result = await pool.query(
        "DELETE FROM sim_shops WHERE id = $1 AND submitted_by = $2 RETURNING id",
        [id, userId]
    );
    return result.rowCount;
};

// PUT /api/sim-shops/:id — a user updates their own submission.
// It resets the status to 'pending' so an admin can re-approve it.
export const updateOwnSubmission = async (id, userId, data) => {
    let updateFields = [];
    let values = [id, userId];
    let idx = 3; // $1 = id, $2 = userId

    const addField = (col, val) => {
        updateFields.push(`${col} = $${idx++}`);
        values.push(val);
    };

    addField("name", data.name);
    addField("district", data.district);
    addField("area", data.area);
    addField("address", data.address);
    addField("landmark", data.landmark || null);
    addField("phone", data.phone);
    addField("alt_phone", data.altPhone || null);
    addField("email", data.email || null);
    addField("hours", data.hours);
    addField("established", data.established || null);
    addField("operators", data.operators);
    addField("services", data.services);
    addField("esim_support", !!data.esimSupport);
    addField("map_link", data.mapLink || null);

    if (data.docStoredName) {
        addField("doc_stored_name", data.docStoredName);
        addField("doc_file_path", data.docFilePath);
    }

    // Force status to pending and reset review info
    addField("status", "pending");
    addField("rejection_reason", null);
    addField("reviewed_by", null);
    addField("reviewed_at", null);
    addField("updated_at", "now()");

    const result = await pool.query(
        `UPDATE sim_shops
            SET ${updateFields.join(", ")}
          WHERE id = $1 AND submitted_by = $2
          RETURNING *`,
        values
    );
    return result.rows[0];
};

export { toPublic };
