import express from 'express';
// Pastikan fungsi updateKelas di-import di baris ini
import { getAllKelas, createKelas, updateKelas, deleteKelas } from '../controllers/admin/kelasController.js'; 
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getAllKelas);
router.post('/', verifyToken, isAdmin, createKelas);
router.put('/:id', verifyToken, isAdmin, updateKelas); // <-- Tambahkan rute ini
router.delete('/:id', verifyToken, isAdmin, deleteKelas);

export default router;