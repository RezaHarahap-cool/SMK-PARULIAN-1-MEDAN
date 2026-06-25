import jwt from 'jsonwebtoken';

// ==========================================
// LAPIS 1: Cek Keaslian Token (Authentication)
// ==========================================
export const verifyToken = (req, res, next) => {
  // Token biasanya dikirim di Headers dengan format: "Bearer eyJhbGciOi..."
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Akses ditolak! Anda belum login (Token tidak ditemukan)." 
    });
  }

  const secretKey = process.env.JWT_SECRET || 'fallback_secret';

  // Verifikasi stempel JWT
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: "Sesi Anda telah habis atau token tidak valid. Silakan login ulang!" 
      });
    }
    
    // Kalau asli, simpan data isi token (id_users, role) ke dalam request
    // supaya bisa dibaca oleh fungsi selanjutnya.
    req.user = decoded; 
    
    // Lolos lapis pertama, silakan lanjut ke pengecekan berikutnya!
    next(); 
  });
};

// ==========================================
// LAPIS 2: Cek Hak Akses Admin (Authorization)
// ==========================================
export const isAdmin = (req, res, next) => {
  // Kita ambil data role dari req.user yang barusan disisipkan oleh lapis pertama
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: "Akses ditolak! Fitur ini hanya boleh diakses oleh Admin." 
    });
  }
  
  // Kalau jabatannya benar admin, silakan eksekusi controller (misal: Hapus Data)
  next(); 
};

// ==========================================
// LAPIS 2B: Cek Hak Akses Guru (Authorization)
// ==========================================
export const isGuru = (req, res, next) => {
  // Kita pastikan role yang ada di dalam token JWT adalah 'guru'
  if (req.user.role !== 'guru') {
    return res.status(403).json({ 
      success: false, 
      message: "Akses ditolak! Halaman ini khusus untuk Guru." 
    });
  }
  
  // Kalau jabatannya benar guru, silakan masuk!
  next(); 
};

// ==========================================
// LAPIS 2C: Cek Hak Akses Siswa (Authorization)
// ==========================================
export const isSiswa = (req, res, next) => {
  // Kita pastikan role yang ada di dalam token JWT adalah 'siswa'
  if (req.user.role !== 'siswa') {
    return res.status(403).json({ 
      success: false, 
      message: "Akses ditolak! Halaman ini khusus untuk Siswa." 
    });
  }
  
  // Kalau jabatannya benar siswa, silakan masuk!
  next(); 
};

// ==========================================
// LAPIS 2D: Cek Hak Akses Kepala Sekolah
// ==========================================
export const isKepsek = (req, res, next) => {
  if (req.user.role !== 'kepala_sekolah') {
    return res.status(403).json({ 
      success: false, 
      message: "Akses ditolak! Halaman ini khusus untuk Kepala Sekolah." 
    });
  }
  next(); 
};