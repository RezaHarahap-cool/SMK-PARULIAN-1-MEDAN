import express from 'express';
import { getDashboardSummary } from '../controllers/admin/dashboardController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rute ini aman dibuka oleh admin, guru, atau kepsek (sesuaikan dengan kebutuhanmu)
router.get('/', verifyToken, getDashboardSummary);

export default router;