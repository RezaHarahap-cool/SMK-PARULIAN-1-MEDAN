import prisma from '../../config/prisma.js';

export const getProfileGuru = async (req, res) => {
  try {
    const userId = req.user.id_users;

    const myProfile = await prisma.user.findUnique({
      where: {
        id_users: userId,
      },
      // BUKA SEMUA KERAN DATA DI SINI
      select: {
        username: true,
        email: true,
        role: true,
        guru: { // Asumsi nama relasi di model User-mu adalah 'guru'
          select: {
            id_guru: true,
            nama_guru: true,
            tgl_lahir: true,
            gender: true,
            agama: true,
            pendidikan_tertinggi: true,
            no_hp: true,
            foto: true,
            // Tarik data nama mapel dari tabel relasinya
            mata_pelajaran: {
              select: {
                mapel: true
              }
            },
            kelas_wali: {
              select: {
                id_kelas: true,
                nama_kelas: true,
                ruang_kelas: true
              }
            }
          }
        }
      }
    });

    if (!myProfile) {
      return res.status(404).json({ success: false, message: "Data guru tidak ditemukan." });
    }

    res.status(200).json({
      success: true,
      message: "Data profil guru berhasil ditarik secara lengkap!",
      data: myProfile
    });

  } catch (error) {
    console.error("Gagal mengambil profil guru:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

export const updateProfileGuru = async (req, res) => {
  try {
    const userId = req.user.id_users;
    const { no_hp, agama } = req.body;

    const dataUpdate = {};
    if (no_hp !== undefined) dataUpdate.no_hp = no_hp;
    if (agama !== undefined) dataUpdate.agama = agama;
    if (req.file) dataUpdate.foto = req.file.filename;

    if (Object.keys(dataUpdate).length === 0) {
      return res.status(400).json({ success: false, message: "Tidak ada data yang dikirim untuk diperbarui." });
    }

    const updated = await prisma.guruProfile.update({
      where: { users_id: userId },
      data: dataUpdate,
    });

    res.status(200).json({ success: true, message: "Profil guru berhasil diperbarui.", data: updated });
  } catch (error) {
    console.error("Gagal update profil guru:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat memperbarui profil." });
  }
};
