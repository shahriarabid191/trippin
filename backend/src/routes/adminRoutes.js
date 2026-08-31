import express from "express";

import {
    authenticateUser,
    authorizeAdmin,
    authorizeModerator
} from "../middlewares/authMiddleware.js";

import dashboardRoutes from "./admin/dashboardRoutes.js";
import emergencyRoutes from "./admin/emergencyRoutes.js";
import listingsRoutes from "./admin/listingsRoutes.js";
import bookingsRoutes from "./admin/bookingsRoutes.js";
import usersRoutes from "./admin/usersRoutes.js";
import moderationRoutes from "./admin/moderationRoutes.js";
import aiRoutes from "./admin/aiRoutes.js";
import simShopsRoutes from "./admin/simShopsRoutes.js";


// =====================================================================
// /api/admin  — unified admin panel API.
//
// Two access tiers:
//   authorizeModerator  ->  emergency monitoring + content moderation
//   authorizeAdmin      ->  everything (dashboard, listings, bookings,
//                           users, AI oversight)
//
// The frontend route guard mirrors this, but each sub-router is
// independently protected here so the API is safe on its own.
// =====================================================================


const router = express.Router();


// Every /api/admin/* route requires a logged-in account.
router.use(authenticateUser);


// ---- Moderator + Admin ----

router.use(
    "/emergency",
    authorizeModerator,
    emergencyRoutes
);


router.use(
    "/moderation",
    authorizeModerator,
    moderationRoutes
);


// ---- Admin only ----

router.use(
    "/dashboard",
    authorizeAdmin,
    dashboardRoutes
);


router.use(
    "/listings",
    authorizeAdmin,
    listingsRoutes
);


router.use(
    "/sim-shops",
    authorizeAdmin,
    simShopsRoutes
);


router.use(
    "/bookings",
    authorizeAdmin,
    bookingsRoutes
);


router.use(
    "/users",
    authorizeAdmin,
    usersRoutes
);


router.use(
    "/ai",
    authorizeAdmin,
    aiRoutes
);


// GET /api/admin/whoami  (identity probe for the frontend guard)
router.get("/whoami", (req, res) => {
    res.json({
        id: req.user.id,
        role: req.user.role
    });
});


export default router;
