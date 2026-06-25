import express from 'express';
import { createMapel, getAllMapel, updateMapel, deleteMapel } from '../controllers/admin/mapelController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Jalur POST untuk tambah mapel (Wajib Login & Harus Admin)
router.post('/', verifyToken, isAdmin, createMapel);
router.get('/', verifyToken, getAllMapel);
// Rute PUT (Edit Mapel)
router.put('/:id', verifyToken, isAdmin, updateMapel);

// Rute DELETE (Hapus Mapel)
router.delete('/:id', verifyToken, isAdmin, deleteMapel);

export default router;