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
    likedByMe: row.liked_by_me === true,
    isMine: row.is_mine === true,
    isPublic: row.is_public
});


const shapeMine = (req, row) => ({
    id: row.id,
    url: fileURL(req, row.stored_name),
    caption: row.caption,
    likeCount: parseInt(row.like_count, 10) || 0,
    isPublic: row.is_public
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
