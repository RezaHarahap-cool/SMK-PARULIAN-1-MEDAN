import prisma from '../../config/prisma.js';

// ==========================================
// 1. TAMBAH TAHUN AJARAN (CREATE)
// ==========================================
export const createTahunAjaran = async (req, res) => {
  try {
    const { tahun, status } = req.body;

    if (!tahun || !status) {
      return res.status(400).json({ success: false, message: "Tahun dan status wajib diisi!" });
    }

    if (status !== 'AKTIF' && status !== 'NON_AKTIF') {
      return res.status(400).json({ success: false, message: "Status tidak valid!" });
    }

    // Jika tahun ajaran baru diset AKTIF, opsional kamu bisa mematikan tahun ajaran lain
    // Tapi untuk versi standar, kita biarkan admin mengaturnya manual.
    const newTahunAjaran = await prisma.tahunAjaran.create({
      data: { tahun, status }
    });

    return res.status(201).json({
      success: true,
      message: `Tahun Ajaran ${newTahunAjaran.tahun} berhasil ditambahkan!`,
      data: newTahunAjaran
    });
  } catch (error) {
    console.error("Error create Tahun Ajaran:", error);
    return res.status(500).json({ success: false, message: "Kesalahan server saat menyimpan data." });
  }
};

// ==========================================
// 2. TAMPILKAN SEMUA TAHUN AJARAN (READ)
// ==========================================
export const getAllTahunAjaran = async (req, res) => {
  try {
    const listTahunAjaran = await prisma.tahunAjaran.findMany({
      orderBy: { tahun: 'desc' } // Urutkan tahun terbaru di atas
    });

    return res.status(200).json({
      success: true,
      message: "Data tahun ajaran berhasil ditarik!",
      data: listTahunAjaran
    });
  } catch (error) {
    console.error("Error get Tahun Ajaran:", error);
    return res.status(500).json({ success: false, message: "Kesalahan server saat mengambil data." });
  }
};

// ==========================================
// 3. EDIT TAHUN AJARAN (UPDATE)
// ==========================================
export const updateTahunAjaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { tahun, status } = req.body;

    if (!tahun || !status) {
      return res.status(400).json({ success: false, message: "Tahun dan status wajib diisi!" });
    }

    const existing = await prisma.tahunAjaran.findUnique({ where: { id_tahun_ajaran: id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan!" });
    }

    const updated = await prisma.tahunAjaran.update({
      where: { id_tahun_ajaran: id },
      data: { tahun, status }
    });

    return res.status(200).json({
      success: true,
      message: `Tahun Ajaran berhasil diubah menjadi ${updated.tahun} (${updated.status})!`,
      data: updated
    });
  } catch (error) {
    console.error("Error update Tahun Ajaran:", error);
    return res.status(500).json({ success: false, message: "Kesalahan server saat mengupdate data." });
  }
};

// ==========================================
// 4. HAPUS TAHUN AJARAN (DELETE)
// ==========================================
export const deleteTahunAjaran = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.tahunAjaran.findUnique({ where: { id_tahun_ajaran: id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan!" });
    }

    await prisma.tahunAjaran.delete({
      where: { id_tahun_ajaran: id }
    });

    return res.status(200).json({
      success: true,
      message: `Tahun Ajaran ${existing.tahun} berhasil dihapus!`
    });
  } catch (error) {
    // Pelindung jika tahun ajaran sedang dipakai di tabel Jadwal
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: "Gagal menghapus! Tahun Ajaran ini masih digunakan oleh data Jadwal."
      });
    }
    console.error("Error delete Tahun Ajaran:", error);
    return res.status(500).json({ success: false, message: "Kesalahan server saat menghapus data." });
  }
};