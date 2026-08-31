import express from "express";

import { wrap } from "../../utils/adminQuery.js";
import {
    listItineraryRequests,
    aiSummary
} from "../../controllers/admin/aiController.js";


const router = express.Router();


// GET /api/admin/ai/itineraries
router.get(
    "/itineraries",
    wrap(listItineraryRequests)
);


// GET /api/admin/ai/summary
router.get(
    "/summary",
    wrap(aiSummary)
);


export default router;
