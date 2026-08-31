import express from "express";

import { wrap } from "../../utils/adminQuery.js";
import {
    listShops,
    shopsSummary,
    createShop,
    updateShop,
    approveShop,
    rejectShop,
    setShopActive,
    deleteShop
} from "../../controllers/admin/simShopsController.js";


const router = express.Router();


// GET /api/admin/sim-shops
router.get(
    "/",
    wrap(listShops)
);


// GET /api/admin/sim-shops/summary
router.get(
    "/summary",
    wrap(shopsSummary)
);


// POST /api/admin/sim-shops
router.post(
    "/",
    wrap(createShop)
);


// PUT /api/admin/sim-shops/:id
router.put(
    "/:id",
    wrap(updateShop)
);


// PATCH /api/admin/sim-shops/:id/approve
router.patch(
    "/:id/approve",
    wrap(approveShop)
);


// PATCH /api/admin/sim-shops/:id/reject
router.patch(
    "/:id/reject",
    wrap(rejectShop)
);


// PATCH /api/admin/sim-shops/:id/active
router.patch(
    "/:id/active",
    wrap(setShopActive)
);


// DELETE /api/admin/sim-shops/:id
router.delete(
    "/:id",
    wrap(deleteShop)
);


export default router;
