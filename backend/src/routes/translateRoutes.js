import express from "express";
import multer from "multer";

import { translateImage } from "../controllers/translateController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Stateless feature — nothing gets written to disk or the DB, so the
// upload only needs to live in memory for the duration of the request.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        cb(null, file.mimetype.startsWith("image/"));
    }
});

router.post(
    "/image",
    authenticateUser,
    upload.single("image"),
    translateImage
);

export default router;
