import db from "../config/db.js";

// Get all expenses for a budget
export const getExpensesByBudgetID = async (budgetID, userID) => {
    const result = await db.query(
        "SELECT * FROM expenses WHERE budget_id=$1 AND user_id=$2 ORDER BY expense_date DESC, created_at DESC",
        [budgetID, userID]
    );
    return result.rows;
};

// Add an expense
export const addExpense = async (expense) => {
    const result = await db.query(
        `
        INSERT INTO expenses(budget_id, category, description, amount, user_id)
        VALUES($1,$2,$3,$4,$5)
        RETURNING *
        `,
        [expense.budgetID, expense.category, expense.description, expense.amount, expense.userID]
    );
    return result.rows[0];
};

// Delete an expense
export const deleteExpense = async (id, userID) => {
    const result = await db.query(
        "DELETE FROM expenses WHERE id=$1 AND user_id=$2",
        [id, userID]
    );
    return result.rowCount;
}; 