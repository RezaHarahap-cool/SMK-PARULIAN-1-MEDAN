import prisma from '../../config/prisma.js';

export const getJadwalPelajaranSiswa = async (req, res) => {
  try {
    const id_users = req.user.id_users; // Dari Token

    // 1. Cari Profil Siswa
    const profilSiswa = await prisma.siswaProfile.findUnique({
      where: { users_id: id_users }
    });

    if (!profilSiswa) {
      return res.status(404).json({ success: false, message: "Profil siswa tidak ditemukan." });
    }

    // 2. Ambil Tahun Ajaran Aktif
    const tahunAktif = await prisma.tahunAjaran.findFirst({
      where: { status: "AKTIF" }
    });

    if (!tahunAktif) {
      return res.status(400).json({ success: false, message: "Tidak ada Tahun Ajaran yang aktif." });
    }

    // 3. Cari Siswa ini sedang duduk di kelas mana tahun ini?
    const riwayatKelas = await prisma.riwayatKelasSiswa.findFirst({
      where: {
        siswa_id: profilSiswa.id_siswa,
        tahun_ajaran_id: tahunAktif.id_tahun_ajaran
      },
      include: {
        kelas: {
          include: { jurusan: true } // Tarik info jurusan juga
        }
      }
    });

    if (!riwayatKelas) {
      return res.status(404).json({ success: false, message: "Siswa belum terdaftar di kelas manapun tahun ini." });
    }

    // 4. Tarik Jadwal Pelajaran khusus untuk Kelas tersebut
    const jadwalKelas = await prisma.jadwal.findMany({
      where: {
        kelas_id: riwayatKelas.kelas_id,
        tahun_ajaran_id: tahunAktif.id_tahun_ajaran
      },
      include: { mapel: true, guru: true, mengajar: true },
      orderBy: [{ hari: 'asc' }, { jam_mulai: 'asc' }]
    });

    // 5. Susun respons (Kirim info Kelas dan Jadwalnya)
    res.status(200).json({
      success: true,
      infoKelas: {
        nama_kelas: riwayatKelas.kelas.nama_kelas,
        nama_jurusan: riwayatKelas.kelas.jurusan.jurusan
      },
      dataJadwal: jadwalKelas.map((jadwal) => ({
        ...jadwal,
        guru: jadwal.les === 0 ? null : jadwal.guru
      }))
    });

  } catch (error) {
    console.error("Error getJadwalPelajaranSiswa:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengambil jadwal."
    });
  }
};
