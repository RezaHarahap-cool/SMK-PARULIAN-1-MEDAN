import express from 'express';
import { getAlumni } from '../controllers/admin/alumniController.js';
// Pastikan path import middleware ini sesuai dengan struktur folder-mu
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Endpoint untuk menarik data Alumni
// Rute: GET /api/alumni
router.get('/', verifyToken, isAdmin, getAlumni);

export default router;