import express from "express";

import {
    getJournals,
    getCommunityJournals,
    createJournal,
    removeJournal,
    editJournal

} from "../controllers/journalController.js";

import { authenticateUser } from "../middlewares/authMiddleware.js";


const router = express.Router();


// GET /api/journals  (my own entries)
router.get(
    "/",
    authenticateUser,
    getJournals
);


// GET /api/journals/public  (community feed)
router.get(
    "/public",
    authenticateUser,
    getCommunityJournals
);


// POST /api/journals
router.post(
    "/",
    authenticateUser,
    createJournal
);


// DELETE /api/journals/:id
router.delete(
    "/:id",
    authenticateUser,
    removeJournal
);


// PUT /api/journals/:id
router.put(
    "/:id",
    authenticateUser,
    editJournal
);


export default router;