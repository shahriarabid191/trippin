import * as Budget from "../models/budgetModel.js";
import * as Expense from "../models/expenseModel.js";


// GET /api/budgets

export const getBudgets = async (req, res) => {

    try {

        const budgets = await Budget.getBudgetsByUserID(req.user.id);

        res.json(budgets);

    }
    catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

};



// GET /api/budgets/:id  (includes its expenses)

export const getBudget = async (req, res) => {

    try {

        const budget = await Budget.getBudgetById(req.params.id, req.user.id);

        if (!budget) {
            return res.status(404).json({
                message: "Budget not found"
            });
        }

        const expenses = await Expense.getExpensesByBudgetID(req.params.id, req.user.id);

        res.json({ ...budget, expenses });

    }
    catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

};



// POST /api/budgets

export const createBudget = async (req, res) => {

    const budget = await Budget.addBudget({
        tripName: req.body.tripName,
        budgetType: req.body.budgetType,
        amount: req.body.amount,
        userID: req.user.id
    });

    res.status(201)
        .json({
            message: "Budget created",
            budget
        });

};



// PUT /api/budgets/:id

export const editBudget = async (req, res) => {

    const updated =
        await Budget.updateBudget(
            req.params.id,
            req.user.id,
            req.body
        );


    if (updated === 0) {
        return res.status(404)
            .json({
                message: "Budget not found"
            });
    }


    res.json({
        message: "Updated successfully"
    });

};



// DELETE /api/budgets/:id

export const removeBudget = async (req, res) => {

    const deleted =
        await Budget.deleteBudget(
            req.params.id,
            req.user.id
        );


    if (deleted === 0) {
        return res.status(404)
            .json({
                message: "Budget not found"
            });
    }


    res.json({
        message: "Deleted successfully"
    });

};



// POST /api/budgets/:id/expenses

export const createExpense = async (req, res) => {

    const expense = await Expense.addExpense({
        budgetID: req.params.id,
        category: req.body.category,
        description: req.body.description,
        amount: req.body.amount,
        userID: req.user.id
    });

    res.status(201)
        .json({
            message: "Expense added",
            expense
        });

};



// DELETE /api/budgets/expenses/:expenseId

export const removeExpense = async (req, res) => {

    const deleted =
        await Expense.deleteExpense(
            req.params.expenseId,
            req.user.id
        );


    if (deleted === 0) {
        return res.status(404)
            .json({
                message: "Expense not found"
            });
    }


    res.json({
        message: "Deleted successfully"
    });

}; 