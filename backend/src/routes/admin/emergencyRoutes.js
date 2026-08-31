import express from "express";
import { wrap } from "../../utils/adminQuery.js";
import {
    listAlerts,
    alertSummary,
    acknowledgeAlert,
    resolveAlert,
    reopenAlert,
} from "../../controllers/admin/emergencyController.js";

const router = express.Router();

router.get("/alerts", wrap(listAlerts));
router.get("/summary", wrap(alertSummary));
router.patch("/alerts/:id/acknowledge", wrap(acknowledgeAlert));
router.patch("/alerts/:id/resolve", wrap(resolveAlert));
router.patch("/alerts/:id/reopen", wrap(reopenAlert));

export default router;
