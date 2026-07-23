import pool from "../config/db.js";


// Create a photo record
export async function createPhoto(photo) {

    const result = await pool.query(
        `
        INSERT INTO gallery_photos(
            user_id,
            caption,
            stored_name,
            file_path,
            mime_type,
            file_size,
            is_public
        )
        VALUES($1,$2,$3,$4,$5,$6,$7)
        RETURNING *
        `,
        [
            photo.user_id,
            photo.caption,
            photo.stored_name,
            photo.file_path,
            photo.mime_type,
            photo.file_size,
            photo.is_public
        ]
    );

    return result.rows[0];
}



// All public photos, with uploader email + like count + whether the
// given viewer (may be null for guests) has already hearted it.
export async function getPublicPhotos(viewerID) {

    const result = await pool.query(
        `
        SELECT
            p.id,
            p.caption,
            p.stored_name,
            p.is_public,
            p.created_at,
            u.email AS uploader_email,
            COUNT(l.id) AS like_count,
            BOOL_OR(l.user_id = $1) AS liked_by_me,
            (p.user_id = $1) AS is_mine
        FROM gallery_photos p
        JOIN users u ON u.id = p.user_id
        LEFT JOIN gallery_likes l ON l.photo_id = p.id
        WHERE p.is_public = true
        GROUP BY p.id, u.email
        ORDER BY p.created_at DESC
        `,
        [viewerID]
    );

    return result.rows;
}



// A single user's own photos (public + private)
export async function getUserPhotos(userID) {

    const result = await pool.query(
        `
        SELECT
            p.id,
            p.caption,
            p.stored_name,
            p.is_public,
            p.created_at,
            COUNT(l.id) AS like_count
        FROM gallery_photos p
        LEFT JOIN gallery_likes l ON l.photo_id = p.id
        WHERE p.user_id = $1
        GROUP BY p.id
        ORDER BY p.created_at DESC
        `,
        [userID]
    );

    return result.rows;
}



// Fetch one photo row (used to authorize + locate the file on disk)
export async function getPhotoById(id) {

    const result = await pool.query(
        "SELECT * FROM gallery_photos WHERE id=$1",
        [id]
    );

    return result.rows[0];
}



// Flip a photo's visibility (owner only)
export async function setVisibility(id, userID, isPublic) {

    const result = await pool.query(
        `
        UPDATE gallery_photos
        SET is_public=$1
        WHERE id=$2 AND user_id=$3
        RETURNING *
        `,
        [isPublic, id, userID]
    );

    return result.rows[0];
}



// Delete a photo (owner only). Likes cascade automatically.
export async function deletePhoto(id, userID) {

    const result = await pool.query(
        "DELETE FROM gallery_photos WHERE id=$1 AND user_id=$2",
        [id, userID]
    );

    return result.rowCount;
}



// Toggle a heart. Returns true if now liked, false if unliked.
export async function toggleLike(photoID, userID) {

    const existing = await pool.query(
        "SELECT id FROM gallery_likes WHERE photo_id=$1 AND user_id=$2",
        [photoID, userID]
    );

    if (existing.rows.length > 0) {

        await pool.query(
            "DELETE FROM gallery_likes WHERE photo_id=$1 AND user_id=$2",
            [photoID, userID]
        );

        return false;
    }

    await pool.query(
        "INSERT INTO gallery_likes(photo_id, user_id) VALUES($1,$2)",
        [photoID, userID]
    );

    return true;
}



// Current heart count for a photo
export async function getLikeCount(photoID) {

    const result = await pool.query(
        "SELECT COUNT(*) AS like_count FROM gallery_likes WHERE photo_id=$1",
        [photoID]
    );

    return parseInt(result.rows[0].like_count, 10);
}
