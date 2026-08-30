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



// All public photos, with uploader email + like count + comment count +
// whether the given viewer (may be null for guests) has already hearted it.
// Likes and comments are counted in subqueries rather than joins so the two
// LEFT JOINs can't multiply each other's rows.
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
            (SELECT COUNT(*) FROM gallery_likes l WHERE l.photo_id = p.id)
                AS like_count,
            (SELECT COUNT(*) FROM gallery_comments c WHERE c.photo_id = p.id)
                AS comment_count,
            EXISTS(
                SELECT 1 FROM gallery_likes l
                WHERE l.photo_id = p.id AND l.user_id = $1
            ) AS liked_by_me,
            (p.user_id = $1) AS is_mine
        FROM gallery_photos p
        JOIN users u ON u.id = p.user_id
        WHERE p.is_public = true
        ORDER BY p.created_at DESC
        `,
        [viewerID]
    );

    return result.rows;
}



// A single user's own photos (public + private). Hearts and comments a photo
// collected while it was public are kept and still counted after the owner
// flips it back to private — going private hides the photo, not its history.
export async function getUserPhotos(userID) {

    const result = await pool.query(
        `
        SELECT
            p.id,
            p.caption,
            p.stored_name,
            p.is_public,
            p.created_at,
            (SELECT COUNT(*) FROM gallery_likes l WHERE l.photo_id = p.id)
                AS like_count,
            (SELECT COUNT(*) FROM gallery_comments c WHERE c.photo_id = p.id)
                AS comment_count
        FROM gallery_photos p
        WHERE p.user_id = $1
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



/* ==========================================================================
   Comments
   ========================================================================== */


// Every comment on a photo (top-level + replies), oldest first, with the
// author's email, its heart count and whether the viewer already hearted it.
// The caller nests them by parent_id.
export async function getComments(photoID, viewerID) {

    const result = await pool.query(
        `
        SELECT
            c.id,
            c.parent_id,
            c.body,
            c.created_at,
            c.user_id,
            u.email AS author_email,
            (SELECT COUNT(*) FROM gallery_comment_likes cl
                WHERE cl.comment_id = c.id) AS like_count,
            EXISTS(
                SELECT 1 FROM gallery_comment_likes cl
                WHERE cl.comment_id = c.id AND cl.user_id = $2
            ) AS liked_by_me,
            (c.user_id = $2) AS is_mine
        FROM gallery_comments c
        JOIN users u ON u.id = c.user_id
        WHERE c.photo_id = $1
        ORDER BY c.created_at ASC
        `,
        [photoID, viewerID]
    );

    return result.rows;
}



// Insert a comment (parentID null for a top-level one) and return it in the
// same shape getComments uses, so the client can drop it straight into the list.
export async function createComment(photoID, userID, body, parentID) {

    const inserted = await pool.query(
        `
        INSERT INTO gallery_comments(photo_id, user_id, parent_id, body)
        VALUES($1,$2,$3,$4)
        RETURNING id
        `,
        [photoID, userID, parentID, body]
    );

    const result = await pool.query(
        `
        SELECT
            c.id,
            c.parent_id,
            c.body,
            c.created_at,
            c.user_id,
            u.email AS author_email,
            0 AS like_count,
            false AS liked_by_me,
            true AS is_mine
        FROM gallery_comments c
        JOIN users u ON u.id = c.user_id
        WHERE c.id = $1
        `,
        [inserted.rows[0].id]
    );

    return result.rows[0];
}



// Fetch one comment row — used to authorize deletes and to resolve the
// thread root when someone replies to a reply.
export async function getCommentById(id) {

    const result = await pool.query(
        "SELECT * FROM gallery_comments WHERE id=$1",
        [id]
    );

    return result.rows[0];
}



// Delete a comment. Allowed for its author and for the photo's owner, so the
// owner can clear unwanted comments off their own picture. Replies cascade.
export async function deleteComment(id, userID) {

    const result = await pool.query(
        `
        DELETE FROM gallery_comments c
        USING gallery_photos p
        WHERE c.id = $1
          AND p.id = c.photo_id
          AND (c.user_id = $2 OR p.user_id = $2)
        `,
        [id, userID]
    );

    return result.rowCount;
}



// Toggle a heart on a comment. Returns true if now liked, false if unliked.
export async function toggleCommentLike(commentID, userID) {

    const existing = await pool.query(
        "SELECT id FROM gallery_comment_likes WHERE comment_id=$1 AND user_id=$2",
        [commentID, userID]
    );

    if (existing.rows.length > 0) {

        await pool.query(
            "DELETE FROM gallery_comment_likes WHERE comment_id=$1 AND user_id=$2",
            [commentID, userID]
        );

        return false;
    }

    await pool.query(
        "INSERT INTO gallery_comment_likes(comment_id, user_id) VALUES($1,$2)",
        [commentID, userID]
    );

    return true;
}



// Current heart count for a comment
export async function getCommentLikeCount(commentID) {

    const result = await pool.query(
        "SELECT COUNT(*) AS like_count FROM gallery_comment_likes WHERE comment_id=$1",
        [commentID]
    );

    return parseInt(result.rows[0].like_count, 10);
}
