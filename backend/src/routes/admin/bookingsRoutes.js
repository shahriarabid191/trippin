import express from "express";
import { wrap } from "../../utils/adminQuery.js";
import {
    listBookings,
    bookingsSummary,
    cancelBooking,
    refundBooking,
} from "../../controllers/admin/bookingsController.js";

const router = express.Router();

router.get("/", wrap(listBookings));
router.get("/summary", wrap(bookingsSummary));
router.patch("/:type/:id/cancel", wrap(cancelBooking));
router.patch("/:type/:id/refund", wrap(refundBooking));

export default router;
