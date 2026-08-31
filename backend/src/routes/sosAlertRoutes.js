import express from "express";

import {
    triggerSosAlert,
    getMyReceivedAlerts,
    getMySentAlerts,
    acknowledgeAlert
} from "../controllers/sosAlertController.js";

import { authenticateUser } from "../middlewares/authMiddleware.js";


const router = express.Router();


// POST /api/sos-alerts  (trigger SOS alert)
router.post(
    "/",
    authenticateUser,
    triggerSosAlert
);


// GET /api/sos-alerts/received
router.get(
    "/received",
    authenticateUser,
    getMyReceivedAlerts
);


// GET /api/sos-alerts/sent
router.get(
    "/sent",
    authenticateUser,
    getMySentAlerts
);


// PUT /api/sos-alerts/:id/ack  (receiver acknowledges an alert)
router.put(
    "/:id/ack",
    authenticateUser,
    acknowledgeAlert
);


export default router;
