import express from 'express';
import { simpanNilai, getNilai, downloadTemplateExcel } from '../../controllers/guru/nilaiController.js';
import { verifyToken, isGuru } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Endpoint POST: Menyimpan nilai (Tugas, PH, PTS, PAS)
router.post("/nilai", verifyToken, isGuru, simpanNilai);
router.get("/nilai", verifyToken, isGuru, getNilai);
router.get('/nilai/template', verifyToken, isGuru, downloadTemplateExcel);

export default router;