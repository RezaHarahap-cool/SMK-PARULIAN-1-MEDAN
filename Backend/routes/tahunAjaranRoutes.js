import express from 'express';
import { 
  createTahunAjaran, 
  getAllTahunAjaran, 
  updateTahunAjaran, 
  deleteTahunAjaran 
} from '../controllers/admin/tahunAjaranController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Endpoint: /api/admin/tahun-ajaran
router.post('/', verifyToken, isAdmin, createTahunAjaran);
router.get('/', verifyToken, isAdmin, getAllTahunAjaran);
router.put('/:id', verifyToken, isAdmin, updateTahunAjaran);
router.delete('/:id', verifyToken, isAdmin, deleteTahunAjaran);

export default router;