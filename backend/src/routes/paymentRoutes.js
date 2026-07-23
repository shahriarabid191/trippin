import express from 'express';
import { processPayment } from '../controllers/paymentController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

// POST /api/payments/process  -> only logged-in users can pay & book
router.post('/process', authenticateUser, processPayment);

export default router;
