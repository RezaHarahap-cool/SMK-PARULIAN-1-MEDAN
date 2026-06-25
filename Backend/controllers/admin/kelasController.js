import prisma from '../../config/prisma.js';

// ==========================================
// 1. TAMPILKAN SEMUA KELAS FISIK
// ==========================================
export const getAllKelas = async (req, res) => {
  try {
    const dataKelas = await prisma.kelas.findMany({
      // Mengurutkan berdasarkan nama kelas (A-Z) agar rapi di tabel frontend
      orderBy: { nama_kelas: 'asc' },
      
      // Melakukan JOIN untuk mengambil nama guru, jurusan, dan TAHUN AJARAN
      include: {
        wali_kelas: {
          select: { nama_guru: true }
        },
        jurusan: {
          select: { jurusan: true }
        },
        tahun_ajaran: { // 🔥 TAMBAHAN BARU
          select: { tahun: true }
        },
        riwayat_siswa: {
          where: { status_kenaikan: 'Sedang_Belajar' },
          select: { id_riwayat: true }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: "Data seluruh kelas fisik berhasil ditarik!",
      data: dataKelas
    });
  } catch (error) {
    console.error("Error get all kelas:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat menarik data kelas." 
    });
  }
};

// ==========================================
// 2. TAMBAH KELAS FISIK BARU
// ==========================================
export const createKelas = async (req, res) => {
  try {
    // 🔥 TAMBAHAN BARU: Terima tahun_ajaran_id dan status
    const { nama_kelas, ruang_kelas, guru_id, jurusan_id, tahun_ajaran_id, status } = req.body;

    // Validasi data wajib (Tahun Ajaran sekarang WAJIB)
    if (!nama_kelas || !ruang_kelas || !jurusan_id || !tahun_ajaran_id) {
      return res.status(400).json({
        success: false,
        message: "Nama Kelas, Ruang Kelas, Jurusan, dan Tahun Ajaran wajib diisi!"
      });
    }

    // Penanganan khusus untuk guru_id (Wali Kelas sifatnya opsional)
    const validGuruId = (guru_id && guru_id.trim() !== "") ? guru_id : null;

    // Simpan ke database
    const newKelas = await prisma.kelas.create({
      data: {
        nama_kelas,
        ruang_kelas,
        jurusan_id,
        tahun_ajaran_id, // 🔥 TAMBAHAN BARU
        status: status || "AKTIF", // Default ke AKTIF jika tidak dikirim
        guru_id: validGuruId
      },
      include: {
        wali_kelas: { select: { nama_guru: true } },
        jurusan: { select: { jurusan: true } },
        tahun_ajaran: { select: { tahun: true } } // 🔥 TAMBAHAN BARU
      }
    });

    return res.status(201).json({
      success: true,
      message: `Ruangan Kelas ${nama_kelas} berhasil ditambahkan!`,
      data: newKelas
    });

  } catch (error) {
    console.error("Error create kelas:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat menyimpan data kelas baru." 
    });
  }
};

// ==========================================
// 3. EDIT KELAS FISIK (UPDATE)
// ==========================================
export const updateKelas = async (req, res) => {
  try {
    const { id } = req.params; // Ambil ID dari URL
    // 🔥 TAMBAHAN BARU: Terima tahun_ajaran_id dan status
    const { nama_kelas, ruang_kelas, guru_id, jurusan_id, tahun_ajaran_id, status } = req.body;

    // 1. Validasi data wajib
    if (!nama_kelas || !ruang_kelas || !jurusan_id || !tahun_ajaran_id) {
      return res.status(400).json({
        success: false,
        message: "Nama Kelas, Ruang Kelas, Jurusan, dan Tahun Ajaran wajib diisi!"
      });
    }

    // 2. Cek apakah kelas yang mau diedit itu ada
    const kelasTarget = await prisma.kelas.findUnique({
      where: { id_kelas: id }
    });

    if (!kelasTarget) {
      return res.status(404).json({
        success: false,
        message: "Data kelas fisik tidak ditemukan!"
      });
    }

    // 3. Konversi guru_id kosong menjadi null agar aman masuk ke PostgreSQL
    const validGuruId = (guru_id && guru_id.trim() !== "") ? guru_id : null;

    // 4. Lakukan update data
    const updatedKelas = await prisma.kelas.update({
      where: { id_kelas: id },
      data: {
        nama_kelas,
        ruang_kelas,
        jurusan_id,
        tahun_ajaran_id, // 🔥 TAMBAHAN BARU
        status,          // 🔥 TAMBAHAN BARU
        guru_id: validGuruId
      },
      include: {
        wali_kelas: { select: { nama_guru: true } },
        jurusan: { select: { jurusan: true } },
        tahun_ajaran: { select: { tahun: true } } // 🔥 TAMBAHAN BARU
      }
    });

    return res.status(200).json({
      success: true,
      message: `Data ruangan kelas ${nama_kelas} berhasil diperbarui!`,
      data: updatedKelas
    });

  } catch (error) {
    console.error("Error update kelas:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat memperbarui data kelas." 
    });
  }
};


// ==========================================
// 4. HAPUS KELAS FISIK (DELETE)
// ==========================================
export const deleteKelas = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Pastikan kelas yang mau dihapus itu ada
    const kelasTarget = await prisma.kelas.findUnique({
      where: { id_kelas: id }
    });

    if (!kelasTarget) {
      return res.status(404).json({ 
        success: false, 
        message: "Data kelas fisik tidak ditemukan!" 
      });
    }

    // 2. Eksekusi penghapusan
    await prisma.kelas.delete({
      where: { id_kelas: id }
    });

    return res.status(200).json({
      success: true,
      message: `Ruangan kelas ${kelasTarget.nama_kelas} berhasil dihapus permanen!`
    });

  } catch (error) {
    console.error("Error delete kelas:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat menghapus kelas." 
    });
  }
};