import express from 'express';
import { getRaporPendukungWali, saveRaporPendukungWali } from '../../controllers/guru/raporWaliController.js';
import { verifyToken, isGuru } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/rapor-pendukung', verifyToken, isGuru, getRaporPendukungWali);
router.post('/rapor-pendukung', verifyToken, isGuru, saveRaporPendukungWali);

export default router;
