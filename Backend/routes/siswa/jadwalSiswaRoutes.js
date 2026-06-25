import express from 'express';
import { getJadwalPelajaranSiswa } from '../../controllers/siswa/jadwalSiswaController.js';
import { verifyToken, isSiswa } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/jadwal-pelajaran", verifyToken, isSiswa, getJadwalPelajaranSiswa);

export default router;