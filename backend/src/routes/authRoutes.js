import express from 'express';
import { loginUser, registerUser } from '../controllers/authController.js'; // <-- Add curly braces here!

const router = express.Router();

// POST /api/auth/login
router.post('/login', loginUser);

// POST /api/auth/register
router.post('/register', registerUser);

export default router;