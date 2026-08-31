import pool from "../../config/db.js";
import { parseListParams, listEnvelope } from "../../utils/adminQuery.js";

// =====================================================================
// /api/admin/listings/{hotels|guides|cars}
//
// Full CRUD for the three bookable inventories. Deactivated inventory
// is hidden from the public browse lists (hotelController.getHotels,
// guideModel.getAllGuides, carModel.getAllCars all filter is_active).
// Deletes are hard deletes — bookings/reviews cascade, same as the
// existing owner-facing delete endpoints.
// =====================================================================

const asBoolFilter = (raw) => {
    if (raw === "true") return true;
    if (raw === "false") return false;
    return null;
};

const num = (v) => (v === undefined || v === "" || v === null ? null : Number(v));
const str = (v) => (v === undefined ? null : v);

/* ----------------------------- HOTELS ----------------------------- */

export const listHotels = async (req, res) => {
    const { limit, offset, search, sort, order, page } = parseListParams(req.query, {
        allowedSort: ["name", "location", "price_per_night", "rating", "created_at", "total_rooms"],
        defaultSort: "created_at",
    });
    const active = asBoolFilter(req.query.active);

    const where = `WHERE ($1 = '' OR h.name ILIKE '%'||$1||'%' OR h.location ILIKE '%'||$1||'%')
                     AND ($2::boolean IS NULL OR h.is_active = $2::boolean)`;

    const rows = await pool.query(
        `SELECT h.*,
                COALESCE(AVG(r.rating), h.rating)::numeric(3,1) AS avg_rating,
                COUNT(DISTINCT r.id)::int                        AS review_count,
                (SELECT COUNT(*) FROM bookings b WHERE b.hotel_id = h.id)::int AS booking_count
           FROM hotels h
           LEFT JOIN reviews r ON r.hotel_id = h.id
           ${where}
          GROUP BY h.id
          ORDER BY ${sort} ${order}
          LIMIT $3 OFFSET $4`,
        [search, active, limit, offset]
    );
    const total = await pool.query(
        `SELECT COUNT(*)::int AS n FROM hotels h ${where}`,
        [search, active]
    );

    res.json(listEnvelope(rows.rows, total.rows[0].n, { page, limit }));
};

export const createHotel = async (req, res) => {
    const b = req.body;
    if (!b.name || !b.location) {
        return res.status(400).json({ message: "name and location are required" });
    }
    const { rows } = await pool.query(
        `INSERT INTO hotels (name, location, price_per_night, image_url, rating, total_rooms, amenities, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7, COALESCE($8, true))
         RETURNING *`,
        [
            b.name, b.location, num(b.price_per_night) ?? 0, b.image_url || "",
            num(b.rating) ?? 5.0, num(b.total_rooms) ?? 10, str(b.amenities),
            typeof b.is_active === "boolean" ? b.is_active : null,
        ]
    );
    res.status(201).json(rows[0]);
};

export const updateHotel = async (req, res) => {
    const b = req.body;
    const { rows } = await pool.query(
        `UPDATE hotels SET
            name            = COALESCE($1, name),
            location        = COALESCE($2, location),
            price_per_night = COALESCE($3, price_per_night),
            image_url       = COALESCE($4, image_url),
            rating          = COALESCE($5, rating),
            total_rooms     = COALESCE($6, total_rooms),
            amenities       = COALESCE($7, amenities),
            is_active       = COALESCE($8, is_active)
          WHERE id = $9
          RETURNING *`,
        [
            str(b.name), str(b.location), num(b.price_per_night), str(b.image_url),
            num(b.rating), num(b.total_rooms), str(b.amenities),
            typeof b.is_active === "boolean" ? b.is_active : null, req.params.id,
        ]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Hotel not found" });
    res.json(rows[0]);
};

export const setHotelActive = async (req, res) => {
    const { rows } = await pool.query(
        "UPDATE hotels SET is_active = $1 WHERE id = $2 RETURNING *",
        [!!req.body.is_active, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Hotel not found" });
    res.json(rows[0]);
};

export const deleteHotel = async (req, res) => {
    const { rows } = await pool.query("DELETE FROM hotels WHERE id = $1 RETURNING id", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Hotel not found" });
    res.json({ message: "Hotel deleted", id: rows[0].id });
};

/* ----------------------------- GUIDES ----------------------------- */

export const listGuides = async (req, res) => {
    const { limit, offset, search, sort, order, page } = parseListParams(req.query, {
        allowedSort: ["name", "location", "price_per_day", "created_at", "verified_at"],
        defaultSort: "created_at",
    });
    const active = asBoolFilter(req.query.active);
    const verified = asBoolFilter(req.query.verified);

    const where = `WHERE ($1 = '' OR g.name ILIKE '%'||$1||'%' OR g.location ILIKE '%'||$1||'%')
                     AND ($2::boolean IS NULL OR g.is_active = $2::boolean)
                     AND ($3::boolean IS NULL
                          OR ($3::boolean = true  AND g.verified_at IS NOT NULL)
                          OR ($3::boolean = false AND g.verified_at IS NULL))`;

    const rows = await pool.query(
        `SELECT g.*,
                (SELECT COALESCE(AVG(rating),0)::numeric(2,1) FROM guide_reviews gr WHERE gr.guide_id = g.id) AS avg_rating,
                (SELECT COUNT(*) FROM guide_reviews gr WHERE gr.guide_id = g.id)::int  AS review_count,
                (SELECT COUNT(*) FROM guide_bookings gb WHERE gb.guide_id = g.id)::int AS booking_count
           FROM guides g
           ${where}
          ORDER BY ${sort} ${order}
          LIMIT $4 OFFSET $5`,
        [search, active, verified, limit, offset]
    );
    const total = await pool.query(`SELECT COUNT(*)::int AS n FROM guides g ${where}`, [search, active, verified]);

    res.json(listEnvelope(rows.rows, total.rows[0].n, { page, limit }));
};

export const createGuide = async (req, res) => {
    const b = req.body;
    if (!b.name) return res.status(400).json({ message: "name is required" });
    const { rows } = await pool.query(
        `INSERT INTO guides (name, bio, location, price_per_day, photo_url, created_by, languages, specialties, is_active, verified_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8, COALESCE($9, true), $10)
         RETURNING *`,
        [
            b.name, str(b.bio), str(b.location), num(b.price_per_day) ?? 0, b.photo_url || "",
            req.user.id, str(b.languages), str(b.specialties),
            typeof b.is_active === "boolean" ? b.is_active : null,
            b.verified ? new Date() : null,
        ]
    );
    res.status(201).json(rows[0]);
};

export const updateGuide = async (req, res) => {
    const b = req.body;
    const { rows } = await pool.query(
        `UPDATE guides SET
            name          = COALESCE($1, name),
            bio           = COALESCE($2, bio),
            location      = COALESCE($3, location),
            price_per_day = COALESCE($4, price_per_day),
            photo_url     = COALESCE($5, photo_url),
            languages     = COALESCE($6, languages),
            specialties   = COALESCE($7, specialties),
            is_active     = COALESCE($8, is_active)
          WHERE id = $9
          RETURNING *`,
        [
            str(b.name), str(b.bio), str(b.location), num(b.price_per_day), str(b.photo_url),
            str(b.languages), str(b.specialties),
            typeof b.is_active === "boolean" ? b.is_active : null, req.params.id,
        ]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Guide not found" });
    res.json(rows[0]);
};

export const setGuideActive = async (req, res) => {
    const { rows } = await pool.query(
        "UPDATE guides SET is_active = $1 WHERE id = $2 RETURNING *",
        [!!req.body.is_active, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Guide not found" });
    res.json(rows[0]);
};

export const setGuideVerified = async (req, res) => {
    const { rows } = await pool.query(
        "UPDATE guides SET verified_at = $1 WHERE id = $2 RETURNING *",
        [req.body.verified ? new Date() : null, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Guide not found" });
    res.json(rows[0]);
};

export const deleteGuide = async (req, res) => {
    const { rows } = await pool.query("DELETE FROM guides WHERE id = $1 RETURNING id", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Guide not found" });
    res.json({ message: "Guide deleted", id: rows[0].id });
};

/* ------------------------------ CARS ------------------------------ */

export const listCars = async (req, res) => {
    const { limit, offset, search, sort, order, page } = parseListParams(req.query, {
        allowedSort: ["name", "type", "location", "price_per_day", "created_at"],
        defaultSort: "created_at",
    });
    const active = asBoolFilter(req.query.active);

    const where = `WHERE ($1 = '' OR c.name ILIKE '%'||$1||'%' OR c.location ILIKE '%'||$1||'%' OR c.type ILIKE '%'||$1||'%')
                     AND ($2::boolean IS NULL OR c.is_active = $2::boolean)`;

    const rows = await pool.query(
        `SELECT c.*,
                (SELECT COALESCE(AVG(rating),0)::numeric(2,1) FROM car_reviews cr WHERE cr.car_id = c.id) AS avg_rating,
                (SELECT COUNT(*) FROM car_reviews cr WHERE cr.car_id = c.id)::int   AS review_count,
                (SELECT COUNT(*) FROM car_bookings cb WHERE cb.car_id = c.id)::int  AS booking_count
           FROM cars c
           ${where}
          ORDER BY ${sort} ${order}
          LIMIT $3 OFFSET $4`,
        [search, active, limit, offset]
    );
    const total = await pool.query(`SELECT COUNT(*)::int AS n FROM cars c ${where}`, [search, active]);

    res.json(listEnvelope(rows.rows, total.rows[0].n, { page, limit }));
};

export const createCar = async (req, res) => {
    const b = req.body;
    if (!b.name) return res.status(400).json({ message: "name is required" });
    const { rows } = await pool.query(
        `INSERT INTO cars (name, type, location, price_per_day, photo_url, created_by, provider, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7, COALESCE($8, true))
         RETURNING *`,
        [
            b.name, str(b.type), str(b.location), num(b.price_per_day) ?? 0, b.photo_url || "",
            req.user.id, str(b.provider),
            typeof b.is_active === "boolean" ? b.is_active : null,
        ]
    );
    res.status(201).json(rows[0]);
};

export const updateCar = async (req, res) => {
    const b = req.body;
    const { rows } = await pool.query(
        `UPDATE cars SET
            name          = COALESCE($1, name),
            type          = COALESCE($2, type),
            location      = COALESCE($3, location),
            price_per_day = COALESCE($4, price_per_day),
            photo_url     = COALESCE($5, photo_url),
            provider      = COALESCE($6, provider),
            is_active     = COALESCE($7, is_active)
          WHERE id = $8
          RETURNING *`,
        [
            str(b.name), str(b.type), str(b.location), num(b.price_per_day), str(b.photo_url),
            str(b.provider), typeof b.is_active === "boolean" ? b.is_active : null, req.params.id,
        ]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Car not found" });
    res.json(rows[0]);
};

export const setCarActive = async (req, res) => {
    const { rows } = await pool.query(
        "UPDATE cars SET is_active = $1 WHERE id = $2 RETURNING *",
        [!!req.body.is_active, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Car not found" });
    res.json(rows[0]);
};

export const deleteCar = async (req, res) => {
    const { rows } = await pool.query("DELETE FROM cars WHERE id = $1 RETURNING id", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Car not found" });
    res.json({ message: "Car deleted", id: rows[0].id });
};
