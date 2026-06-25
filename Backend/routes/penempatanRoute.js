import express from 'express';
import { getSiswaBelumAdaKelas, bulkInsertPenempatan } from '../controllers/admin/penempatanController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 1. Rute untuk mendapatkan daftar siswa "Nganggur" (Belum masuk kelas)
router.get('/tanpa-kelas', verifyToken, isAdmin, getSiswaBelumAdaKelas);

// 2. Rute untuk mengeksekusi penempatan massal
router.post('/bulk-insert', verifyToken, isAdmin, bulkInsertPenempatan);

export default router;