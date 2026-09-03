import express from "express";

import {
    sendSosRequest,
    getMySosContacts,
    getSosRequests,
    acceptRequest,
    rejectRequest,
    deleteSosContact,
    searchUsers
} from "../controllers/sosController.js";

import {
    authenticateUser
} from "../middlewares/authMiddleware.js";


const router = express.Router();


// POST /api/sos/request
// Send SOS contact request
router.post(
    "/request",
    authenticateUser,
    sendSosRequest
);


// GET /api/sos/contacts
// Get accepted SOS contacts
router.get(
    "/contacts",
    authenticateUser,
    getMySosContacts
);


// GET /api/sos/requests
// Get incoming SOS contact requests
router.get(
    "/requests",
    authenticateUser,
    getSosRequests
);


// GET /api/sos/search?username=...
// Search users for SOS contact
router.get(
    "/search",
    authenticateUser,
    searchUsers
);


// PUT /api/sos/request/:id/accept
// Accept SOS contact request
router.put(
    "/request/:id/accept",
    authenticateUser,
    acceptRequest
);


// PUT /api/sos/request/:id/reject
// Reject SOS contact request
router.put(
    "/request/:id/reject",
    authenticateUser,
    rejectRequest
);


// DELETE /api/sos/contacts/:id
// Remove SOS contact
router.delete(
    "/contacts/:id",
    authenticateUser,
    deleteSosContact
);


export default router;

