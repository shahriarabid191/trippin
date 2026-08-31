import express from "express";
import { wrap } from "../../utils/adminQuery.js";
import {
    listUsers,
    getUser,
    suspendUser,
    unsuspendUser,
    setUserRole,
} from "../../controllers/admin/usersController.js";

const router = express.Router();

router.get("/", wrap(listUsers));
router.get("/:id", wrap(getUser));
router.patch("/:id/suspend", wrap(suspendUser));
router.patch("/:id/unsuspend", wrap(unsuspendUser));
router.patch("/:id/role", wrap(setUserRole));

export default router;
