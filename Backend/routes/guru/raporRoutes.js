import express from 'express';
import { getKelasMengajar, getRekapNilaiKelas, finalisasiRaporKelas } from '../../controllers/guru/raporController.js';
import { verifyToken, isGuru } from '../../middlewares/authMiddleware.js'; 

const router = express.Router();

// 1. Tarik menu dropdown kelas
router.get('/mengajar-list', verifyToken, isGuru, getKelasMengajar);

// 2. Tarik tabel rekap (menggunakan parameter ID mengajar)
router.get('/rekap-nilai/:mengajar_id', verifyToken, isGuru, getRekapNilaiKelas);

// 3. Eksekusi penguncian nilai
router.post('/finalisasi-massal', verifyToken, isGuru, finalisasiRaporKelas);

export default router;