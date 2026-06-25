import express from 'express';
// Tambahkan getDetailAbsensiMapel di import ini
import { getAbsensiSiswa, getDetailAbsensiMapel } from '../../controllers/siswa/absensiController.js';
import { verifyToken, isSiswa } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/riwayat-absensi", verifyToken, isSiswa, getAbsensiSiswa);

// ENDPOINT BARU: Tarik detail per mapel
router.get("/riwayat-absensi/:mengajar_id", verifyToken, isSiswa, getDetailAbsensiMapel);

export default router;