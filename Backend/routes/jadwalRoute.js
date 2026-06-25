import express from 'express';
import { 
  createJadwal, 
  getJadwal, 
  deleteJadwal,
  getJadwalById, // Import controller baru
  updateJadwal   // Import controller baru
} from '../controllers/admin/jadwalController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Daftar Rute Roster
router.get('/', verifyToken, getJadwal);
router.get('/:id', verifyToken, getJadwalById); // Endpoint Detail
router.post('/', verifyToken, isAdmin, createJadwal);
router.put('/:id', verifyToken, isAdmin, updateJadwal); // Endpoint Edit
router.delete('/:id', verifyToken, isAdmin, deleteJadwal);

export default router;