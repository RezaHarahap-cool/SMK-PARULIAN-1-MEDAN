import express from 'express';
import { getSemesters, aktifkanSemester, tambahSemester } from '../controllers/admin/semesterController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Endpoint untuk mengambil semua daftar semester (Method: GET)
router.get("/semesters", verifyToken, isAdmin, getSemesters);

// Endpoint untuk mengaktifkan semester tertentu (Method: PATCH/PUT)
router.patch("/semesters/:id_semester/aktifkan", verifyToken, isAdmin, aktifkanSemester);
router.post("/semesters", verifyToken, isAdmin, tambahSemester);

// Gunakan export default ESM modern, BUKAN module.exports
export default router;