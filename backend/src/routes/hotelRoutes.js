import express from 'express';
import { getHotels, addHotel } from '../controllers/hotelController.js';

const router = express.Router();

router.get('/', getHotels);
router.post('/', addHotel); // Later we will add an auth middleware here to ensure only admins can POST

export default router;