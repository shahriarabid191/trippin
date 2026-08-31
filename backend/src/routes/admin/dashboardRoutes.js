import express from "express";

import { wrap } from "../../utils/adminQuery.js";
import {
    getStats,
    getSignupsSeries,
    getBookingsSeries,
    getItinerarySeries
} from "../../controllers/admin/dashboardController.js";


const router = express.Router();


// GET /api/admin/dashboard/stats
router.get(
    "/stats",
    wrap(getStats)
);


// GET /api/admin/dashboard/charts/signups
router.get(
    "/charts/signups",
    wrap(getSignupsSeries)
);


// GET /api/admin/dashboard/charts/bookings
router.get(
    "/charts/bookings",
    wrap(getBookingsSeries)
);


// GET /api/admin/dashboard/charts/itineraries
router.get(
    "/charts/itineraries",
    wrap(getItinerarySeries)
);


export default router;
