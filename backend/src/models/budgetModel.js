import db from "../config/db.js";


// Get all budgets owned by the user
// + budgets shared with the user's travel buddies

export const getBudgetsByUserID = async (userID) => {

    const result = await db.query(
        `
        SELECT
            b.*,
            u.username AS creator_username,

            COALESCE(SUM(e.amount), 0) AS spent,

            COALESCE(
                SUM(
                    CASE
                        WHEN e.expense_date = CURRENT_DATE
                        THEN e.amount
                        ELSE 0
                    END
                ),
                0
            ) AS spent_today

        FROM budgets b

        JOIN users u
            ON u.id = b.user_id

        LEFT JOIN expenses e
            ON e.budget_id = b.id

        WHERE
            b.user_id = $1

            OR

            (
                b.visibility = 'BUDDIES'

                AND EXISTS (
                    SELECT 1
                    FROM travel_buddies tb
                    WHERE
                        tb.user_id = b.user_id
                        AND tb.buddy_id = $1
                        AND tb.status = 'ACCEPTED'
                )
            )

        GROUP BY b.id, u.username

        ORDER BY b.created_at DESC
        `,
        [userID]
    );

    return result.rows;
};



// Get a single budget
// User can access it if:
// 1. They own it
// 2. It is shared with buddies and they are an accepted buddy

export const getBudgetById = async (id, userID) => {

    const result = await db.query(
        `
        SELECT
            b.*,
            u.username AS creator_username,

            COALESCE(SUM(e.amount), 0) AS spent,

            COALESCE(
                SUM(
                    CASE
                        WHEN e.expense_date = CURRENT_DATE
                        THEN e.amount
                        ELSE 0
                    END
                ),
                0
            ) AS spent_today

        FROM budgets b

        JOIN users u
            ON u.id = b.user_id

        LEFT JOIN expenses e
            ON e.budget_id = b.id

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

        GROUP BY b.id, u.username
        `,
        [id, userID]
    );

    return result.rows[0];
};



// Add a budget
// Only the owner creates the budget

export const addBudget = async (budget) => {

    const result = await db.query(
        `
        INSERT INTO budgets
        (
            trip_name,
            budget_type,
            amount,
            user_id,
            visibility
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
            budget.tripName,
            budget.budgetType,
            budget.amount,
            budget.userID,
            budget.visibility || "PRIVATE"
        ]
    );

    return result.rows[0];
};



// Update a budget
// Only the owner can edit it

export const updateBudget = async (
    id,
    userID,
    budget
) => {

    const result = await db.query(
        `
        UPDATE budgets

        SET
            trip_name = $1,
            budget_type = $2,
            amount = $3,
            visibility = $4

        WHERE
            id = $5
            AND user_id = $6
        `,
        [
            budget.tripName,
            budget.budgetType,
            budget.amount,
            budget.visibility || "PRIVATE",
            id,
            userID
        ]
    );

    return result.rowCount;
};



// Delete a budget
// Only the owner can delete it

export const deleteBudget = async (
    id,
    userID
) => {

    const result = await db.query(
        `
        DELETE FROM budgets

        WHERE
            id = $1
            AND user_id = $2
        `,
        [
            id,
            userID
        ]
    );

    return result.rowCount;
};