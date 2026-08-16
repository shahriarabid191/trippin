import express from "express";
import multer from "multer";
import fs from "fs";

import {
    getPublicGallery,
    getMyGallery,
    uploadPhoto,
    updateVisibility,
    removePhoto,
    toggleLike,
    getComments,
    addComment,
    removeComment,
    toggleCommentLike
} from "../controllers/galleryController.js";

import { authenticateUser, attachUserIfPresent } from "../middlewares/authMiddleware.js";

const router = express.Router();


// Photos share the same uploads/ folder as the vault. multer.diskStorage
// does not create the directory itself, so make sure it exists.
const UPLOAD_DIR = "uploads/";
fs.mkdirSync(UPLOAD_DIR, { recursive: true });


const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }

});


// Only accept images
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        cb(null, file.mimetype.startsWith("image/"));
    }
});



// Public gallery — visible to everyone; optional auth so we know which
// photos the current viewer has already hearted.
router.get(
    "/public",
    attachUserIfPresent,
    getPublicGallery
);


// The signed-in user's own photos (public + private)
router.get(
    "/mine",
    authenticateUser,
    getMyGallery
);


// Upload a new photo
router.post(
    "/",
    authenticateUser,
    upload.single("image"),
    uploadPhoto
);


// Toggle public/private
router.patch(
    "/:id/visibility",
    authenticateUser,
    updateVisibility
);


// Delete a photo
router.delete(
    "/:id",
    authenticateUser,
    removePhoto
);


// Heart / un-heart a photo
router.post(
    "/:id/like",
    authenticateUser,
    toggleLike
);


// --- Comments ---
// The comment-scoped routes are keyed on a comment id, not a photo id, so
// they live under "/comments/..." to stay clear of the photo routes above.

// Heart / un-heart a comment
router.post(
    "/comments/:commentId/like",
    authenticateUser,
    toggleCommentLike
);


// Delete a comment (its author, or the owner of the photo)
router.delete(
    "/comments/:commentId",
    authenticateUser,
    removeComment
);


// Read a photo's comment thread
router.get(
    "/:id/comments",
    attachUserIfPresent,
    getComments
);


// Post a comment or a reply
router.post(
    "/:id/comments",
    authenticateUser,
    addComment
);



export default router;
