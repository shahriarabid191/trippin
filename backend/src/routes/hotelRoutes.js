import express from "express";

import {
    getHotels,
    addHotel,
    getHotelById,
    getAvailability
} from "../controllers/hotelController.js";


const router = express.Router();


// GET /api/hotels
router.get(
    "/",
    getHotels
);


// POST /api/hotels
router.post(
    "/",
    addHotel
);


// GET /api/hotels/:id/availability  (rooms free for a date range — before /:id)
router.get(
    "/:id/availability",
    getAvailability
);


// GET /api/hotels/:id
router.get(
    "/:id",
    getHotelById
);


export default router;
