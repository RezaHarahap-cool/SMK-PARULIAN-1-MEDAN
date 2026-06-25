import express from 'express';
import { getAllBerita, createBerita, getBeritaById, updateBerita, deleteBerita } from '../controllers/admin/beritaController.js';
import upload from '../middlewares/upload.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllBerita);
router.post('/', verifyToken, isAdmin, upload.single('foto'), createBerita);
router.get('/:id', getBeritaById);
router.put('/:id', verifyToken, isAdmin, upload.single('foto'), updateBerita);

// Rute Hapus (DELETE)
router.delete('/:id', verifyToken, isAdmin, deleteBerita);

export default router;
