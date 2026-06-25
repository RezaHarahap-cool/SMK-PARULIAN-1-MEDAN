import express from 'express';
import { getProfileSiswa, updateProfileSiswa } from '../../controllers/siswa/siswaController.js'; 
import { verifyToken, isSiswa } from '../../middlewares/authMiddleware.js';
import upload from '../../middlewares/upload.js';

const router = express.Router();

router.get('/', verifyToken, isSiswa, getProfileSiswa);
router.put('/', verifyToken, isSiswa, upload.single('foto'), updateProfileSiswa);

export default router;
