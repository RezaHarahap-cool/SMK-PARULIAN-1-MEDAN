import express from 'express';
// Jangan lupa tambahkan cekStatusWA di dalam kurung kurawal ini:
import { generateRekapHarian, kirimLaporanWA, cekStatusWA, aktifkanWA, nonaktifkanWA } from '../../controllers/guru/laporanHarianController.js';
import { verifyToken, isGuru } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/laporan-harian", verifyToken, isGuru, generateRekapHarian);
router.post("/kirim-wa", verifyToken, isGuru, kirimLaporanWA); 
router.get("/status-wa", verifyToken, isGuru, cekStatusWA); // <--- RUTE BARU UNTUK CEK BARCODE
router.post("/aktifkan-wa", verifyToken, isGuru, aktifkanWA);
router.post("/nonaktifkan-wa", verifyToken, isGuru, nonaktifkanWA);

export default router;
