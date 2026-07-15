import express from 'express';
import { loginUser } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', loginUser);

// You will eventually add a register route here!
// router.post('/register', registerUser);

export default router;