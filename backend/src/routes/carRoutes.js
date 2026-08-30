import express from "express";

import {
    getCars,
    getCar,
    createCar,
    editCar,
    removeCar,
    getMyBookings,
    bookCar,
    cancelBooking,
    getCarReviews,
    getAllCarRatings,
    createCarReview,
    removeCarReview

} from "../controllers/carController.js"; 

import { authenticateUser, authorizeAdmin } from "../middlewares/authMiddleware.js";


const router = express.Router();


// GET /api/cars
router.get(
    "/",
    authenticateUser,
    getCars
);


// GET /api/cars/bookings/mine
router.get(
    "/bookings/mine",
    authenticateUser,
    getMyBookings
);

// GET /api/cars/ratings/all  (must come before /:id)
router.get(
    "/ratings/all",
    authenticateUser,
    getAllCarRatings
);


// GET /api/cars/:id/reviews
router.get(
    "/:id/reviews",
    authenticateUser,
    getCarReviews
);


// POST /api/cars/:id/reviews
router.post(
    "/:id/reviews",
    authenticateUser,
    createCarReview
);


// DELETE /api/cars/reviews/:reviewId
router.delete(
    "/reviews/:reviewId",
    authenticateUser,
    removeCarReview
);  






// GET /api/cars/:id
router.get(
    "/:id",
    authenticateUser,
    getCar
);


// POST /api/cars  (admin only)
router.post(
    "/",
    authenticateUser,
    authorizeAdmin,
    createCar
);


// PUT /api/cars/:id  (admin only)
router.put(
    "/:id",
    authenticateUser,
    authorizeAdmin,
    editCar
);


// DELETE /api/cars/:id  (admin only)
router.delete(
    "/:id",
    authenticateUser,
    authorizeAdmin,
    removeCar
);


// POST /api/cars/:id/book
router.post(
    "/:id/book",
    authenticateUser,
    bookCar
);


// DELETE /api/cars/bookings/:bookingId
router.delete(
    "/bookings/:bookingId",
    authenticateUser,
    cancelBooking
);


export default router; 