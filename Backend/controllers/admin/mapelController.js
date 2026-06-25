import prisma from '../../config/prisma.js';

const allowedKelompok = new Set(['UMUM', 'MULOK', 'KEJURUAN']);

// ==========================================
// 1. TAMBAH MATA PELAJARAN BARU
// ==========================================
export const createMapel = async (req, res) => {
  try {
    // 🔥 Tangkap 'mapel' dan 'kelompok' dari body
    const { mapel, kelompok } = req.body; 

    if (!mapel || !kelompok) {
      return res.status(400).json({ 
        success: false, 
        message: "Nama mata pelajaran dan kelompok wajib diisi!" 
      });
    }

    if (!allowedKelompok.has(kelompok)) {
      return res.status(400).json({
        success: false,
        message: "Kelompok mata pelajaran tidak valid."
      });
    }

    const newMapel = await prisma.mataPelajaran.create({
      data: {
        mapel,
        kelompok // 🔥 Simpan kelompok ke database
      }
    });

    res.status(201).json({
      success: true,
      message: `Mata pelajaran ${newMapel.mapel} berhasil ditambahkan!`,
      data: newMapel
    });

  } catch (error) {
    console.error("Error create mapel:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

// ==========================================
// 2. TAMPILKAN SEMUA MATA PELAJARAN 
// ==========================================
export const getAllMapel = async (req, res) => {
  try {
    const mapelList = await prisma.mataPelajaran.findMany({
      orderBy: { mapel: 'asc' }, 
      select: {
        id_mapel: true, 
        mapel: true,
        kelompok: true // 🔥 Kirim data kelompok ke Frontend
      }
    });

    res.status(200).json({
      success: true,
      message: "Data mata pelajaran berhasil ditarik!",
      data: mapelList
    });
  } catch (error) {
    console.error("Error get all mapel:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};


// ==========================================
// 3. EDIT DATA MATA PELAJARAN (UPDATE)
// ==========================================
export const updateMapel = async (req, res) => {
  try {
    const { id } = req.params; 
    const { mapel, kelompok } = req.body; // 🔥 Tangkap data kelompok

    if (!mapel || !kelompok) {
      return res.status(400).json({ 
        success: false, 
        message: "Nama mata pelajaran dan kelompok wajib diisi!" 
      });
    }

    if (!allowedKelompok.has(kelompok)) {
      return res.status(400).json({
        success: false,
        message: "Kelompok mata pelajaran tidak valid."
      });
    }

    const existingMapel = await prisma.mataPelajaran.findUnique({
      where: { id_mapel: id } 
    });

    if (!existingMapel) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan!" });
    }

    const updatedMapel = await prisma.mataPelajaran.update({
      where: { id_mapel: id },
      data: { mapel, kelompok } // 🔥 Update kelompok
    });

    return res.status(200).json({
      success: true,
      message: `Mata pelajaran berhasil diperbarui!`,
      data: updatedMapel
    });

  } catch (error) {
    console.error("Error update mapel:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};
// ==========================================
// 4. HAPUS DATA MATA PELAJARAN (DELETE)
// ==========================================
export const deleteMapel = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Cek ketersediaan data
    const existingMapel = await prisma.mataPelajaran.findUnique({
      where: { id_mapel: id }
    });

    if (!existingMapel) {
      return res.status(404).json({ 
        success: false, 
        message: "Data mata pelajaran tidak ditemukan!" 
      });
    }

    // 2. Eksekusi Hapus Data
    await prisma.mataPelajaran.delete({
      where: { id_mapel: id }
    });

    // 3. Berikan respon sukses
    return res.status(200).json({
      success: true,
      message: `Mata pelajaran ${existingMapel.mapel} berhasil dihapus permanen!`
    });

  } catch (error) {
    // Tangani error jika mapel sedang dipakai di tabel lain (Foreign Key Constraint Failed)
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: "Gagal menghapus! Mata pelajaran ini sedang digunakan pada data Jadwal atau Nilai Siswa."
      });
    }

    console.error("Error delete mapel:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat menghapus mata pelajaran." 
    });
  }
};
