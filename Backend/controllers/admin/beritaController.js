import prisma from '../../config/prisma.js'; // Sesuaikan path ke file prisma-mu
import fs from 'fs';
// ==========================================
// 1. TAMPILKAN SEMUA BERITA
// ==========================================
export const getAllBerita = async (req, res) => {
  try {
    const beritaList = await prisma.berita.findMany({
      // Urutkan dari yang paling baru (Descending)
      orderBy: { tanggal_publikasi: 'desc' },
      // Tarik juga nama admin yang mempublikasikan berita ini
      include: {
        admin: {
          select: { nama_admin: true }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: "Seluruh data berita berhasil ditarik!",
      data: beritaList
    });
  } catch (error) {
    console.error("Error get all berita:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat mengambil data berita." 
    });
  }
};

// ==========================================
// 2. TAMBAH BERITA BARU
// ==========================================
export const createBerita = async (req, res) => {
  try {
    const { judul, content, jenis_berita, admin_id } = req.body;
    
    const foto = req.file ? req.file.filename : (req.body.foto || null);

    if (!judul || !content || !jenis_berita || !admin_id) {
      return res.status(400).json({
        success: false,
        message: "Judul, Konten, Jenis Berita, dan ID Admin wajib diisi!"
      });
    }

    const validJenis = ['Pengumuman', 'Kegiatan_Prestasi', 'Akademik'];
    if (!validJenis.includes(jenis_berita)) {
      return res.status(400).json({
        success: false,
        message: "Jenis berita tidak valid! Pilihannya: Pengumuman, Kegiatan_Prestasi, Akademik."
      });
    }

    // ==========================================
    // SOLUSI FOREIGN KEY: PENCARIAN ID ADMIN SAH
    // ==========================================
    // Cek apakah admin_id yang dikirim frontend adalah 'id_users' atau 'id_admin'
    const cekAdminProfil = await prisma.adminProfile.findFirst({
      where: {
        OR: [
          { id_admin: admin_id }, // Cek jika kebetulan token mengirim id_admin
          { users_id: admin_id }  // Cek jika token mengirim id_users (Ini yang paling sering terjadi)
        ]
      }
    });

    // Jika admin belum mengisi biodata profil sama sekali
    if (!cekAdminProfil) {
       return res.status(404).json({
          success: false,
          message: "Gagal menyimpan! Akun Anda belum memiliki data Profil Admin. Silakan lengkapi profil terlebih dahulu."
       });
    }

    // Ambil id_admin yang 100% sah untuk tabel Berita
    const finalAdminId = cekAdminProfil.id_admin; 

    // Eksekusi simpan ke database dengan ID yang sah
    const newBerita = await prisma.berita.create({
      data: {
        judul,
        content,
        jenis_berita,
        admin_id: finalAdminId, // <-- PENTING: Gunakan finalAdminId yang sudah disaring
        foto 
      },
      include: {
        admin: { select: { nama_admin: true } }
      }
    });

    return res.status(201).json({
      success: true,
      message: "Berita berhasil dipublikasikan!",
      data: newBerita
    });

  } catch (error) {
    console.error("Error create berita:", error);
    
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: "Gagal menyimpan! Terdapat masalah pada relasi ID."
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat menyimpan berita." 
    });
  }
};


// ==========================================
// 3. TAMPILKAN DETAIL BERITA (BY ID)
// ==========================================
export const getBeritaById = async (req, res) => {
  try {
    const { id } = req.params; // Ambil ID berita dari parameter URL

    const beritaDetail = await prisma.berita.findUnique({
      where: { 
        id_berita: id 
      },
      include: {
        admin: {
          select: { nama_admin: true }
        }
      }
    });

    // Jika data berita tidak ada di database
    if (!beritaDetail) {
      return res.status(404).json({
        success: false,
        message: "Berita tidak ditemukan atau sudah dihapus."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Detail berita berhasil ditarik!",
      data: beritaDetail
    });

  } catch (error) {
    console.error("Error get detail berita:", error);
    
    // Menangkap error jika ID yang dikirim dari Frontend formatnya bukan UUID yang sah
    if (error.code === 'P2023') {
      return res.status(400).json({ 
        success: false, 
        message: "Format ID Berita tidak valid." 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat mengambil detail berita." 
    });
  }
};


// ==========================================
// 4. EDIT BERITA (UPDATE)
// ==========================================
export const updateBerita = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, content, jenis_berita } = req.body;

    // 1. Validasi ENUM Jenis Berita jika ada perubahan
    if (jenis_berita) {
      const validJenis = ['Pengumuman', 'Kegiatan_Prestasi', 'Akademik'];
      if (!validJenis.includes(jenis_berita)) {
        return res.status(400).json({ success: false, message: "Jenis berita tidak valid!" });
      }
    }

    // 2. Cari berita lama untuk melihat apakah ada foto lama yang harus dihapus
    const beritaLama = await prisma.berita.findUnique({
      where: { id_berita: id }
    });

    if (!beritaLama) {
      return res.status(404).json({ success: false, message: "Data berita tidak ditemukan!" });
    }

    // 3. Logika Update Foto
    let fotoBaru = beritaLama.foto; // Default: gunakan foto lama

    if (req.file) {
      fotoBaru = req.file.filename; // Jika admin upload foto baru

      // Hapus foto lama dari folder public/uploads
      if (beritaLama.foto) {
        // Sesuaikan path ini dengan lokasi penyimpanan Multer-mu
        const pathFotoLama = `./public/uploads/${beritaLama.foto}`; 
        if (fs.existsSync(pathFotoLama)) {
          fs.unlinkSync(pathFotoLama); // Eksekusi hapus file fisik
        }
      }
    }

    // 4. Update data di database
    const updatedBerita = await prisma.berita.update({
      where: { id_berita: id },
      data: {
        judul,
        content,
        jenis_berita,
        foto: fotoBaru
      },
      include: {
        admin: { select: { nama_admin: true } }
      }
    });

    return res.status(200).json({
      success: true,
      message: "Berita berhasil diperbarui!",
      data: updatedBerita
    });

  } catch (error) {
    console.error("Error update berita:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat memperbarui berita." 
    });
  }
};

// ==========================================
// 5. HAPUS BERITA (DELETE)
// ==========================================
export const deleteBerita = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Cari data berita yang mau dihapus
    const beritaTarget = await prisma.berita.findUnique({
      where: { id_berita: id }
    });

    if (!beritaTarget) {
      return res.status(404).json({ success: false, message: "Berita yang ingin dihapus tidak ditemukan!" });
    }

    // 2. Hapus file foto dari harddisk jika beritanya punya gambar
    if (beritaTarget.foto) {
      const pathFoto = `./public/uploads/${beritaTarget.foto}`;
      if (fs.existsSync(pathFoto)) {
        fs.unlinkSync(pathFoto); 
      }
    }

    // 3. Hapus data dari database
    await prisma.berita.delete({
      where: { id_berita: id }
    });

    return res.status(200).json({
      success: true,
      message: "Berita berhasil dihapus permanen beserta gambarnya!"
    });

  } catch (error) {
    console.error("Error delete berita:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat menghapus berita." 
    });
  }
};