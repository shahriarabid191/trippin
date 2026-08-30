import express from "express";

import {
    getGuides,
    getGuide,
    createGuide,
    editGuide,
    removeGuide,
    getMyBookings,
    bookGuide,
    cancelBooking,
    getGuideReviews,
    getAllGuideRatings,
    createGuideReview,
    removeGuideReview

} from "../controllers/guideController.js";

import { authenticateUser, authorizeAdmin } from "../middlewares/authMiddleware.js";


const router = express.Router();


// GET /api/guides  (any logged-in user can browse)
router.get(
    "/",
    authenticateUser,
    getGuides
);


// GET /api/guides/bookings/mine  (my bookings)
router.get(
    "/bookings/mine",
    authenticateUser,
    getMyBookings
);


// GET /api/guides/ratings/all  (must come before /:id)
router.get(
    "/ratings/all",
    authenticateUser,
    getAllGuideRatings
);


// GET /api/guides/:id/reviews
router.get(
    "/:id/reviews",
    authenticateUser,
    getGuideReviews
);


// POST /api/guides/:id/reviews
router.post(
    "/:id/reviews",
    authenticateUser,
    createGuideReview
);


// DELETE /api/guides/reviews/:reviewId
router.delete(
    "/reviews/:reviewId",
    authenticateUser,
    removeGuideReview
);





// GET /api/guides/:id
router.get(
    "/:id",
    authenticateUser,
    getGuide
);


// POST /api/guides  (admin only)
router.post(
    "/",
    authenticateUser,
    authorizeAdmin,
    createGuide
);


// PUT /api/guides/:id  (admin only)
router.put(
    "/:id",
    authenticateUser,
    authorizeAdmin,
    editGuide
);


// DELETE /api/guides/:id  (admin only)
router.delete(
    "/:id",
    authenticateUser,
    authorizeAdmin,
    removeGuide
);


// POST /api/guides/:id/book  (any logged-in user)
router.post(
    "/:id/book",
    authenticateUser,
    bookGuide
);


// DELETE /api/guides/bookings/:bookingId
router.delete(
    "/bookings/:bookingId",
    authenticateUser,
    cancelBooking
);


export default router; 