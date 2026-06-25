import prisma from '../../config/prisma.js';
import bcrypt from 'bcrypt';
import fs from 'fs'; // <-- PENTING: Tambahkan ini untuk mengelola file fisik

// ==========================================
// 1. TAMPILKAN SELURUH DATA SISWA (GET ALL)
// ==========================================
export const getAllSiswa = async (req, res) => {
  try {
    const { kelas_id, tahun_ajaran_id } = req.query;
    const riwayatWhere = { status_kenaikan: 'Sedang_Belajar' };
    if (kelas_id) riwayatWhere.kelas_id = kelas_id;
    if (tahun_ajaran_id) riwayatWhere.tahun_ajaran_id = tahun_ajaran_id;

    const dataSiswa = await prisma.siswaProfile.findMany({
      where: kelas_id || tahun_ajaran_id
        ? {
            riwayat_kelas: {
              some: riwayatWhere
            }
          }
        : undefined,
      orderBy: { nama_siswa: 'asc' },
      include: {
        user: { select: { username: true, email: true, is_active: true } },
        // Tarik kelas aktif saat ini beserta nama jurusan DAN TAHUN AJARANNYA
        riwayat_kelas: {
          where: riwayatWhere,
          include: {
            kelas: {
              include: { jurusan: true }
            },
            tahun_ajaran: true // <--- INI DIA OBATNYA! 🔥
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: "Data seluruh siswa berhasil ditarik!",
      data: dataSiswa
    });
  } catch (error) {
    console.error("Error get all siswa:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server saat menarik data siswa." });
  }
};

// ==========================================
// 2. TAMBAH SISWA BARU (POST)
// ==========================================
export const createSiswa = async (req, res) => {
  try {
    const { 
      username, email, password,
      npsn, nis, nisn, nama_siswa, gender, tempat_tgl_lahir, 
      nama_ayah, pekerjaan_ayah, nama_ibu, pekerjaan_ibu, 
      alamat, desa_kelurahan, kecamatan, kabupaten_kota, provinsi, 
      no_hp_wali 
    } = req.body;

    // 1. Validasi Kolom Wajib
    if (!username || !email || !password || !nis || !nisn || !nama_siswa) {
      // Jika form tidak lengkap, hapus foto yang telanjur terupload
      if (req.file) fs.unlinkSync(req.file.path);
      
      return res.status(400).json({
        success: false,
        message: "Username, Email, Password, NIS, NISN, dan Nama Siswa wajib diisi!"
      });
    }

    // 2. Validasi ENUM Gender (Sesuaikan dengan Prisma: Pria / Wanita)
    const validGender = ['Pria', 'Wanita'];
    if (gender && !validGender.includes(gender)) {
      if (req.file) fs.unlinkSync(req.file.path); // Hapus foto
      
      return res.status(400).json({
        success: false,
        message: "Gender tidak valid! Pilih 'Pria' atau 'Wanita'."
      });
    }

    // 3. Hash Password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const fotoName = req.file ? req.file.filename : null;

    // 4. Eksekusi Database dengan Transaksi
    const result = await prisma.$transaction(async (tx) => {
      const userBaru = await tx.user.create({
        data: {
          username: username,
          password: hashedPassword,
          email: email,
          role: 'siswa',
          is_active: true,
        }
      });

      const siswaBaru = await tx.siswaProfile.create({
        data: {
          users_id: userBaru.id_users,
          npsn: npsn || null, 
          nis: nis,
          nisn: nisn,
          nama_siswa: nama_siswa,
          gender: gender,
          tempat_tgl_lahir: tempat_tgl_lahir,
          nama_ayah: nama_ayah,
          pekerjaan_ayah: pekerjaan_ayah,
          nama_ibu: nama_ibu,
          pekerjaan_ibu: pekerjaan_ibu,
          alamat: alamat,
          desa_kelurahan: desa_kelurahan,
          kecamatan: kecamatan,
          kabupaten_kota: kabupaten_kota,
          provinsi: provinsi,
          no_hp_wali: no_hp_wali,
          foto: fotoName,
          status_siswa: "Aktif" 
        }
      });

      return { userBaru, siswaBaru };
    });

    return res.status(201).json({
      success: true,
      message: `Siswa atas nama ${nama_siswa} berhasil didaftarkan!`,
      data: {
        id_siswa: result.siswaBaru.id_siswa,
        nama_siswa: result.siswaBaru.nama_siswa,
        nisn: result.siswaBaru.nisn
      }
    });

  } catch (error) {
    // ==========================================
    // AUTO-CLEANUP: Hapus File Jika Gagal Simpan
    // ==========================================
    if (req.file) {
      // Pastikan path ini sesuai dengan konfigurasi folder Multer milikmu
      const pathFoto = `./public/uploads/${req.file.filename}`; 
      if (fs.existsSync(pathFoto)) {
        fs.unlinkSync(pathFoto);
      }
    }

    // Tangkap error Unique Constraint (Duplikat)
    if (error.code === 'P2002') {
      const fieldYangKembar = error.meta.target[0];
      return res.status(400).json({
        success: false,
        message: `Gagal mendaftar! Data ${fieldYangKembar} tersebut sudah digunakan oleh akun lain.`
      });
    }

    console.error("Error create siswa:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat menyimpan data siswa baru." 
    });
  }
};


// ==========================================
// 3. TAMPILKAN DETAIL SISWA (BERDASARKAN ID)
// ==========================================
export const getSiswaById = async (req, res) => {
  try {
    const { id } = req.params; // Ambil ID siswa dari URL

    const detailSiswa = await prisma.siswaProfile.findUnique({
      where: { 
        id_siswa: id 
      },
      include: {
        // 1. Ambil data akun loginnya
        user: {
          select: {
            username: true,
            email: true,
            is_active: true
          }
        },
        // 2. Ambil SEMUA riwayat kelas yang pernah diduduki anak ini
        riwayat_kelas: {
          include: {
            kelas: {
              include: {
                jurusan: true, // Ambil nama jurusan
                wali_kelas: {
                  select: { nama_guru: true } // Ambil nama wali kelas saat itu
                }
              }
            },
            tahun_ajaran: true // Ambil info tahun ajaran (cth: 2026/2027)
          },
          // Urutkan riwayat dari data yang paling baru ke yang paling lama (Z-A)
          // Asumsinya kita bisa mengurutkan berdasarkan ID atau status jika diperlukan
          orderBy: {
            id_riwayat: 'desc' 
          }
        }
      }
    });

    // Jika data tidak ditemukan
    if (!detailSiswa) {
      return res.status(404).json({
        success: false,
        message: "Data siswa tidak ditemukan di sistem!"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Detail biodata dan riwayat akademik berhasil ditarik!",
      data: detailSiswa
    });

  } catch (error) {
    console.error("Error get detail siswa:", error);
    
    // Menangkap error jika format ID dari Frontend bukan UUID yang sah
    if (error.code === 'P2023') {
      return res.status(400).json({ 
        success: false, 
        message: "Format ID Siswa tidak valid." 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat mengambil detail siswa." 
    });
  }
};


// ==========================================
// 4. EDIT DATA SISWA (PUT)
// ==========================================
export const updateSiswa = async (req, res) => {
  try {
    const { id } = req.params; 
    const { 
      username, email, password, is_active, // 🔥 FIX: is_active DITAMBAHKAN DI SINI
      npsn, nis, nisn, nama_siswa, gender, tempat_tgl_lahir, 
      nama_ayah, pekerjaan_ayah, nama_ibu, pekerjaan_ibu, no_hp_wali, 
      alamat, desa_kelurahan, kecamatan, kabupaten_kota, provinsi 
    } = req.body;

    if (!username || !email || !nis || !nisn || !nama_siswa) {
      if (req.file) fs.unlinkSync(req.file.path); 
      return res.status(400).json({
        success: false,
        message: "Username, Email, NIS, NISN, dan Nama Siswa pantang dikosongkan!"
      });
    }

    const siswaLama = await prisma.siswaProfile.findUnique({
      where: { id_siswa: id }
    });

    if (!siswaLama) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: "Data siswa tidak ditemukan!" });
    }

    let userUpdateData = {
      username: username,
      email: email,
    };

    // 🔥 FIX 2: KONVERSI IS_ACTIVE JADI BOOLEAN
    if (is_active !== undefined) {
      userUpdateData.is_active = String(is_active) === 'true';
    }

    if (password && password.trim() !== "") {
      const saltRounds = 10;
      userUpdateData.password = await bcrypt.hash(password, saltRounds);
    }

    let fotoBaruName = siswaLama.foto; 
    if (req.file) {
      fotoBaruName = req.file.filename; 
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id_users: siswaLama.users_id },
        data: userUpdateData
      });

      const updatedSiswa = await tx.siswaProfile.update({
        where: { id_siswa: id },
        data: {
          npsn: npsn || null,
          nis: nis,
          nisn: nisn,
          nama_siswa: nama_siswa,
          gender: gender,
          tempat_tgl_lahir: tempat_tgl_lahir,
          nama_ayah: nama_ayah,
          pekerjaan_ayah: pekerjaan_ayah,
          nama_ibu: nama_ibu,
          pekerjaan_ibu: pekerjaan_ibu,
          alamat: alamat,
          desa_kelurahan: desa_kelurahan,
          kecamatan: kecamatan,
          kabupaten_kota: kabupaten_kota,
          provinsi: provinsi,
          no_hp_wali: no_hp_wali,
          foto: fotoBaruName 
        }
      });

      return { updatedUser, updatedSiswa };
    });

    if (req.file && siswaLama.foto) {
      const pathFotoLama = `./public/uploads/${siswaLama.foto}`;
      if (fs.existsSync(pathFotoLama)) {
        fs.unlinkSync(pathFotoLama); 
      }
    }

    return res.status(200).json({
      success: true,
      message: `Data siswa ${nama_siswa} berhasil diperbarui!`,
      data: result.updatedSiswa
    });

  } catch (error) {
    if (req.file) {
      const pathFotoBaru = `./public/uploads/${req.file.filename}`;
      if (fs.existsSync(pathFotoBaru)) {
        fs.unlinkSync(pathFotoBaru);
      }
    }

    if (error.code === 'P2002') {
      const fieldYangKembar = error.meta.target[0];
      return res.status(400).json({
        success: false,
        message: `Gagal memperbarui! Data ${fieldYangKembar} sudah terdaftar pada akun lain.`
      });
    }

    console.error("Error update siswa:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat memperbarui data siswa." 
    });
  }
};


// ==========================================
// 5. HAPUS DATA SISWA (DELETE)
// ==========================================
export const deleteSiswa = async (req, res) => {
  try {
    const { id } = req.params; // ID Siswa dari URL

    // 1. Cari data siswa target untuk mendapatkan nama foto dan ID Akun (users_id)
    const siswaTarget = await prisma.siswaProfile.findUnique({
      where: { id_siswa: id }
    });

    // Jika tidak ada di database, tolak permintaannya
    if (!siswaTarget) {
      return res.status(404).json({
        success: false,
        message: "Data siswa tidak ditemukan di sistem!"
      });
    }

    // 2. Eksekusi Penghapusan Data via Transaction
    // Urutan ini sangat penting untuk menghindari error Foreign Key
    await prisma.$transaction(async (tx) => {
      
      // A. Hapus Biodata Siswa
      // Catatan: Jika di schema.prisma kamu sudah pakai onDelete: Cascade untuk riwayat_kelas,
      // maka seluruh riwayat kelas siswa ini akan otomatis ikut terhapus di database.
      await tx.siswaProfile.delete({
        where: { id_siswa: id }
      });

      // B. Hapus Akun Login-nya
      await tx.user.delete({
        where: { id_users: siswaTarget.users_id }
      });

    });

    // 3. AUTO-CLEANUP: Hapus File Foto Fisik dari Server
    if (siswaTarget.foto) {
      const pathFoto = `./public/uploads/${siswaTarget.foto}`;
      if (fs.existsSync(pathFoto)) {
        fs.unlinkSync(pathFoto); // Sapu bersih file fotonya!
      }
    }

    return res.status(200).json({
      success: true,
      message: `Data siswa, akun login, dan foto berhasil dihapus permanen dari sistem!`
    });

  } catch (error) {
    console.error("Error delete siswa:", error);
    
    // Tangkap error jika format ID tidak valid
    if (error.code === 'P2023') {
      return res.status(400).json({ 
        success: false, 
        message: "Format ID Siswa tidak valid." 
      });
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat menghapus data siswa."
    });
  }
};
