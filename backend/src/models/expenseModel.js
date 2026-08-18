import db from "../config/db.js";


// Check whether a user has access to a budget
// Access is granted if:
// 1. User owns the budget
// 2. Budget is shared with buddies and user is an accepted buddy

export const userCanAccessBudget = async (budgetID, userID) => {

    const result = await db.query(
        `
        SELECT b.id

        FROM budgets b

        WHERE
            b.id = $1

            AND

            (
                b.user_id = $2

                OR

                (
                    b.visibility = 'BUDDIES'

                    AND EXISTS (
                        SELECT 1
                        FROM travel_buddies tb
                        WHERE
                            tb.user_id = b.user_id
                            AND tb.buddy_id = $2
                            AND tb.status = 'ACCEPTED'
                    )
                )
            )
        `,
        [budgetID, userID]
    );

    return result.rows.length > 0;
};



// Get all expenses for a budget
// Owner + accepted buddies can view expenses

export const getExpensesByBudgetID = async (
    budgetID,
    userID
) => {

    const hasAccess =
        await userCanAccessBudget(
            budgetID,
            userID
        );

    if (!hasAccess) {
        return [];
    }


    const result = await db.query(
        `
        SELECT
            e.*,
            u.username

        FROM expenses e

        JOIN users u
            ON e.user_id = u.id

        WHERE
            e.budget_id = $1

        ORDER BY
            e.expense_date DESC,
            e.created_at DESC
        `,
        [budgetID]
    );

    return result.rows;
};



// Add an expense
// Owner + accepted buddies can add expenses

export const addExpense = async (expense) => {

    const hasAccess =
        await userCanAccessBudget(
            expense.budgetID,
            expense.userID
        );

    if (!hasAccess) {

        throw new Error(
            "You do not have access to this budget"
        );

    }


    const result = await db.query(
        `
        INSERT INTO expenses
        (
            budget_id,
            category,
            description,
            amount,
            user_id
        )

        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5
        )

        RETURNING *
        `,
        [
            expense.budgetID,
            expense.category,
            expense.description,
            expense.amount,
            expense.userID
        ]
    );

    return result.rows[0];
};



// Delete an expense
// Only the user who created the expense can delete it

export const deleteExpense = async (
    id,
    userID
) => {

    const result = await db.query(
        `
        DELETE FROM expenses

        WHERE
            id = $1
            AND user_id = $2

        RETURNING *
        `,
        [
            id,
            userID
        ]
    );

    return result.rowCount;
};