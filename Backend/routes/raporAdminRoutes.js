import express from 'express';
import { getDataCetakRapor, getSiswaSiapCetakByKelas } from '../controllers/admin/raporAdminController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route untuk menarik data cetak berdasarkan ID Riwayat Kelas Siswa
router.get('/cetak-rapor/:riwayat_id', verifyToken, isAdmin, getDataCetakRapor);
router.get('/siswa-siap-cetak/:kelas_id', verifyToken, isAdmin, getSiswaSiapCetakByKelas);

export default router;