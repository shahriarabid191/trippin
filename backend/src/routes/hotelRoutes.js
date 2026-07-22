import express from 'express';
import { getHotels, addHotel, getHotelById } from '../controllers/hotelController.js';

const router = express.Router();

router.get('/', getHotels); // Handles GET http://localhost:5050/api/hotels
router.post('/', addHotel); // Handles POST http://localhost:5050/api/hotels
router.get('/:id', getHotelById); // Handles GET http://localhost:5050/api/hotels/:id

export default router;