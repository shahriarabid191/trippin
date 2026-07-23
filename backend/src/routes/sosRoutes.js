import express from "express";

import {
    sendSosRequest,
    getMySosContacts,
    getSosRequests,
    acceptRequest,
    rejectRequest,
    deleteSosContact
} from "../controllers/sosController.js";

import { authenticateUser } from "../middlewares/authMiddleware.js";


const router = express.Router();


// Send SOS contact request
// POST /api/sos/request
router.post(
    "/request",
    authenticateUser,
    sendSosRequest
);


// Get accepted SOS contacts
// GET /api/sos/contacts
router.get(
    "/contacts",
    authenticateUser,
    getMySosContacts
);


// Get incoming SOS requests
// GET /api/sos/requests
router.get(
    "/requests",
    authenticateUser,
    getSosRequests
);


// Accept SOS request
// PUT /api/sos/request/:id/accept
router.put(
    "/request/:id/accept",
    authenticateUser,
    acceptRequest
);


// Reject SOS request
// PUT /api/sos/request/:id/reject
router.put(
    "/request/:id/reject",
    authenticateUser,
    rejectRequest
);


// Remove SOS contact
// DELETE /api/sos/contact/:id
router.delete(
    "/contact/:id",
    authenticateUser,
    deleteSosContact
);


export default router;