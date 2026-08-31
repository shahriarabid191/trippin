import express from "express";

import { wrap } from "../../utils/adminQuery.js";
import {
    listBookings,
    bookingsSummary,
    cancelBooking,
    refundBooking
} from "../../controllers/admin/bookingsController.js";


const router = express.Router();


// GET /api/admin/bookings
router.get(
    "/",
    wrap(listBookings)
);


// GET /api/admin/bookings/summary
router.get(
    "/summary",
    wrap(bookingsSummary)
);


// PATCH /api/admin/bookings/:type/:id/cancel
router.patch(
    "/:type/:id/cancel",
    wrap(cancelBooking)
);


// PATCH /api/admin/bookings/:type/:id/refund  (hotel only)
router.patch(
    "/:type/:id/refund",
    wrap(refundBooking)
);


export default router;
