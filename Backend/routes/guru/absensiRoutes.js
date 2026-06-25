import express from 'express';
import { simpanAbsensi, getJadwalMengajarGuru, getRiwayatAbsensiGuru, getDetailRiwayatAbsensiGuru } from '../../controllers/guru/absensiController.js';
import { verifyToken, isGuru } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Endpoint POST untuk menyimpan absensi
// Catatan: Aksesnya verifyToken saja, tidak perlu isAdmin, 
// karena yang mengisi ini adalah Guru Mapel.
router.post("/absensi", verifyToken, isGuru, simpanAbsensi);
router.get("/jadwal-saya", verifyToken, isGuru, getJadwalMengajarGuru);
router.get("/absensi/history/:mengajar_id", verifyToken, isGuru, getRiwayatAbsensiGuru);
router.get("/absensi/history/:mengajar_id/:pertemuan", verifyToken, isGuru, getDetailRiwayatAbsensiGuru);

export default router;
