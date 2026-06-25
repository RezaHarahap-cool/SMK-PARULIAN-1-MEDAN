import prisma from '../../config/prisma.js';
import bcrypt from 'bcrypt';
import fs from 'fs';

// ==========================================
// 1. TAMBAH GURU BARU (Oleh Admin)
// ==========================================
export const createGuru = async (req, res) => {
  try {
    // Sesuaikan penamaan variabel dengan Tabel 3.26
    const { 
      username, email, password, 
      nama_guru, tgl_lahir, gender, agama, pendidikan_tertinggi, no_hp, mapel_id 
    } = req.body;

    // Hash password guru
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Ambil nama file foto jika ada yang di-upload
    const foto = req.file ? req.file.filename : null;

    // Jalankan Database Transaction
    const newGuru = await prisma.$transaction(async (tx) => {
      // 1. Buat data induk di tabel users
      const user = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: 'guru',
          is_active: true
        }
      });

      // 2. Buat data profil di tabel guru_profiles
      const profile = await tx.guruProfile.create({
        data: {
          users_id: user.id_users,
          nama_guru,
          // Ubah string "YYYY-MM-DD" dari form-data menjadi format Date ISO Prisma
          tgl_lahir: new Date(tgl_lahir), 
          gender, // Pastikan inputnya persis "Wanita" atau "Pria" sesuai ENUM
          agama,
          pendidikan_tertinggi,
          no_hp,
          foto,
          // Ubah string angka dari form-data menjadi Integer
          mapel_id: mapel_id
        }
      });

      return { user, profile };
    });

    res.status(201).json({
      success: true,
      message: `Guru baru atas nama ${newGuru.profile.nama_guru} berhasil didaftarkan!`,
      data: {
        id_users: newGuru.user.id_users,
        username: newGuru.user.username,
        nama_guru: newGuru.profile.nama_guru,
        role: newGuru.user.role
      }
    });

  } catch (error) {
    // Jika gagal, hapus foto yang telanjur masuk folder uploads
    if (req.file) {
      fs.unlinkSync(`./uploads/${req.file.filename}`);
    }

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: "Pendaftaran gagal. Username atau Email sudah terdaftar!"
      });
    }

    console.error("Error create guru:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat menambah data guru." });
  }
};

// ==========================================
// 2. TAMPILKAN SEMUA GURU
// ==========================================
export const getAllGurus = async (req, res) => {
  try {
    const gurus = await prisma.user.findMany({
      where: { role: 'guru' },
      select: {
        id_users: true,
        username: true,
        email: true,
        is_active: true,
        guru: { 
          select: {
            id_guru: true,
            nama_guru: true,
            tgl_lahir: true,
            gender: true,
            agama: true,
            pendidikan_tertinggi: true,
            no_hp: true,
            foto: true,
            // TAMBAHAN: Tarik juga nama mapel-nya langsung dari database!
            mata_pelajaran: {
              select: {
                mapel: true
              }
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Data seluruh guru berhasil ditarik!",
      data: gurus
    });

  } catch (error) {
    console.error("Error get all gurus:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat mengambil data." });
  }
};

// ==========================================
// 3. UPDATE DATA GURU (Oleh Admin)
// ==========================================
export const updateGuru = async (req, res) => {
  try {
    const { id } = req.params;

    const { 
      username, email, password, is_active,
      nama_guru, tgl_lahir, gender, agama, pendidikan_tertinggi, no_hp, mapel_id 
    } = req.body;

    const guruLama = await prisma.user.findUnique({
      where: { id_users: id },
      include: { guru: true } 
    });

    if (!guruLama) {
      if (req.file) fs.unlinkSync(`./uploads/${req.file.filename}`);
      return res.status(404).json({ success: false, message: "Data guru tidak ditemukan!" });
    }

    let dataUser = { username, email };
    let dataProfile = { nama_guru, gender, agama, pendidikan_tertinggi, no_hp };

    // 🔥 FIX 1: Konversi Kuat Is_Active String ke Boolean Murni
    if (is_active !== undefined) {
      dataUser.is_active = String(is_active) === 'true';
    }

    if (password && password.trim() !== "") {
      const saltRounds = 10;
      dataUser.password = await bcrypt.hash(password, saltRounds);
    }

    if (tgl_lahir) dataProfile.tgl_lahir = new Date(tgl_lahir);
    
    // 🔥 FIX 2: Cegah String Kosong Masuk ke Field UUID PostgreSQL
    if (mapel_id !== undefined) {
      dataProfile.mapel_id = mapel_id === "" ? null : mapel_id;
    }

    if (req.file) {
      dataProfile.foto = req.file.filename;

      if (guruLama.guru?.foto) {
        const pathFotoLama = `./uploads/${guruLama.guru.foto}`;
        if (fs.existsSync(pathFotoLama)) {
          fs.unlinkSync(pathFotoLama);
        }
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const userUpdated = await tx.user.update({
        where: { id_users: id },
        data: dataUser
      });

      const profileUpdated = await tx.guruProfile.update({
        where: { users_id: id },
        data: dataProfile
      });

      return { userUpdated, profileUpdated };
    });

    res.status(200).json({
      success: true,
      message: `Data guru atas nama ${result.profileUpdated.nama_guru} berhasil diperbarui!`,
      data: {
        id_users: result.userUpdated.id_users,
        username: result.userUpdated.username,
        nama_guru: result.profileUpdated.nama_guru
      }
    });

  } catch (error) {
    if (req.file) {
      fs.unlinkSync(`./uploads/${req.file.filename}`);
    }

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: "Update gagal. Username atau Email sudah terpakai oleh akun lain!"
      });
    }

    console.error("Error update guru:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat update data guru." });
  }
};

// ==========================================
// 4. HAPUS DATA GURU (Oleh Admin)
// ==========================================
export const deleteGuru = async (req, res) => {
  try {
    // 1. Ambil ID target dari URL parameter (:id)
    const { id } = req.params;

    // 2. Cari data guru yang mau dihapus beserta relasi profilnya
    // Sesuaikan 'guru' dengan nama relasi di schema.prisma milikmu
    const guruTarget = await prisma.user.findUnique({
      where: { id_users: id },
      include: { guru: true } 
    });

    // 3. Validasi: Apakah datanya ada?
    if (!guruTarget) {
      return res.status(404).json({ success: false, message: "Data guru tidak ditemukan!" });
    }

    // 4. Validasi Keamanan: Pastikan yang dihapus benar-benar Guru
    if (guruTarget.role !== 'guru') {
      return res.status(403).json({ 
        success: false, 
        message: "Akses ditolak! ID yang dimasukkan bukan milik entitas Guru." 
      });
    }

    // 5. Hapus file fisik foto di folder 'uploads' jika ada
    if (guruTarget.guru?.foto) {
      const pathFoto = `./uploads/${guruTarget.guru.foto}`;
      if (fs.existsSync(pathFoto)) {
        fs.unlinkSync(pathFoto); // Sapu bersih dari harddisk
      }
    }

    // 6. Eksekusi penghapusan di database menggunakan Transaksi
    await prisma.$transaction(async (tx) => {
      // Hapus data di tabel anak (guru_profiles) terlebih dahulu
      await tx.guruProfile.delete({
        where: { users_id: id }
      });

      // Hapus data di tabel induk (users)
      await tx.user.delete({
        where: { id_users: id }
      });
    });

    res.status(200).json({
      success: true,
      message: `Akun guru atas nama ${guruTarget.guru?.nama_guru || guruTarget.username} telah dihapus permanen dari sistem!`
    });

  } catch (error) {
    console.error("Gagal menghapus guru:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat menghapus data." });
  }
};

// ==========================================
// 5. TAMPILKAN PROFIL GURU YANG SEDANG LOGIN
// ==========================================
export const getMyProfile = async (req, res) => {
  try {
    // 1. Ambil ID dari token JWT yang sudah dibongkar oleh satpam verifyToken
    const userId = req.user.id_users;

    // 2. Suruh Prisma mencari data khusus untuk ID tersebut
    const myProfile = await prisma.user.findUnique({
      where: {
        id_users: userId,
      },
      select: {
        username: true,
        email: true,
        role: true,
        // Ambil biodata dari tabel guru_profiles beserta relasi ke mapel
        guru: {
          select: {
            nama_guru: true,
            tgl_lahir: true,
            gender: true,
            agama: true,
            pendidikan_tertinggi: true,
            no_hp: true,
            foto: true,
            // INI TAMBAHANNYA: Menarik nama mapel langsung dari relasinya
            mata_pelajaran: {
              select: {
                id_mapel: true,
                mapel: true
              }
            }
          }
        }
      }
    });

    if (!myProfile) {
      return res.status(404).json({ success: false, message: "Data profil tidak ditemukan." });
    }

    // 3. Kirim data ke frontend
    res.status(200).json({
      success: true,
      message: "Data profil guru berhasil ditarik beserta nama mapelnya!",
      data: myProfile
    });

  } catch (error) {
    console.error("Gagal mengambil profil guru:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

// ==========================================
// 6. LIHAT DETAIL SATU GURU (Berdasarkan ID)
// ==========================================
export const getGuruById = async (req, res) => {
  try {
    // 1. Ambil ID guru yang diklik dari parameter URL
    const { id } = req.params;

    // 2. Suruh Prisma mencari data user tersebut
    const guruDetail = await prisma.user.findUnique({
      where: { 
        id_users: id 
      },
      // Sama seperti get all, kita pilih field spesifik dan JOIN ke tabel guru & mapel
      select: {
        id_users: true,
        username: true,
        email: true,
        is_active: true,
        created_at: true,
        guru: {
          select: {
            nama_guru: true,
            tgl_lahir: true,
            gender: true,
            agama: true,
            pendidikan_tertinggi: true,
            no_hp: true,
            foto: true,
            // Tarik nama mapelnya sekalian
            mata_pelajaran: {
              select: {
                mapel: true
              }
            }
          }
        }
      }
    });

    // 3. Validasi: Bagaimana kalau ID-nya tidak ditemukan?
    if (!guruDetail) {
      return res.status(404).json({ 
        success: false, 
        message: "Data guru tidak ditemukan di sistem." 
      });
    }

    // 4. Validasi Keamanan: Pastikan ID yang dicari benar-benar role-nya 'guru'
    // (Biar admin nggak iseng masukin ID siswa di endpoint guru)
    const checkRole = await prisma.user.findUnique({ where: { id_users: id } });
    if (checkRole && checkRole.role !== 'guru') {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak! ID tersebut bukan milik seorang Guru."
      });
    }

    // 5. Kirim data ke frontend
    res.status(200).json({
      success: true,
      message: "Detail guru berhasil ditarik!",
      data: guruDetail
    });

  } catch (error) {
    console.error("Gagal mengambil detail guru:", error);
    res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat mengambil detail guru." 
    });
  }
};

// ==========================================
// 2B. TAMPILKAN GURU UNTUK HALAMAN PUBLIK
// ==========================================
export const getPublicGurus = async (req, res) => {
  try {
    const gurus = await prisma.user.findMany({
      where: {
        role: 'guru',
        is_active: true
      },
      select: {
        id_users: true,
        guru: {
          select: {
            nama_guru: true,
            pendidikan_tertinggi: true,
            foto: true,
            mata_pelajaran: {
              select: { mapel: true }
            }
          }
        }
      },
      orderBy: { username: 'asc' }
    });

    const data = gurus
      .filter((item) => item.guru)
      .map((item) => ({
        id_users: item.id_users,
        nama_guru: item.guru.nama_guru,
        pendidikan_tertinggi: item.guru.pendidikan_tertinggi,
        foto: item.guru.foto,
        mapel: item.guru.mata_pelajaran?.mapel || 'Guru Mata Pelajaran'
      }));

    res.status(200).json({
      success: true,
      message: 'Data guru publik berhasil ditarik!',
      data
    });
  } catch (error) {
    console.error('Error get public gurus:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat mengambil data guru publik.' });
  }
};
