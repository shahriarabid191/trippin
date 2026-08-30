import db from "../config/db.js";

// Get all guides (public browse list)
export const getAllGuides = async () => {
    const result = await db.query(
        "SELECT * FROM guides ORDER BY created_at DESC"
    );
    return result.rows;
};

// Get a single guide
export const getGuideById = async (id) => {
    const result = await db.query(
        "SELECT * FROM guides WHERE id=$1",
        [id]
    );
    return result.rows[0];
};

// Add a guide
export const addGuide = async (guide) => {
    const result = await db.query(
        `
        INSERT INTO guides(name, bio, location, price_per_day, photo_url, created_by)
        VALUES($1,$2,$3,$4,$5,$6)
        RETURNING *
        `,
        [guide.name, guide.bio, guide.location, guide.pricePerDay, guide.photoUrl, guide.createdBy]
    );
    return result.rows[0];
};

// Update a guide
export const updateGuide = async (id, guide) => {
    const result = await db.query(
        `
        UPDATE guides
        SET name=$1, bio=$2, location=$3, price_per_day=$4, photo_url=$5
        WHERE id=$6
        `,
        [guide.name, guide.bio, guide.location, guide.pricePerDay, guide.photoUrl, id]
    );
    return result.rowCount;
};

// Delete a guide
export const deleteGuide = async (id) => {
    const result = await db.query(
        "DELETE FROM guides WHERE id=$1",
        [id]
    );
    return result.rowCount;
}; 