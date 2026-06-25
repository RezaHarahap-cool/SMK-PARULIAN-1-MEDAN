import express from 'express';
import { createJurusan, getAllJurusan, updateJurusan, deleteJurusan } from '../controllers/admin/jurusanController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rute POST (Tambah Data Jurusan)
// Endpoint: POST http://localhost:3000/api/admin/jurusan
router.post('/', verifyToken, isAdmin, createJurusan);

// Rute GET (Tampil Semua Data Jurusan)
// Endpoint: GET http://localhost:3000/api/admin/jurusan
router.get('/', verifyToken, isAdmin, getAllJurusan);
router.put('/:id', verifyToken, isAdmin, updateJurusan);
router.delete('/:id', verifyToken, isAdmin, deleteJurusan);
export default router;