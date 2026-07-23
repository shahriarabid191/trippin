import express from 'express';
import {
    getAllBookings,
    cancelBooking,
    getAllUsers,
    updateHotel,
    deleteHotel,
} from '../controllers/adminController.js';

const router = express.Router();

// Bookings oversight
router.get('/bookings', getAllBookings);              // GET    /api/admin/bookings
router.patch('/bookings/:id/cancel', cancelBooking);  // PATCH  /api/admin/bookings/:id/cancel

// Users list
router.get('/users', getAllUsers);                    // GET    /api/admin/users

// Manage hotels (add lives on POST /api/hotels already)
router.put('/hotels/:id', updateHotel);               // PUT    /api/admin/hotels/:id
router.delete('/hotels/:id', deleteHotel);            // DELETE /api/admin/hotels/:id

export default router;
