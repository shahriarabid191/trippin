import express from "express";

import {
    getMyNotifications,
    getMyUnreadCount,
    readNotification,
    readAllNotifications
} from "../controllers/notificationController.js";

import { authenticateUser } from "../middlewares/authMiddleware.js";


const router = express.Router();


// GET /api/notifications

router.get(
    "/",
    authenticateUser,
    getMyNotifications
);


// GET /api/notifications/unread-count

router.get(
    "/unread-count",
    authenticateUser,
    getMyUnreadCount
);


// PATCH /api/notifications/:id/read

router.patch(
    "/:id/read",
    authenticateUser,
    readNotification
);


// PATCH /api/notifications/read-all

router.patch(
    "/read-all",
    authenticateUser,
    readAllNotifications
);


export default router;