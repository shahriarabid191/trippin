import express from "express";
import multer from "multer";

import {
    getFilesByUserID,
    uploadFile,
    removeFile,
    renameFile
} from "../controllers/vaultController.js";

import { authenticateUser } from "../middlewares/authMiddleware.js";


const router = express.Router();


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });


// GET /api/vault
router.get(
    "/",
    authenticateUser,
    getFilesByUserID
);


// POST /api/vault
router.post(
    "/",
    authenticateUser,
    upload.single("file"),
    uploadFile
);


// DELETE /api/vault/:id
router.delete(
    "/:id",
    authenticateUser,
    removeFile
);


// PUT /api/vault/:id
router.put(
    "/:id",
    authenticateUser,
    renameFile
);


export default router;
