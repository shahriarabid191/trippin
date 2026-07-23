import express from "express";

import {
    getBudgets,
    getBudget,
    createBudget,
    editBudget,
    removeBudget,
    createExpense,
    removeExpense

} from "../controllers/budgetController.js";

import { authenticateUser } from "../middlewares/authMiddleware.js";


const router = express.Router();


// GET /api/budgets
router.get(
    "/",
    authenticateUser,
    getBudgets
);


// POST /api/budgets
router.post(
    "/",
    authenticateUser,
    createBudget
);


// GET /api/budgets/:id
router.get(
    "/:id",
    authenticateUser,
    getBudget
);


// PUT /api/budgets/:id
router.put(
    "/:id",
    authenticateUser,
    editBudget
);


// DELETE /api/budgets/:id
router.delete(
    "/:id",
    authenticateUser,
    removeBudget
);


// POST /api/budgets/:id/expenses
router.post(
    "/:id/expenses",
    authenticateUser,
    createExpense
);


// DELETE /api/budgets/expenses/:expenseId
router.delete(
    "/expenses/:expenseId",
    authenticateUser,
    removeExpense
);


export default router; 