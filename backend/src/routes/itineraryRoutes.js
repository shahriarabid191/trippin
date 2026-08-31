import express from "express";

import {
    generateItinerary,
    getDraft,
    discardDraft
} from "../controllers/itineraryController.js";

import { authenticateUser, attachUserIfPresent } from "../middlewares/authMiddleware.js";


const router = express.Router();


// POST /api/itinerary/generate  (works for guests and logged-in users)
router.post(
    "/generate",
    attachUserIfPresent,
    generateItinerary
);


// GET /api/itinerary/draft
router.get(
    "/draft",
    authenticateUser,
    getDraft
);


// DELETE /api/itinerary/draft
router.delete(
    "/draft",
    authenticateUser,
    discardDraft
);


export default router;
