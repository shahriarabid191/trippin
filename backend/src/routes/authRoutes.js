import express from 'express';
import { loginUser, registerUser, getMe, logoutUser } from '../controllers/authController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();


// POST /api/auth/login
router.post('/login', loginUser);


// POST /api/auth/register
router.post('/register', registerUser);


// GET /api/auth/me
router.get('/me', authenticateUser, getMe);


router.post('/logout', logoutUser);

export default router;