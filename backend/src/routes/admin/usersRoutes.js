import express from "express";

import { wrap } from "../../utils/adminQuery.js";
import {
    listUsers,
    getUser,
    suspendUser,
    unsuspendUser,
    setUserRole
} from "../../controllers/admin/usersController.js";


const router = express.Router();


// GET /api/admin/users
router.get(
    "/",
    wrap(listUsers)
);


// GET /api/admin/users/:id
router.get(
    "/:id",
    wrap(getUser)
);


// PATCH /api/admin/users/:id/suspend
router.patch(
    "/:id/suspend",
    wrap(suspendUser)
);


// PATCH /api/admin/users/:id/unsuspend
router.patch(
    "/:id/unsuspend",
    wrap(unsuspendUser)
);


// PATCH /api/admin/users/:id/role
router.patch(
    "/:id/role",
    wrap(setUserRole)
);


export default router;
