import express from 'express';
import { loginActor, forgotPassword, resetPassword } from '../controllers/authController.js';

const router = express.Router();

// Endpoint untuk login: POST /api/auth/login
router.post('/login', loginActor);
router.post('/forgot-password', forgotPassword); // Menerima { email: "..." }
router.post('/reset-password/:token', resetPassword);

export default router;