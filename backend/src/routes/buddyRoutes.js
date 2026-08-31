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


// POST /api/travel-buddies/request  (send travel buddy request)
router.post(
    "/request",
    authenticateUser,
    sendTravelBuddyRequest
);


// GET /api/travel-buddies  (my accepted travel buddies)
router.get(
    "/",
    authenticateUser,
    getMyTravelBuddies
);


// GET /api/travel-buddies/requests  (incoming travel buddy requests)
router.get(
    "/requests",
    authenticateUser,
    getTravelBuddyRequests
);


// PUT /api/travel-buddies/requests/:id/accept
router.put(
    "/requests/:id/accept",
    authenticateUser,
    acceptBuddyRequest
);


// PUT /api/travel-buddies/requests/:id/reject
router.put(
    "/requests/:id/reject",
    authenticateUser,
    rejectBuddyRequest
);


// DELETE /api/travel-buddies/:id  (remove travel buddy)
router.delete(
    "/:id",
    authenticateUser,
    deleteTravelBuddy
);


// GET /api/travel-buddies/search
router.get(
    "/search",
    authenticateUser,
    searchUsers
);


export default router;
