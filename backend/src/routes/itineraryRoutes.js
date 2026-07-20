import express from "express";

import {
    generateItinerary,
    getDraft,
    discardDraft
} from "../controllers/itineraryController.js";

import { authenticateUser, attachUserIfPresent } from "../middlewares/authMiddleware.js";

const router = express.Router();


// POST /api/itinerary/generate
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
