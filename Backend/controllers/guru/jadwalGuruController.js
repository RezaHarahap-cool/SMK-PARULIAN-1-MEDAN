import prisma from '../../config/prisma.js';

export const getJadwalPribadi = async (req, res) => {
  try {
    // 1. Ambil ID Akun dari token JWT
    const id_users = req.user.id_users;

    // 2. Cari ID Guru aslinya
    const profilGuru = await prisma.guruProfile.findUnique({
      where: { users_id: id_users }
    });

    if (!profilGuru) {
      return res.status(404).json({ success: false, message: "Profil guru tidak ditemukan." });
    }

    // 3. Ambil Tahun Ajaran yang sedang Aktif
    const tahunAktif = await prisma.tahunAjaran.findFirst({
      where: { status: "AKTIF" }
    });

    if (!tahunAktif) {
      return res.status(400).json({ success: false, message: "Tidak ada Tahun Ajaran yang aktif." });
    }

    // 4. Tarik Jadwal Mengajar Khusus Guru ini
    const jadwal = await prisma.jadwal.findMany({
      where: { 
        guru_id: profilGuru.id_guru,
        tahun_ajaran_id: tahunAktif.id_tahun_ajaran,
        les: { not: 0 }
      },
      include: {
        mapel: true,
        kelas: {
          include: { jurusan: true } // Tarik sekalian nama jurusannya
        }
      },
      orderBy: [{ hari: 'asc' }, { jam_mulai: 'asc' }]
    });

    res.status(200).json({
      success: true,
      data: jadwal
    });

  } catch (error) {
    console.error("Error getJadwalPribadi:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengambil jadwal."
    });
  }
};
