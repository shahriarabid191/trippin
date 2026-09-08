import * as Todo from "../models/todoModel.js";


// GET /api/todos
export const getTodos = async (req, res) => {
    try {
        const todos = await Todo.getTodosByUserID(req.user.id);

        return res.status(200).json(todos);
    }
    catch (error) {
        console.error("Error getting todos:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// POST /api/todos
export const createTodo = async (req, res) => {
    try {
        const { title } = req.body;

        // Validation: title is required
        if (title === undefined || title === null || title === "") {
            return res.status(400).json({
                message: "Title is required"
            });
        }

        // Validation: title must be a string
        if (typeof title !== "string") {
            return res.status(400).json({
                message: "Title must be a string"
            });
        }

        // Validation: title cannot contain only whitespace
        if (title.trim().length === 0) {
            return res.status(400).json({
                message: "Title cannot be empty"
            });
        }

        const todo = await Todo.addTodo({
            title: title.trim(),
            userID: req.user.id
        });

        return res.status(201).json({
            message: "Todo created",
            todo
        });
    }
    catch (error) {
        console.error("Error creating todo:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// DELETE /api/todos/:id
export const removeTodo = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                message: "Invalid todo ID"
            });
        }

        const deleted = await Todo.deleteTodo(
            id,
            req.user.id
        );

        if (deleted === 0) {
            return res.status(404).json({
                message: "Todo not found"
            });
        }

        return res.status(200).json({
            message: "Deleted successfully"
        });
    }
    catch (error) {
        console.error("Error deleting todo:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// PUT /api/todos/:id
export const editTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, completed } = req.body;

        // Validate ID
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                message: "Invalid todo ID"
            });
        }

        // Validate title
        if (title === undefined || title === null || title === "") {
            return res.status(400).json({
                message: "Title is required"
            });
        }

        if (typeof title !== "string") {
            return res.status(400).json({
                message: "Title must be a string"
            });
        }

        if (title.trim().length === 0) {
            return res.status(400).json({
                message: "Title cannot be empty"
            });
        }

        // Validate completed
        if (typeof completed !== "boolean") {
            return res.status(400).json({
                message: "Completed must be a boolean"
            });
        }

        const updated = await Todo.updateTodo(
            id,
            req.user.id,
            {
                title: title.trim(),
                completed
            }
        );

        if (updated === 0) {
            return res.status(404).json({
                message: "Todo not found"
            });
        }

        return res.status(200).json({
            message: "Updated successfully"
        });
    }
    catch (error) {
        console.error("Error updating todo:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};