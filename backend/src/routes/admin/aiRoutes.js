import express from "express";
import { wrap } from "../../utils/adminQuery.js";
import { listItineraryRequests, aiSummary } from "../../controllers/admin/aiController.js";

const router = express.Router();

router.get("/itineraries", wrap(listItineraryRequests));
router.get("/summary", wrap(aiSummary));

export default router;
