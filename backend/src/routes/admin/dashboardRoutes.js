import express from "express";
import { wrap } from "../../utils/adminQuery.js";
import {
    getStats,
    getSignupsSeries,
    getBookingsSeries,
    getItinerarySeries,
} from "../../controllers/admin/dashboardController.js";

const router = express.Router();

router.get("/stats", wrap(getStats));
router.get("/charts/signups", wrap(getSignupsSeries));
router.get("/charts/bookings", wrap(getBookingsSeries));
router.get("/charts/itineraries", wrap(getItinerarySeries));

export default router;
