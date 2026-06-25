import express from 'express';
import { createGuru, getAllGurus, getPublicGurus, updateGuru, deleteGuru, getMyProfile, getGuruById } from '../controllers/admin/guruController.js';
import upload from '../middlewares/upload.js';
import { verifyToken, isAdmin, isGuru } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/public', getPublicGurus);

// Semua rute di bawah ini wajib login sesuai role.
router.post('/', verifyToken, isAdmin, upload.single('foto'), createGuru);
router.get('/', verifyToken, isAdmin, getAllGurus);
router.put('/:id', verifyToken, isAdmin, upload.single('foto'), updateGuru);
router.delete('/:id', verifyToken, isAdmin, deleteGuru);
router.get('/profile/me', verifyToken, isGuru, getMyProfile);
router.get('/:id', verifyToken, isAdmin, getGuruById);

export default router;
