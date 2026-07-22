import express from 'express';
import { getReviewsByHotel, addReview } from '../controllers/reviewController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/reviews/:hotelId  -> public, anyone can read reviews
router.get('/:hotelId', getReviewsByHotel);

// POST /api/reviews  -> only logged-in users can post
router.post('/', authenticateUser, addReview);

export default router;
