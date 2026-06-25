import prisma from '../../config/prisma.js';

const isActivityLes = (les) => Number(les) === 0;

const formatJadwalResponse = (jadwal) => ({
  ...jadwal,
  guru: isActivityLes(jadwal.les) ? null : jadwal.guru
});

const getPairLes = (les) => {
  const lesNumber = Number(les);
  if (!Number.isInteger(lesNumber) || lesNumber <= 0) return null;
  return lesNumber % 2 === 1 ? lesNumber + 1 : lesNumber - 1;
};

const MAX_JADWAL_PER_GURU_MAPEL_KELAS = 4;

const resolveGuruId = async ({ kelas_id, guru_id, les }) => {
  if (!isActivityLes(les)) return guru_id;
  if (guru_id) return guru_id;

  const kelas = await prisma.kelas.findUnique({
    where: { id_kelas: kelas_id },
    select: { guru_id: true }
  });
  if (kelas?.guru_id) return kelas.guru_id;

  const guru = await prisma.guruProfile.findFirst({ select: { id_guru: true } });
  return guru?.id_guru || null;
};

const resolveMengajarForLesson = async ({ kelas_id, mapel_id, guru_id, tahun_ajaran_id, les }) => {
  if (isActivityLes(les)) return null;

  const semesterAktif = await prisma.semester.findFirst({
    where: { status: 'AKTIF' }
  });

  if (!semesterAktif) {
    throw new Error('Semester aktif tidak ditemukan. Aktifkan semester terlebih dahulu sebelum membuat roster pelajaran.');
  }

  const existingMengajar = await prisma.mengajar.findFirst({
    where: {
      kelas_id,
      mapel_id,
      guru_id,
      tahun_ajaran_id,
      semester_id: semesterAktif.id_semester
    }
  });

  if (existingMengajar) return existingMengajar;

  return prisma.mengajar.create({
    data: {
      kelas_id,
      mapel_id,
      guru_id,
      tahun_ajaran_id,
      semester_id: semesterAktif.id_semester,
      total_pertemuan: 24
    }
  });
};

const validateGuruMapelMatch = async ({ guru_id, mapel_id, les }) => {
  if (isActivityLes(les)) return null;

  const guru = await prisma.guruProfile.findUnique({
    where: { id_guru: guru_id },
    include: { mata_pelajaran: true }
  });

  if (!guru) {
    return "Guru tidak ditemukan.";
  }

  if (guru.mapel_id !== mapel_id) {
    const mapel = await prisma.mataPelajaran.findUnique({
      where: { id_mapel: mapel_id },
      select: { mapel: true }
    });

    return `${guru.nama_guru} hanya terdaftar mengampu ${guru.mata_pelajaran?.mapel || "mapel belum ditentukan"}, tidak boleh dijadwalkan untuk ${mapel?.mapel || "mapel ini"}.`;
  }

  return null;
};

const validateMaksimalJadwalMengajar = async ({ id_jadwal, kelas_id, mapel_id, guru_id, tahun_ajaran_id, les }) => {
  if (isActivityLes(les)) return null;

  const totalJadwal = await prisma.jadwal.count({
    where: {
      kelas_id,
      mapel_id,
      guru_id,
      tahun_ajaran_id,
      les: { not: 0 },
      ...(id_jadwal ? { id_jadwal: { not: id_jadwal } } : {})
    }
  });

  if (totalJadwal >= MAX_JADWAL_PER_GURU_MAPEL_KELAS) {
    return `Maksimal ${MAX_JADWAL_PER_GURU_MAPEL_KELAS} jadwal untuk guru, mapel, dan kelas yang sama.`;
  }

  return null;
};

const validatePasanganDuaLes = async ({ id_jadwal, kelas_id, mapel_id, guru_id, mengajar_id, tahun_ajaran_id, hari, les }) => {
  const pairLes = getPairLes(les);
  if (!pairLes) return null;

  const pasangan = await prisma.jadwal.findFirst({
    where: {
      kelas_id,
      tahun_ajaran_id,
      hari,
      les: pairLes,
      ...(id_jadwal ? { id_jadwal: { not: id_jadwal } } : {})
    }
  });

  if (!pasangan) return null;

  if (pasangan.mengajar_id && mengajar_id && pasangan.mengajar_id !== mengajar_id) {
    return `Les ${les} harus memakai data mengajar yang sama dengan Les ${pairLes} jika kedua les dipasangkan.`;
  }

  if (pasangan.mapel_id !== mapel_id || pasangan.guru_id !== guru_id) {
    return `Les ${les} harus memakai mata pelajaran dan guru yang sama dengan Les ${pairLes} jika kedua les dipasangkan.`;
  }

  return null;
};

// 1. TAMBAH JADWAL (DENGAN VALIDASI ANTI-BENTROK)
export const createJadwal = async (req, res) => {
  try {
    const { kelas_id, mapel_id, guru_id, tahun_ajaran_id, hari, jam_mulai, jam_berakhir, les } = req.body;
    const lesNumber = Number.parseInt(les, 10);

    if (!kelas_id || !mapel_id || !tahun_ajaran_id || !hari || !jam_mulai || !jam_berakhir || Number.isNaN(lesNumber)) {
      return res.status(400).json({ success: false, message: "Data jadwal belum lengkap." });
    }

    const resolvedGuruId = await resolveGuruId({ kelas_id, guru_id, les: lesNumber });

    if (!resolvedGuruId) {
      return res.status(400).json({ success: false, message: "Guru tidak ditemukan untuk menyimpan jadwal." });
    }

    const errorGuruMapel = await validateGuruMapelMatch({ guru_id: resolvedGuruId, mapel_id, les: lesNumber });
    if (errorGuruMapel) {
      return res.status(400).json({ success: false, message: errorGuruMapel });
    }

    const errorMaksimalJadwal = await validateMaksimalJadwalMengajar({
      kelas_id,
      mapel_id,
      guru_id: resolvedGuruId,
      tahun_ajaran_id,
      les: lesNumber
    });
    if (errorMaksimalJadwal) {
      return res.status(400).json({ success: false, message: errorMaksimalJadwal });
    }

    const mengajar = await resolveMengajarForLesson({
      kelas_id,
      mapel_id,
      guru_id: resolvedGuruId,
      tahun_ajaran_id,
      les: lesNumber
    });

    // A. VALIDASI: Cek apakah Guru sudah punya jadwal di jam yang sama (Overlap)
    const jadwalGuruBentrok = isActivityLes(lesNumber)
      ? null
      : await prisma.jadwal.findFirst({
          where: {
            guru_id: resolvedGuruId,
            tahun_ajaran_id,
            hari,
            // Cek overlap waktu
            jam_mulai: { lt: jam_berakhir },
            jam_berakhir: { gt: jam_mulai }
          }
        });

    if (jadwalGuruBentrok) {
      return res.status(400).json({ 
        success: false, 
        message: "Guru bentrok! Beliau sudah punya jadwal mengajar di kelas lain pada jam ini." 
      });
    }

    // B. VALIDASI: Cek apakah Kelas sudah terisi (Overlap)
    const jadwalKelasBentrok = await prisma.jadwal.findFirst({
      where: {
        kelas_id,
        tahun_ajaran_id,
        hari,
        jam_mulai: { lt: jam_berakhir },
        jam_berakhir: { gt: jam_mulai }
      }
    });

    if (jadwalKelasBentrok) {
      return res.status(400).json({ 
        success: false, 
        message: "Kelas bentrok! Sudah ada pelajaran lain pada jam ini di kelas tersebut." 
      });
    }

    const errorPasanganLes = await validatePasanganDuaLes({
      kelas_id,
      mapel_id,
      guru_id: resolvedGuruId,
      mengajar_id: mengajar?.id_mengajar,
      tahun_ajaran_id,
      hari,
      les: lesNumber
    });
    if (errorPasanganLes) {
      return res.status(400).json({ success: false, message: errorPasanganLes });
    }

    // C. JIKA AMAN, SIMPAN DATA
    const newJadwal = await prisma.jadwal.create({
      data: { kelas_id, mapel_id, guru_id: resolvedGuruId, tahun_ajaran_id, mengajar_id: mengajar?.id_mengajar || null, hari, jam_mulai, jam_berakhir, les: lesNumber }
    });

    return res.status(201).json({ success: true, message: "Jadwal berhasil disimpan!", data: newJadwal });

  } catch (error) {
    console.error("Error create jadwal:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error." });
  }
};

// 2. GET JADWAL (Bisa filter by kelas atau guru)
export const getJadwal = async (req, res) => {
  try {
    const { kelas_id, guru_id, tahun_ajaran_id } = req.query;

    const jadwal = await prisma.jadwal.findMany({
      where: { 
        kelas_id, 
        guru_id, 
        tahun_ajaran_id 
      },
      include: {
        mapel: true,
        guru: true,
        kelas: true,
        mengajar: true
      },
      orderBy: [{ hari: 'asc' }, { jam_mulai: 'asc' }]
    });

    return res.status(200).json({ success: true, data: jadwal.map(formatJadwalResponse) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal mengambil data." });
  }
};

// 3. DELETE JADWAL
export const deleteJadwal = async (req, res) => {
  try {
    await prisma.jadwal.delete({ where: { id_jadwal: req.params.id } });
    return res.status(200).json({ success: true, message: "Jadwal dihapus!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal hapus." });
  }
};

// 4. GET JADWAL BY ID (DETAIL DATA)
export const getJadwalById = async (req, res) => {
  try {
    const { id } = req.params;

    const jadwal = await prisma.jadwal.findUnique({
      where: { id_jadwal: id },
      include: {
        mapel: true,
        guru: true,
        kelas: true,
        mengajar: true,
        tahun_ajaran: true
      }
    });

    if (!jadwal) {
      return res.status(404).json({ success: false, message: "Data jadwal tidak ditemukan." });
    }

    return res.status(200).json({ success: true, data: formatJadwalResponse(jadwal) });
  } catch (error) {
    console.error("Error get detail jadwal:", error);
    return res.status(500).json({ success: false, message: "Gagal mengambil detail jadwal." });
  }
};

// 5. UPDATE JADWAL (EDIT DATA)
export const updateJadwal = async (req, res) => {
  try {
    const { id } = req.params;
    const { kelas_id, mapel_id, guru_id, tahun_ajaran_id, hari, jam_mulai, jam_berakhir, les } = req.body;
    const lesNumber = Number.parseInt(les, 10);

    if (!kelas_id || !mapel_id || !tahun_ajaran_id || !hari || !jam_mulai || !jam_berakhir || Number.isNaN(lesNumber)) {
      return res.status(400).json({ success: false, message: "Data jadwal belum lengkap." });
    }

    const resolvedGuruId = await resolveGuruId({ kelas_id, guru_id, les: lesNumber });

    if (!resolvedGuruId) {
      return res.status(400).json({ success: false, message: "Guru tidak ditemukan untuk menyimpan jadwal." });
    }

    const errorGuruMapel = await validateGuruMapelMatch({ guru_id: resolvedGuruId, mapel_id, les: lesNumber });
    if (errorGuruMapel) {
      return res.status(400).json({ success: false, message: errorGuruMapel });
    }

    const errorMaksimalJadwal = await validateMaksimalJadwalMengajar({
      id_jadwal: id,
      kelas_id,
      mapel_id,
      guru_id: resolvedGuruId,
      tahun_ajaran_id,
      les: lesNumber
    });
    if (errorMaksimalJadwal) {
      return res.status(400).json({ success: false, message: errorMaksimalJadwal });
    }

    const mengajar = await resolveMengajarForLesson({
      kelas_id,
      mapel_id,
      guru_id: resolvedGuruId,
      tahun_ajaran_id,
      les: lesNumber
    });

    // A. VALIDASI ANTI-BENTROK GURU (Kecualikan ID jadwal yang sedang di-edit)
    const jadwalGuruBentrok = isActivityLes(lesNumber)
      ? null
      : await prisma.jadwal.findFirst({
          where: {
            guru_id: resolvedGuruId,
            tahun_ajaran_id,
            hari,
            id_jadwal: { not: id }, // JANGAN cek jadwal ini sendiri
            jam_mulai: { lt: jam_berakhir },
            jam_berakhir: { gt: jam_mulai }
          }
        });

    if (jadwalGuruBentrok) {
      return res.status(400).json({ 
        success: false, 
        message: "Guru bentrok! Beliau sudah punya jadwal di kelas lain pada jam ini." 
      });
    }

    // B. VALIDASI ANTI-BENTROK KELAS (Kecualikan ID jadwal yang sedang di-edit)
    const jadwalKelasBentrok = await prisma.jadwal.findFirst({
      where: {
        kelas_id,
        tahun_ajaran_id,
        hari,
        id_jadwal: { not: id }, // JANGAN cek jadwal ini sendiri
        jam_mulai: { lt: jam_berakhir },
        jam_berakhir: { gt: jam_mulai }
      }
    });

    if (jadwalKelasBentrok) {
      return res.status(400).json({ 
        success: false, 
        message: "Kelas bentrok! Sudah ada pelajaran lain pada jam ini di kelas tersebut." 
      });
    }

    const errorPasanganLes = await validatePasanganDuaLes({
      id_jadwal: id,
      kelas_id,
      mapel_id,
      guru_id: resolvedGuruId,
      mengajar_id: mengajar?.id_mengajar,
      tahun_ajaran_id,
      hari,
      les: lesNumber
    });
    if (errorPasanganLes) {
      return res.status(400).json({ success: false, message: errorPasanganLes });
    }

    // C. JIKA AMAN, LAKUKAN UPDATE
    const updatedJadwal = await prisma.jadwal.update({
      where: { id_jadwal: id },
      data: { kelas_id, mapel_id, guru_id: resolvedGuruId, tahun_ajaran_id, mengajar_id: mengajar?.id_mengajar || null, hari, jam_mulai, jam_berakhir, les: lesNumber }
    });

    return res.status(200).json({ success: true, message: "Jadwal berhasil diperbarui!", data: updatedJadwal });

  } catch (error) {
    console.error("Error update jadwal:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error saat memperbarui jadwal." });
  }
};
