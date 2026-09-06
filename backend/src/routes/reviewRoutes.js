import express from "express";

import {
    getReviewsByHotel,
    getReviewById,
    addReview,
    deleteReview,
    getFeaturedReviews
} from "../controllers/reviewController.js";

import { authenticateUser } from "../middlewares/authMiddleware.js";


const router = express.Router();


// GET /api/reviews/highlights  (public — top real reviews for the homepage,
// registered before /:hotelId so "highlights" isn't read as an id)
router.get(
    "/highlights",
    getFeaturedReviews
);


// GET /api/reviews/single/:id  (public — retrieve specific review by ID)
router.get(
    "/single/:id",
    getReviewById
);


// GET /api/reviews/:hotelId  (public — anyone can read reviews for a hotel)
router.get(
    "/:hotelId",
    getReviewsByHotel
);


// POST /api/reviews  (only logged-in users can post)
router.post(
    "/",
    authenticateUser,
    addReview
);


// DELETE /api/reviews/:id  (only logged-in users can delete)
router.delete(
    "/:id",
    authenticateUser,
    deleteReview
);


export default router;
