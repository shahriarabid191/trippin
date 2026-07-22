import db from "../config/db.js";

// Get all budgets for a user, with total spent and today's spent calculated
export const getBudgetsByUserID = async (userID) => {
    const result = await db.query(
        `
        SELECT b.*,
            COALESCE(SUM(e.amount),0) AS spent,
            COALESCE(SUM(CASE WHEN e.expense_date = CURRENT_DATE THEN e.amount ELSE 0 END),0) AS spent_today
        FROM budgets b
        LEFT JOIN expenses e ON e.budget_id = b.id
        WHERE b.user_id=$1
        GROUP BY b.id
        ORDER BY b.created_at DESC
        `,
        [userID]
    );
    return result.rows;
};

// Get a single budget (with totals)
export const getBudgetById = async (id, userID) => {
    const result = await db.query(
        `
        SELECT b.*,
            COALESCE(SUM(e.amount),0) AS spent,
            COALESCE(SUM(CASE WHEN e.expense_date = CURRENT_DATE THEN e.amount ELSE 0 END),0) AS spent_today
        FROM budgets b
        LEFT JOIN expenses e ON e.budget_id = b.id
        WHERE b.id=$1 AND b.user_id=$2
        GROUP BY b.id
        `,
        [id, userID]
    );
    return result.rows[0];
};

// Add a budget
export const addBudget = async (budget) => {
    const result = await db.query(
        `
        INSERT INTO budgets(trip_name, budget_type, amount, user_id)
        VALUES($1,$2,$3,$4)
        RETURNING *
        `,
        [budget.tripName, budget.budgetType, budget.amount, budget.userID]
    );
    return result.rows[0];
};

// Update a budget
export const updateBudget = async (id, userID, budget) => {
    const result = await db.query(
        `
        UPDATE budgets
        SET trip_name=$1, budget_type=$2, amount=$3
        WHERE id=$4 AND user_id=$5
        `,
        [budget.tripName, budget.budgetType, budget.amount, id, userID]
    );
    return result.rowCount;
}; 

// Delete a budget (expenses under it are auto-deleted by the DB)
export const deleteBudget = async (id, userID) => {
    const result = await db.query(
        "DELETE FROM budgets WHERE id=$1 AND user_id=$2",
        [id, userID]
    );
    return result.rowCount;
}; 