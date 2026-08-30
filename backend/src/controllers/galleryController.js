import * as Gallery from "../models/galleryModel.js";

import fs from "fs";


// Build the absolute URL the browser can load the image from.
const fileURL = (req, storedName) =>
    `${req.protocol}://${req.get("host")}/uploads/${storedName}`;


// "admin@trippin.com" -> "admin"
const displayNameFromEmail = (email) =>
    typeof email === "string" ? email.split("@")[0] : "Traveler";


const shapePublic = (req, row) => ({
    id: row.id,
    url: fileURL(req, row.stored_name),
    caption: row.caption,
    uploader: displayNameFromEmail(row.uploader_email),
    likeCount: parseInt(row.like_count, 10) || 0,
    commentCount: parseInt(row.comment_count, 10) || 0,
    likedByMe: row.liked_by_me === true,
    isMine: row.is_mine === true,
    isPublic: row.is_public
});


const shapeMine = (req, row) => ({
    id: row.id,
    url: fileURL(req, row.stored_name),
    caption: row.caption,
    likeCount: parseInt(row.like_count, 10) || 0,
    commentCount: parseInt(row.comment_count, 10) || 0,
    isPublic: row.is_public
});


const shapeComment = (row) => ({
    id: row.id,
    parentId: row.parent_id,
    body: row.body,
    author: displayNameFromEmail(row.author_email),
    createdAt: row.created_at,
    likeCount: parseInt(row.like_count, 10) || 0,
    likedByMe: row.liked_by_me === true,
    isMine: row.is_mine === true
});



// GET /api/gallery/public  (open to guests; likedByMe needs a logged-in user)
export const getPublicGallery = async (req, res) => {

    try {

        const viewerID = req.user ? req.user.id : null;

        const rows = await Gallery.getPublicPhotos(viewerID);

        res.json(rows.map((row) => shapePublic(req, row)));

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};



// GET /api/gallery/mine  (auth)
export const getMyGallery = async (req, res) => {

    try {

        const rows = await Gallery.getUserPhotos(req.user.id);

        res.json(rows.map((row) => shapeMine(req, row)));

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};



// POST /api/gallery  (auth, multipart: image + caption + isPublic)
export const uploadPhoto = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                message: "An image is required"
            });
        }

        const caption = (req.body.caption || "").toString().slice(0, 100);
        const isPublic = req.body.isPublic === "true" || req.body.isPublic === true;

        const photo = await Gallery.createPhoto({
            user_id: req.user.id,
            caption,
            stored_name: req.file.filename,
            file_path: req.file.path,
            mime_type: req.file.mimetype,
            file_size: req.file.size,
            is_public: isPublic
        });

        res.status(201).json({
            message: "Photo uploaded",
            photo: shapeMine(req, { ...photo, like_count: 0 })
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Upload failed"
        });

    }

};



// PATCH /api/gallery/:id/visibility  (auth, owner)
export const updateVisibility = async (req, res) => {

    try {

        const isPublic = req.body.isPublic === true || req.body.isPublic === "true";

        const updated = await Gallery.setVisibility(
            req.params.id,
            req.user.id,
            isPublic
        );

        if (!updated) {
            return res.status(404).json({
                message: "Photo not found"
            });
        }

        res.json({
            message: "Visibility updated",
            isPublic: updated.is_public
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};



// DELETE /api/gallery/:id  (auth, owner)
export const removePhoto = async (req, res) => {

    try {

        const photo = await Gallery.getPhotoById(req.params.id);

        if (!photo || photo.user_id !== req.user.id) {
            return res.status(404).json({
                message: "Photo not found"
            });
        }

        if (photo.file_path && fs.existsSync(photo.file_path)) {
            fs.unlinkSync(photo.file_path);
        }

        await Gallery.deletePhoto(req.params.id, req.user.id);

        res.json({
            message: "Deleted successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};



// POST /api/gallery/:id/like  (auth) — toggles the current user's heart
export const toggleLike = async (req, res) => {

    try {

        const photo = await Gallery.getPhotoById(req.params.id);

        if (!photo) {
            return res.status(404).json({
                message: "Photo not found"
            });
        }

        if (photo.user_id === req.user.id) {
            return res.status(403).json({
                message: "You can't like your own photo"
            });
        }

        const liked = await Gallery.toggleLike(req.params.id, req.user.id);
        const likeCount = await Gallery.getLikeCount(req.params.id);

        res.json({
            liked,
            likeCount
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};



/* ==========================================================================
   Comments
   ========================================================================== */


const COMMENT_LIMIT = 500;


// A private photo's comments stay readable to its owner — the owner needs to
// see what people said while it was public. Everyone else needs it public.
const canSeeComments = (photo, viewerID) =>
    photo.is_public === true || photo.user_id === viewerID;



// GET /api/gallery/:id/comments  (open to guests on public photos)
export const getComments = async (req, res) => {

    try {

        const viewerID = req.user ? req.user.id : null;

        const photo = await Gallery.getPhotoById(req.params.id);

        if (!photo) {
            return res.status(404).json({
                message: "Photo not found"
            });
        }

        if (!canSeeComments(photo, viewerID)) {
            return res.status(403).json({
                message: "This photo is private"
            });
        }

        const rows = await Gallery.getComments(req.params.id, viewerID);

        res.json(rows.map(shapeComment));

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};



// POST /api/gallery/:id/comments  (auth) — body: { body, parentId }
export const addComment = async (req, res) => {

    try {

        const body = (req.body.body || "").toString().trim().slice(0, COMMENT_LIMIT);

        if (!body) {
            return res.status(400).json({
                message: "A comment can't be empty"
            });
        }

        const photo = await Gallery.getPhotoById(req.params.id);

        if (!photo) {
            return res.status(404).json({
                message: "Photo not found"
            });
        }

        if (!canSeeComments(photo, req.user.id)) {
            return res.status(403).json({
                message: "This photo is private"
            });
        }

        // Replies are one level deep: replying to a reply attaches the new
        // comment to the same thread root, and the "@user" tag the client
        // prepends is what keeps track of who is being answered.
        let parentID = null;

        if (req.body.parentId) {

            const parent = await Gallery.getCommentById(req.body.parentId);

            if (!parent || String(parent.photo_id) !== String(req.params.id)) {
                return res.status(400).json({
                    message: "That comment no longer exists"
                });
            }

            parentID = parent.parent_id || parent.id;
        }

        const comment = await Gallery.createComment(
            req.params.id,
            req.user.id,
            body,
            parentID
        );

        res.status(201).json(shapeComment(comment));

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};



// DELETE /api/gallery/comments/:commentId  (auth — author or photo owner)
export const removeComment = async (req, res) => {

    try {

        const deleted = await Gallery.deleteComment(
            req.params.commentId,
            req.user.id
        );

        if (!deleted) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        res.json({
            message: "Comment deleted"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};



// POST /api/gallery/comments/:commentId/like  (auth) — toggles the heart
export const toggleCommentLike = async (req, res) => {

    try {

        const comment = await Gallery.getCommentById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        if (comment.user_id === req.user.id) {
            return res.status(403).json({
                message: "You can't like your own comment"
            });
        }

        const liked = await Gallery.toggleCommentLike(
            req.params.commentId,
            req.user.id
        );

        const likeCount = await Gallery.getCommentLikeCount(req.params.commentId);

        res.json({
            liked,
            likeCount
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};
