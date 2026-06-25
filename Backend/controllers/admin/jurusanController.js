import prisma from '../../config/prisma.js';

// ==========================================
// 1. KELOLA TAMBAH DATA JURUSAN
// ==========================================
export const createJurusan = async (req, res) => {
  try {
    // Menangkap input dari body request
    const { jurusan, status } = req.body; 

    // 1. Validasi: Pastikan semua data terisi
    if (!jurusan || !status) {
      return res.status(400).json({ 
        success: false, 
        message: "Nama jurusan dan status wajib diisi!" 
      });
    }

    // 2. Validasi: Pastikan status sesuai dengan ENUM di Prisma (wajib kapital & pakai underscore)
    if (status !== 'AKTIF' && status !== 'NON_AKTIF') {
      return res.status(400).json({
        success: false,
        message: "Status tidak valid! Pilihannya harus 'AKTIF' atau 'NON_AKTIF'."
      });
    }

    // 3. Simpan data ke PostgreSQL melalui Prisma
    const newJurusan = await prisma.jurusan.create({
      data: {
        jurusan,
        status // Nilai string otomatis dicocokkan dengan ENUM database
      }
    });

    // 4. Kirim respon sukses balik ke Frontend
    return res.status(201).json({
      success: true,
      message: `Jurusan ${newJurusan.jurusan} berhasil didaftarkan ke sistem!`,
      data: newJurusan
    });

  } catch (error) {
    console.error("Error pada createJurusan:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat menyimpan data jurusan." 
    });
  }
};

// ==========================================
// 2. TAMPILKAN SEMUA DATA JURUSAN (GET)
// ==========================================
export const getAllJurusan = async (req, res) => {
  try {
    const listJurusan = await prisma.jurusan.findMany({
      // Opsional: Urutkan berdasarkan jurusan terbaru atau abjad
      // orderBy: { id_jurusan: 'desc' } 
    });

    return res.status(200).json({
      success: true,
      message: "Data jurusan berhasil ditarik!",
      data: listJurusan
    });
  } catch (error) {
    console.error("Error pada getAllJurusan:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengambil data jurusan."
    });
  }
};


// ==========================================
// 3. EDIT DATA JURUSAN (UPDATE)
// ==========================================
export const updateJurusan = async (req, res) => {
  try {
    const { id } = req.params; // Ambil ID jurusan dari URL
    const { jurusan, status } = req.body; // Ambil data baru dari form frontend

    // 1. Validasi Input Dasar
    if (!jurusan || !status) {
      return res.status(400).json({ 
        success: false, 
        message: "Nama jurusan dan status wajib diisi!" 
      });
    }

    // 2. Validasi ENUM Status
    if (status !== 'AKTIF' && status !== 'NON_AKTIF') {
      return res.status(400).json({
        success: false,
        message: "Status tidak valid! Pilihannya harus 'AKTIF' atau 'NON_AKTIF'."
      });
    }

    // 3. Cek apakah data jurusan dengan ID tersebut benar-benar ada di database
    const existingJurusan = await prisma.jurusan.findUnique({
      where: { id_jurusan: id } // Pastikan primary key-mu bernama id_jurusan
    });

    if (!existingJurusan) {
      return res.status(404).json({ 
        success: false, 
        message: "Data jurusan tidak ditemukan di database!" 
      });
    }

    // 4. Eksekusi Update ke Database
    const updatedJurusan = await prisma.jurusan.update({
      where: { id_jurusan: id },
      data: {
        jurusan,
        status
      }
    });

    // 5. Kirim respon sukses
    return res.status(200).json({
      success: true,
      message: `Data jurusan berhasil diperbarui menjadi ${updatedJurusan.jurusan}!`,
      data: updatedJurusan
    });

  } catch (error) {
    console.error("Error pada updateJurusan:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat memperbarui data jurusan." 
    });
  }
};

// ==========================================
// 4. HAPUS DATA JURUSAN (DELETE)
// ==========================================
export const deleteJurusan = async (req, res) => {
  try {
    const { id } = req.params; // Ambil ID jurusan dari URL parameter

    // 1. Cek apakah data jurusan dengan ID tersebut ada di database
    const existingJurusan = await prisma.jurusan.findUnique({
      where: { id_jurusan: id } // Sesuaikan dengan nama primary key di skemamu
    });

    if (!existingJurusan) {
      return res.status(404).json({ 
        success: false, 
        message: "Data jurusan tidak ditemukan!" 
      });
    }

    // 2. Eksekusi Hapus Data
    await prisma.jurusan.delete({
      where: { id_jurusan: id }
    });

    // 3. Kirim respon sukses
    return res.status(200).json({
      success: true,
      message: `Data jurusan ${existingJurusan.jurusan} berhasil dihapus permanen!`
    });

  } catch (error) {
    // 4. Tangani error relasi (P2003 = Foreign Key Constraint Failed)
    // Ini terjadi jika jurusan sedang dipakai oleh data Kelas atau Siswa
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: "Gagal menghapus! Jurusan ini sedang digunakan oleh data Kelas atau Siswa. Silakan hapus atau pindahkan data terkait terlebih dahulu."
      });
    }

    console.error("Error pada deleteJurusan:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat menghapus data jurusan." 
    });
  }
};