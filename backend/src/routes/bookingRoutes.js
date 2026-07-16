import express from 'express';
import { getHotels } from '../controllers/hotelController.js';

const router = express.Router();

// GET: Fetch all hotels for the Booking page
router.get('/', getHotels);

export default router;