import express from "express";
import multer from "multer";
import fs from "fs";

import {
    getShops,
    getMeta,
    submitShop,
    getMySubmissions,
    withdrawSubmission
} from "../controllers/simShopController.js";

import { authenticateUser, attachUserIfPresent } from "../middlewares/authMiddleware.js";


const router = express.Router();


// Verification documents share the uploads/ folder used by the vault
// and gallery. multer.diskStorage does not create the directory.
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

// Only accept a single PDF, capped at 8 MB.
const upload = multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        cb(null, file.mimetype === "application/pdf");
    }
});


// GET /api/sim-shops  (public browse; optional auth is harmless here)
router.get(
    "/",
    attachUserIfPresent,
    getShops
);


// GET /api/sim-shops/meta  (districts, operators, services, published geography)
router.get(
    "/meta",
    getMeta
);


// GET /api/sim-shops/mine  (the caller's own submissions)
router.get(
    "/mine",
    authenticateUser,
    getMySubmissions
);


// POST /api/sim-shops  (submit a shop for admin review)
router.post(
    "/",
    authenticateUser,
    upload.single("document"),
    submitShop
);


// DELETE /api/sim-shops/:id  (withdraw your own submission)
router.delete(
    "/:id",
    authenticateUser,
    withdrawSubmission
);


export default router;
