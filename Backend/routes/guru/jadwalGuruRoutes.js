import express from 'express';
import { getJadwalPribadi } from '../../controllers/guru/jadwalGuruController.js';
import { verifyToken, isGuru } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Endpoint GET: Menarik jadwal mengajar khusus guru yang sedang login
router.get("/jadwal-mengajar", verifyToken, isGuru, getJadwalPribadi);

export default router;