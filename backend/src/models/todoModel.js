import db from "../config/db.js";

// Get all todos of a user
export const getTodosByUserID = async (userID) => {
    const result = await db.query(
        "SELECT * FROM todos WHERE user_id=$1",
        [userID]
    );
    return result.rows;
};

// Delete todo
export const deleteTodo = async (id, userID) => {
    const result = await db.query(
        "DELETE FROM todos WHERE id=$1 AND user_id=$2",
        [id, userID]
    );
    return result.rowCount;
};

// Add todo
export const addTodo = async (todo) => {
    const result = await db.query(
        `
        INSERT INTO todos(title,user_id)
        VALUES($1,$2)
        RETURNING *
        `,
        [todo.title, todo.userID]
    );
    return result.rows[0];
};

// Update todo
export const updateTodo = async (id, userID, todo) => {
    const result = await db.query(
        `
        UPDATE todos
        SET title=$1, completed=$2
        WHERE id=$3 AND user_id=$4
        `,
        [todo.title, todo.completed, id, userID]
    );
    return result.rowCount;
};