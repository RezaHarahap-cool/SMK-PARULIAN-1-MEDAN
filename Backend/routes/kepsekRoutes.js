import express from 'express';
import { createKepsek, getAllKepsek, getKepsekById, updateKepsek, deleteKepsek } from '../controllers/admin/kepsekController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

// Asumsi middleware upload fotomu bernama upload
import upload from '../middlewares/upload.js'; // Sesuaikan path ini dengan lokasimu

const router = express.Router();

// Rute POST (Tambah Kepsek dengan Upload Foto)
router.post('/', verifyToken, isAdmin, upload.single('foto'), createKepsek);

// Rute GET (Tarik Semua Data)
router.get('/', verifyToken, isAdmin, getAllKepsek);
router.get('/:id', verifyToken, isAdmin, getKepsekById);
router.put('/:id', verifyToken, isAdmin, upload.single('foto'), updateKepsek);
router.delete('/:id', verifyToken, isAdmin, deleteKepsek);

export default router;