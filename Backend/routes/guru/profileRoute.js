import express from 'express';
import { getProfileGuru, updateProfileGuru } from '../../controllers/guru/guruController.js'; 
import { verifyToken, isGuru } from '../../middlewares/authMiddleware.js';
import upload from '../../middlewares/upload.js';

const router = express.Router();

router.get('/guru', verifyToken, isGuru, getProfileGuru);
router.put('/guru', verifyToken, isGuru, upload.single('foto'), updateProfileGuru);

export default router;
