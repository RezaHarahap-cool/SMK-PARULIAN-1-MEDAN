import express from 'express';
import { getProfileKepsek, updateProfileKepsek } from '../../controllers/kepala_sekolah/profileController.js';
import { verifyToken, isKepsek } from '../../middlewares/authMiddleware.js';
import upload from '../../middlewares/upload.js';

const router = express.Router();

// Endpoint GET: Menarik data profil Kepsek yang sedang login
// URL asli nantinya: /api/my-profile/kepsek
router.get("/", verifyToken, isKepsek, getProfileKepsek);
router.put("/", verifyToken, isKepsek, upload.single('foto'), updateProfileKepsek);

export default router;
