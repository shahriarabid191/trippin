import * as Todo from "../models/todoModel.js";


// GET /api/todos

export const getTodos = async (req, res) => {

    try {

        const todos = await Todo.getTodosByUserID(req.user.id);

        res.json(todos);

    }
    catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

};



// POST /api/todos

export const createTodo = async (req, res) => {

    const todo = await Todo.addTodo({
        title: req.body.title,
        userID: req.user.id
    });

    res.status(201)
        .json({
            message: "Todo created",
            todo
        });

};



// DELETE /api/todos/:id

export const removeTodo = async (req, res) => {

    const deleted =
        await Todo.deleteTodo(
            req.params.id,
            req.user.id
        );


    if (deleted === 0) {
        return res.status(404)
            .json({
                message: "Todo not found"
            });
    }


    res.json({
        message: "Deleted successfully"
    });

};



// PUT /api/todos/:id

export const editTodo = async (req, res) => {

    const updated =
        await Todo.updateTodo(
            req.params.id,
            req.user.id,
            req.body
        );


    if (updated === 0) {
        return res.status(404)
            .json({
                message: "Todo not found"
            });
    }


    res.json({
        message: "Updated successfully"
    });

};