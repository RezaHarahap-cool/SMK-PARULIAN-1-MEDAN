import express from 'express';
import { getKepsekDashboardSummary } from '../../controllers/kepala_sekolah/kepsekDashboardController.js'; 
import { verifyToken, isKepsek } from '../../middlewares/authMiddleware.js'; // Sesuaikan dengan nama middleware auth-mu

const router = express.Router();

router.get('/', verifyToken, isKepsek, getKepsekDashboardSummary);

export default router;