import prisma from '../../config/prisma.js';

// ==========================================
// SIMPAN PRESENSI BANYAK SISWA SEKALIGUS (BULK)
// ==========================================
export const simpanAbsensi = async (req, res) => {
  // Data yang dikirim dari Frontend React
  const { mengajar_id, tgl_absensi, topik, pertemuan, siswaData } = req.body;

  try {
    // 1. Validasi sederhana
    if (!mengajar_id || !siswaData || siswaData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Data presensi tidak lengkap!"
      });
    }

    // 2. Ambil Waktu Akademik yang Sedang Aktif
    const tahunAktif = await prisma.tahunAjaran.findFirst({ where: { status: "AKTIF" } });
    const semesterAktif = await prisma.semester.findFirst({ where: { status: "AKTIF" } });

    if (!tahunAktif || !semesterAktif) {
      return res.status(400).json({
        success: false,
        message: "Sistem menolak: Tidak ada Tahun Ajaran atau Semester yang aktif."
      });
    }

    const profilGuru = await prisma.guruProfile.findUnique({
      where: { users_id: req.user.id_users }
    });

    if (!profilGuru) {
      return res.status(404).json({
        success: false,
        message: "Profil guru tidak ditemukan di database."
      });
    }

    const mengajar = await prisma.mengajar.findFirst({
      where: {
        id_mengajar: mengajar_id,
        guru_id: profilGuru.id_guru,
        tahun_ajaran_id: tahunAktif.id_tahun_ajaran,
        semester_id: semesterAktif.id_semester
      },
      select: {
        id_mengajar: true,
        kelas_id: true
      }
    });

    if (!mengajar) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses mengisi presensi untuk jadwal mengajar ini."
      });
    }

    const siswaIds = [...new Set(siswaData.map((siswa) => siswa.id).filter(Boolean))];
    const siswaDiKelas = await prisma.riwayatKelasSiswa.findMany({
      where: {
        kelas_id: mengajar.kelas_id,
        tahun_ajaran_id: tahunAktif.id_tahun_ajaran,
        siswa_id: { in: siswaIds }
      },
      select: { siswa_id: true }
    });
    const validSiswaIds = new Set(siswaDiKelas.map((item) => item.siswa_id));
    const invalidSiswaIds = siswaIds.filter((siswaId) => !validSiswaIds.has(siswaId));

    if (invalidSiswaIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Data presensi memuat siswa yang tidak terdaftar pada kelas mengajar ini."
      });
    }

    // 3. Rakit Data (Mapping) sesuai format Tabel 3.37
    // Kita ubah array siswa dari frontend menjadi format Prisma
    const dataYangAkanDisimpan = siswaData.map((siswa) => ({
      tahun_ajaran_id: tahunAktif.id_tahun_ajaran,
      semester_id: semesterAktif.id_semester,
      siswa_id: siswa.id,
      mengajar_id: mengajar_id,
      // Ubah string tanggal YYYY-MM-DD jadi format DateTime Prisma
      tgl_absensi: new Date(tgl_absensi), 
      topik: topik || "Tanpa Topik",
      pertemuan: String(pertemuan), // Sesuai skema: VARCHAR(55)
      
      // Jika guru lupa klik radio button, default jadikan "Alpha"
      keterangan: siswa.status !== "" ? siswa.status : "Alpha",
      
      // Catatan sikap itu opsional (bisa null)
      catatan_sikap: siswa.catatan ? siswa.catatan : null
    }));

    // Jika pertemuan yang sama pernah diisi, simpan ulang sebagai koreksi, bukan duplikasi.
    await prisma.absensi.deleteMany({
      where: {
        mengajar_id,
        pertemuan: String(pertemuan),
      }
    });

    // 4. JURUS PAMUNGKAS: BULK INSERT
    // Menyimpan puluhan data sekaligus dalam 1x proses query!
    const result = await prisma.absensi.createMany({
      data: dataYangAkanDisimpan,
    });

    res.status(201).json({
      success: true,
      message: `Luar biasa! Presensi untuk ${result.count} siswa berhasil direkam.`,
    });

  } catch (error) {
    console.error("Error simpanAbsensi:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat menyimpan data presensi."
    });
  }
};

// Tambahkan fungsi ini di atas atau di bawah simpanAbsensi
export const getJadwalMengajarGuru = async (req, res) => {
  try {
    // 1. Ambil id_users dari token yang dikirim oleh middleware verifyToken
    const id_users = req.user.id_users;

    // 2. Cari identitas Guru (id_guru) berdasarkan id_users tersebut
    const profilGuru = await prisma.guruProfile.findUnique({
      where: { users_id: id_users }
    });

    if (!profilGuru) {
      return res.status(404).json({ 
        success: false, 
        message: "Profil guru tidak ditemukan di database." 
      });
    }

    // 3. Tarik data jadwal mengajar HANYA untuk guru ini saja
    const dataMengajar = await prisma.mengajar.findMany({
      where: {
        guru_id: profilGuru.id_guru,
        jadwal: { some: { les: { not: 0 } } }
      },
      include: {
        kelas: true,
        mapel: true,
        guru: true, // Membawa nama guru untuk ditampilkan di frontend
        jadwal: {
          where: { les: { not: 0 } },
          orderBy: [{ hari: 'asc' }, { jam_mulai: 'asc' }]
        }
      }
    });

    res.status(200).json({
      success: true,
      data: dataMengajar
    });

  } catch (error) {
    console.error("Error getJadwalMengajarGuru:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengambil jadwal."
    });
  }
};

export const getRiwayatAbsensiGuru = async (req, res) => {
  try {
    const { mengajar_id } = req.params;
    const id_users = req.user.id_users;

    const profilGuru = await prisma.guruProfile.findUnique({
      where: { users_id: id_users }
    });

    if (!profilGuru) {
      return res.status(404).json({ success: false, message: "Profil guru tidak ditemukan di database." });
    }

    const mengajar = await prisma.mengajar.findFirst({
      where: { id_mengajar: mengajar_id, guru_id: profilGuru.id_guru }
    });

    if (!mengajar) {
      return res.status(403).json({ success: false, message: "Anda tidak memiliki akses ke jadwal mengajar ini." });
    }

    const records = await prisma.absensi.findMany({
      where: { mengajar_id },
      orderBy: [{ tgl_absensi: 'desc' }, { pertemuan: 'desc' }],
    });

    const grouped = new Map();
    for (const item of records) {
      const key = item.pertemuan;
      if (!grouped.has(key)) {
        grouped.set(key, {
          pertemuan: item.pertemuan,
          tanggal: item.tgl_absensi,
          topik: item.topik,
          total: 0,
          hadir: 0,
          izin: 0,
          sakit: 0,
          alpha: 0,
        });
      }

      const row = grouped.get(key);
      row.total += 1;
      const status = String(item.keterangan || '').toLowerCase();
      if (status === 'hadir') row.hadir += 1;
      if (status === 'izin') row.izin += 1;
      if (status === 'sakit') row.sakit += 1;
      if (status === 'alpha') row.alpha += 1;
    }

    res.status(200).json({
      success: true,
      data: [...grouped.values()].map((item) => ({
        ...item,
        tanggal: item.tanggal.toISOString().split('T')[0],
      }))
    });
  } catch (error) {
    console.error("Error getRiwayatAbsensiGuru:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat mengambil riwayat presensi." });
  }
};

export const getDetailRiwayatAbsensiGuru = async (req, res) => {
  try {
    const { mengajar_id, pertemuan } = req.params;
    const id_users = req.user.id_users;

    const profilGuru = await prisma.guruProfile.findUnique({
      where: { users_id: id_users }
    });

    if (!profilGuru) {
      return res.status(404).json({ success: false, message: "Profil guru tidak ditemukan di database." });
    }

    const mengajar = await prisma.mengajar.findFirst({
      where: { id_mengajar: mengajar_id, guru_id: profilGuru.id_guru }
    });

    if (!mengajar) {
      return res.status(403).json({ success: false, message: "Anda tidak memiliki akses ke jadwal mengajar ini." });
    }

    const records = await prisma.absensi.findMany({
      where: { mengajar_id, pertemuan: String(pertemuan) },
      include: { siswa: true },
      orderBy: { siswa: { nama_siswa: 'asc' } }
    });

    const first = records[0];
    res.status(200).json({
      success: true,
      data: {
        pertemuan: String(pertemuan),
        tanggal: first?.tgl_absensi ? first.tgl_absensi.toISOString().split('T')[0] : "",
        topik: first?.topik || "",
        siswaData: records.map((item) => ({
          id: item.siswa_id,
          nama: item.siswa?.nama_siswa || "-",
          status: item.keterangan,
          catatan: item.catatan_sikap || "",
        }))
      }
    });
  } catch (error) {
    console.error("Error getDetailRiwayatAbsensiGuru:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat mengambil detail presensi." });
  }
};
