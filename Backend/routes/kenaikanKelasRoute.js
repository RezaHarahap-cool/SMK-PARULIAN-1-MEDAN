import express from 'express';
import { getSiswa, prosesKenaikanKelas } from '../controllers/admin/kenaikanKelasController.js';
// Pastikan path import middleware ini sesuai dengan struktur folder-mu
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Endpoint untuk memproses kenaikan kelas secara massal
// Rute: POST /api/kenaikan-kelas
router.get('/siswa', verifyToken, isAdmin, getSiswa);
router.post('/', verifyToken, isAdmin, prosesKenaikanKelas);

export default router;
