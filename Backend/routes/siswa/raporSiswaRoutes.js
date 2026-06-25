import express from 'express';
import { getRaporSiswa } from '../../controllers/siswa/raporSiswaController.js';
import { verifyToken, isSiswa } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/rapor', verifyToken, isSiswa, getRaporSiswa);

export default router;
