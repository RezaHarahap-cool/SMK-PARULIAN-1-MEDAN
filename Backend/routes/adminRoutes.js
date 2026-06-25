import express from 'express';
// Tambahkan getAllAdmins di import ini
import { createAdmin, getAllAdmins, getMyProfile, updateMyProfile, deleteAdmin } from '../controllers/admin/adminController.js'; 
import upload from '../middlewares/upload.js';

import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';
const router = express.Router();

// Route untuk MENAMBAH data (Method: POST)
router.post('/', upload.single('foto'), createAdmin);

// Route untuk MENAMPILKAN data (Method: GET)
router.get('/', verifyToken, isAdmin, getAllAdmins);
router.get('/profile', verifyToken, isAdmin, getMyProfile);
router.put('/profile', verifyToken, isAdmin, upload.single('foto'), updateMyProfile);
router.delete('/:id', verifyToken, isAdmin, deleteAdmin);

export default router;