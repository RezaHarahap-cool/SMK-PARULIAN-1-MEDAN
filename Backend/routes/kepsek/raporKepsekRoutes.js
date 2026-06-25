import express from 'express';
import { 
  getDaftarRaporPending, 
  getDetailRaporKelasPending, 
  accRaporKelasMassal 
} from '../../controllers/kepala_sekolah/raporKepsekController.js';
import { verifyToken, isKepsek } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// 1. Endpoint mendapatkan daftar kelas yang menanti persetujuan
router.get('/pending-list', verifyToken, isKepsek, getDaftarRaporPending);

// 2. Endpoint melihat rincian nilai siswa di dalam kelas tersebut sebelum di-ACC
router.get('/pending-detail/:mengajar_id', verifyToken, isKepsek, getDetailRaporKelasPending);

// 3. Endpoint tombol eksekusi ACC Massal satu kelas
router.post('/approve-kelas', verifyToken, isKepsek, accRaporKelasMassal);

export default router;