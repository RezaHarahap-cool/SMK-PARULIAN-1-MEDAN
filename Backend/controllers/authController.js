import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendResetPasswordEmail } from '../services/emailService.js';
import { randomBytes } from 'crypto';

export const loginActor = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Username atau Email tidak terdaftar!" });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: "Akun ini sedang dinonaktifkan." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Password yang dimasukkan salah!" });
    }

    const payload = {
      id_users: user.id_users,
      role: user.role
    };

    // PERUBAHAN DI SINI: Kita panggil process.env.JWT_SECRET
    // Kalau di .env tidak terbaca, dia akan pakai 'fallback_secret' agar aplikasi tidak mati
    const secretKey = process.env.JWT_SECRET || 'fallback_secret';
    const token = jwt.sign(payload, secretKey, { expiresIn: '1d' });

    res.status(200).json({
      success: true,
      message: "Login berhasil!",
      token: token,
      data: {
        id_users: user.id_users,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Error saat login:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
  }
};

// ==========================================
// 1. API PERMINTAAN LUPA PASSWORD (KIRIM EMAIL)
// ==========================================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Cari user berdasarkan email
    const user = await prisma.user.findFirst({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ success: false, message: "Alamat email tidak ditemukan." });
    }

    // 2. Buat Token Rahasia (Acak 32 karakter)
    // PERBAIKAN: Hapus "crypto." karena sudah di-import langsung fungsinya
    const resetToken = randomBytes(32).toString('hex');
    
    // 3. Set waktu kadaluarsa (15 menit dari sekarang)
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // 4. Simpan token dan batas waktu ke database user tersebut
    await prisma.user.update({
      where: { id_users: user.id_users },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: tokenExpiry
      }
    });

    // 5. Kirim Email (memanggil fungsi dari emailService.js yang kita buat tadi)
    const isEmailSent = await sendResetPasswordEmail(user.email, resetToken);

    if (!isEmailSent) {
      // Jika email gagal terkirim, hapus kembali token di database agar bersih
      await prisma.user.update({
        where: { id_users: user.id_users },
        data: { resetPasswordToken: null, resetPasswordExpires: null }
      });
      return res.status(500).json({ success: false, message: "Gagal mengirim email. Coba lagi nanti." });
    }

    res.status(200).json({ success: true, message: "Link reset password telah dikirim ke email Anda." });

  } catch (error) {
    console.error("Error forgotPassword:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
  }
};

// ==========================================
// 2. API EKSEKUSI RESET PASSWORD BARU
// ==========================================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // 1. Cari user yang memiliki token tersebut DAN waktu kadaluarsanya masih berlaku (lebih besar dari waktu saat ini)
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() } // gt = greater than (masih berlaku)
      }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Token tidak valid atau sudah kadaluarsa!" });
    }

    // 2. Enkripsi (Hash) password baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 3. Update password di database dan HANGUSKAN tokennya (set kembali ke null)
    await prisma.user.update({
      where: { id_users: user.id_users },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    res.status(200).json({ success: true, message: "Password berhasil diubah! Silakan login." });

  } catch (error) {
    console.error("Error resetPassword:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
  }
};