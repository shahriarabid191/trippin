import express from "express";

import {
    triggerSosAlert,
    getMyReceivedAlerts,
    getMySentAlerts,
    acknowledgeAlert
} from "../controllers/sosAlertController.js";

import { authenticateUser } from "../middlewares/authMiddleware.js";


const router = express.Router();


// Trigger SOS alert
// POST /api/sos-alerts
router.post(
    "/",
    authenticateUser,
    triggerSosAlert
);


// Get received SOS alerts
// GET /api/sos-alerts/received
router.get(
    "/received",
    authenticateUser,
    getMyReceivedAlerts
);


// Get sent SOS alerts
// GET /api/sos-alerts/sent
router.get(
    "/sent",
    authenticateUser,
    getMySentAlerts
);


// Acknowledge received SOS alert
// PUT /api/sos-alerts/:id/ack
router.put(
    "/:id/ack",
    authenticateUser,
    acknowledgeAlert
);



export default router;