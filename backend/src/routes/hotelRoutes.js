import express from 'express';
import { getHotels, addHotel } from '../controllers/hotelController.js';

const router = express.Router();

router.get('/', getHotels); // Handles GET http://localhost:5050/api/hotels
router.post('/', addHotel); // Handles POST http://localhost:5050/api/hotels

export default router;