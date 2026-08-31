import express from "express";

import { wrap } from "../../utils/adminQuery.js";
import {
    listAlerts,
    alertSummary,
    acknowledgeAlert,
    resolveAlert,
    reopenAlert
} from "../../controllers/admin/emergencyController.js";


const router = express.Router();


// GET /api/admin/emergency/alerts
router.get(
    "/alerts",
    wrap(listAlerts)
);


// GET /api/admin/emergency/summary
router.get(
    "/summary",
    wrap(alertSummary)
);


// PATCH /api/admin/emergency/alerts/:id/acknowledge
router.patch(
    "/alerts/:id/acknowledge",
    wrap(acknowledgeAlert)
);


// PATCH /api/admin/emergency/alerts/:id/resolve
router.patch(
    "/alerts/:id/resolve",
    wrap(resolveAlert)
);


// PATCH /api/admin/emergency/alerts/:id/reopen
router.patch(
    "/alerts/:id/reopen",
    wrap(reopenAlert)
);


export default router;
