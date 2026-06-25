import prisma from '../../config/prisma.js';

// ==========================================
// AMBIL DATA PROFIL KEPALA SEKOLAH
// ==========================================
export const getProfileKepsek = async (req, res) => {
  try {
    // 1. Ambil id_users dari token (hasil dari verifyToken)
    const id_users = req.user.id_users;

    // 2. Cari data Kepala Sekolah di database
    const profilKepsek = await prisma.kepalaSekolahProfile.findUnique({
      where: { users_id: id_users },
      include: {
        user: {
          select: {
            email: true,
            username: true,
            role: true,
            is_active: true
          }
        }
      }
    });

    if (!profilKepsek) {
      return res.status(404).json({ 
        success: false, 
        message: "Profil Kepala Sekolah tidak ditemukan di database." 
      });
    }

    // 3. Kirim data ke Frontend
    res.status(200).json({
      success: true,
      data: profilKepsek
    });

  } catch (error) {
    console.error("Error getProfileKepsek:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengambil profil Kepala Sekolah."
    });
  }
};

export const updateProfileKepsek = async (req, res) => {
  try {
    const id_users = req.user.id_users;
    const { no_hp, agama } = req.body;

    const dataUpdate = {};
    if (no_hp !== undefined) dataUpdate.no_hp = no_hp;
    if (agama !== undefined) dataUpdate.agama = agama;
    if (req.file) dataUpdate.foto = req.file.filename;

    if (Object.keys(dataUpdate).length === 0) {
      return res.status(400).json({ success: false, message: "Tidak ada data yang dikirim untuk diperbarui." });
    }

    const updated = await prisma.kepalaSekolahProfile.update({
      where: { users_id: id_users },
      data: dataUpdate,
    });

    res.status(200).json({ success: true, message: "Profil kepala sekolah berhasil diperbarui.", data: updated });
  } catch (error) {
    console.error("Error updateProfileKepsek:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat memperbarui profil Kepala Sekolah." });
  }
};
