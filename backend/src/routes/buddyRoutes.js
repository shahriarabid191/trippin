import express from "express";

import {
    searchUsers,
    sendTravelBuddyRequest,
    getMyTravelBuddies,
    getTravelBuddyRequests,
    acceptBuddyRequest,
    rejectBuddyRequest,
    deleteTravelBuddy
} from "../controllers/buddyController.js";

import { authenticateUser } from "../middlewares/authMiddleware.js";


const router = express.Router();


// Send travel buddy request
router.post(
    "/request",
    authenticateUser,
    sendTravelBuddyRequest
);


// Get my accepted travel buddies
router.get(
    "/",
    authenticateUser,
    getMyTravelBuddies
);


// Get incoming travel buddy requests
router.get(
    "/requests",
    authenticateUser,
    getTravelBuddyRequests
);


// Accept travel buddy request
router.put(
    "/requests/:id/accept",
    authenticateUser,
    acceptBuddyRequest
);


// Reject travel buddy request
router.put(
    "/requests/:id/reject",
    authenticateUser,
    rejectBuddyRequest
);


// Remove travel buddy
router.delete(
    "/:id",
    authenticateUser,
    deleteTravelBuddy
);

// search
router.get(
    "/search",
    authenticateUser,
    searchUsers
);

export default router;