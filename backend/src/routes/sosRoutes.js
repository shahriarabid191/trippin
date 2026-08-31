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


// POST /api/sos/request  (send SOS contact request)
router.post(
    "/request",
    authenticateUser,
    sendSosRequest
);


// GET /api/sos/contacts  (accepted SOS contacts)
router.get(
    "/contacts",
    authenticateUser,
    getMySosContacts
);


// GET /api/sos/requests  (incoming SOS requests)
router.get(
    "/requests",
    authenticateUser,
    getSosRequests
);


// PUT /api/sos/request/:id/accept
router.put(
    "/request/:id/accept",
    authenticateUser,
    acceptRequest
);


// PUT /api/sos/request/:id/reject
router.put(
    "/request/:id/reject",
    authenticateUser,
    rejectRequest
);


// DELETE /api/sos/contact/:id  (remove SOS contact)
router.delete(
    "/contact/:id",
    authenticateUser,
    deleteSosContact
);


export default router;
