import express from "express";

import { wrap } from "../../utils/adminQuery.js";
import {
    listHotels,
    createHotel,
    updateHotel,
    setHotelActive,
    deleteHotel,
    listGuides,
    createGuide,
    updateGuide,
    setGuideActive,
    setGuideVerified,
    deleteGuide,
    listCars,
    createCar,
    updateCar,
    setCarActive,
    deleteCar
} from "../../controllers/admin/listingsController.js";


const router = express.Router();


/* ------------------------------ Hotels ------------------------------ */

// GET /api/admin/listings/hotels
router.get(
    "/hotels",
    wrap(listHotels)
);


// POST /api/admin/listings/hotels
router.post(
    "/hotels",
    wrap(createHotel)
);


// PUT /api/admin/listings/hotels/:id
router.put(
    "/hotels/:id",
    wrap(updateHotel)
);


// PATCH /api/admin/listings/hotels/:id/active
router.patch(
    "/hotels/:id/active",
    wrap(setHotelActive)
);


// DELETE /api/admin/listings/hotels/:id
router.delete(
    "/hotels/:id",
    wrap(deleteHotel)
);


/* ------------------------------ Guides ------------------------------ */

// GET /api/admin/listings/guides
router.get(
    "/guides",
    wrap(listGuides)
);


// POST /api/admin/listings/guides
router.post(
    "/guides",
    wrap(createGuide)
);


// PUT /api/admin/listings/guides/:id
router.put(
    "/guides/:id",
    wrap(updateGuide)
);


// PATCH /api/admin/listings/guides/:id/active
router.patch(
    "/guides/:id/active",
    wrap(setGuideActive)
);


// PATCH /api/admin/listings/guides/:id/verify
router.patch(
    "/guides/:id/verify",
    wrap(setGuideVerified)
);


// DELETE /api/admin/listings/guides/:id
router.delete(
    "/guides/:id",
    wrap(deleteGuide)
);


/* ------------------------------- Cars ------------------------------- */

// GET /api/admin/listings/cars
router.get(
    "/cars",
    wrap(listCars)
);


// POST /api/admin/listings/cars
router.post(
    "/cars",
    wrap(createCar)
);


// PUT /api/admin/listings/cars/:id
router.put(
    "/cars/:id",
    wrap(updateCar)
);


// PATCH /api/admin/listings/cars/:id/active
router.patch(
    "/cars/:id/active",
    wrap(setCarActive)
);


// DELETE /api/admin/listings/cars/:id
router.delete(
    "/cars/:id",
    wrap(deleteCar)
);


export default router;
