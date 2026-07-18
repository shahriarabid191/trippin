import express from "express";

import {
    getTodos,
    createTodo,
    removeTodo,
    editTodo

} from "../controllers/todoController.js";

import { authenticateUser } from "../middlewares/authMiddleware.js";


const router = express.Router();


// GET /api/todos
router.get(
    "/",
    authenticateUser,
    getTodos
);


// POST /api/todos
router.post(
    "/",
    authenticateUser,
    createTodo
);


// DELETE /api/todos/:id
router.delete(
    "/:id",
    authenticateUser,
    removeTodo
);


// PUT /api/todos/:id
router.put(
    "/:id",
    authenticateUser,
    editTodo
);


export default router;