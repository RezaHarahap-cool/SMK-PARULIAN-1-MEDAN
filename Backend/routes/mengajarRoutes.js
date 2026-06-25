import express from 'express';
import { getMengajar, tambahMengajar, updateMengajar, deleteMengajar } from '../controllers/admin/mengajarController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Endpoint untuk melihat daftar plotting jadwal mengajar
router.get("/mengajar", verifyToken, isAdmin, getMengajar);

// Endpoint untuk menambahkan tugas mengajar baru
router.post("/mengajar", verifyToken, isAdmin, tambahMengajar);
router.put("/mengajar/:id_mengajar", verifyToken, isAdmin, updateMengajar);
router.delete("/mengajar/:id_mengajar", verifyToken, isAdmin, deleteMengajar);

export default router;