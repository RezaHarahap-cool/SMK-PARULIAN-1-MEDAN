import express from 'express';
import { getAllSiswa, createSiswa, getSiswaById, updateSiswa, deleteSiswa } from '../controllers/admin/siswaController.js';
import upload from '../middlewares/upload.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rute Tampil Data Siswa (Hanya admin/kepsek/guru yang berhak melihat)
router.get('/', verifyToken, getAllSiswa);
router.post('/', verifyToken, isAdmin, upload.single('foto'), createSiswa);
router.get('/:id', verifyToken, getSiswaById);
router.put('/:id', verifyToken, isAdmin, upload.single('foto'), updateSiswa);
router.delete('/:id', verifyToken, isAdmin, deleteSiswa);

export default router;