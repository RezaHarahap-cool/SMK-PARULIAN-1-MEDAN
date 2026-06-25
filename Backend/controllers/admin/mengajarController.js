import prisma from '../../config/prisma.js';

const validateGuruMapelMatch = async ({ guru_id, mapel_id }) => {
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

    return `${guru.nama_guru} hanya terdaftar mengampu ${guru.mata_pelajaran?.mapel || "mapel belum ditentukan"}, tidak boleh diplot untuk ${mapel?.mapel || "mapel ini"}.`;
  }

  return null;
};

// ==========================================
// 1. TAMPILKAN DAFTAR MENGAJAR (GET)
// ==========================================
const getMengajar = async (req, res) => {
  try {
    const dataMengajar = await prisma.mengajar.findMany({
      // include ini fungsinya seperti JOIN di SQL
      // Agar frontend bisa langsung menampilkan Nama Guru & Nama Kelas, bukan UUID-nya
      include: {
        guru: {
          select: { nama_guru: true }
        },
        mapel: {
          select: { mapel: true }
        },
        kelas: {
          select: { nama_kelas: true }
        },
        tahun_ajaran: {
          select: { tahun: true, status: true }
        },
        semester: {
          select: { semester: true, status: true }
        }
      },
      orderBy: {
        kelas: { nama_kelas: 'asc' } // Urutkan berdasarkan nama kelas biar rapi
      }
    });

    res.status(200).json({
      success: true,
      data: dataMengajar,
    });
  } catch (error) {
    console.error("Error getMengajar:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data mengajar.",
    });
  }
};

// ==========================================
// 2. TAMBAH DATA MENGAJAR BARU (POST)
// ==========================================
const tambahMengajar = async (req, res) => {
  // Admin HANYA mengirim 4 data ini dari frontend
  const { guru_id, mapel_id, kelas_id, total_pertemuan } = req.body;

  try {
    if (!guru_id || !mapel_id || !kelas_id) {
      return res.status(400).json({
        success: false,
        message: "Guru, mata pelajaran, dan kelas wajib diisi.",
      });
    }

    // [LOGIKA CERDAS] 1. Cari Tahun Ajaran yang sedang AKTIF
    const tahunAjaranAktif = await prisma.tahunAjaran.findFirst({
      where: { status: "AKTIF" }
    });

    if (!tahunAjaranAktif) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada Tahun Ajaran yang aktif! Silakan aktifkan di menu Tahun Ajaran."
      });
    }

    // [LOGIKA CERDAS] 2. Cari Semester yang sedang AKTIF
    const semesterAktif = await prisma.semester.findFirst({
      where: { status: "AKTIF" }
    });

    if (!semesterAktif) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada Semester yang aktif! Silakan aktifkan di menu Semester."
      });
    }

    const errorGuruMapel = await validateGuruMapelMatch({ guru_id, mapel_id });
    if (errorGuruMapel) {
      return res.status(400).json({
        success: false,
        message: errorGuruMapel,
      });
    }

    // 3. Simpan data ke Database
    const newMengajar = await prisma.mengajar.create({
      data: {
        guru_id: guru_id,
        mapel_id: mapel_id,
        kelas_id: kelas_id,
        // Ambil ID secara otomatis dari pencarian di atas
        tahun_ajaran_id: tahunAjaranAktif.id_tahun_ajaran, 
        semester_id: semesterAktif.id_semester,
        total_pertemuan: total_pertemuan || 16 // Default ke 16 jika admin lupa mengisi
      }
    });

    res.status(201).json({
      success: true,
      message: "Data tugas mengajar berhasil ditambahkan!",
      data: newMengajar
    });

  } catch (error) {
    console.error("Error tambahMengajar:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menyimpan data mengajar server error.",
    });
  }
};


// ==========================================
// 3. EDIT DATA MENGAJAR (PUT/PATCH)
// ==========================================
const updateMengajar = async (req, res) => {
  const { id_mengajar } = req.params;
  const { guru_id, mapel_id, kelas_id, total_pertemuan } = req.body;

  try {
    // Pastikan data yang mau diedit itu benar-benar ada di database
    const checkData = await prisma.mengajar.findUnique({
      where: { id_mengajar: id_mengajar }
    });

    if (!checkData) {
      return res.status(404).json({
        success: false,
        message: "Data tugas mengajar tidak ditemukan!"
      });
    }

    const nextGuruId = guru_id || checkData.guru_id;
    const nextMapelId = mapel_id || checkData.mapel_id;
    const errorGuruMapel = await validateGuruMapelMatch({ guru_id: nextGuruId, mapel_id: nextMapelId });
    if (errorGuruMapel) {
      return res.status(400).json({
        success: false,
        message: errorGuruMapel,
      });
    }

    // Lakukan proses update (Tahun ajaran & semester tidak perlu diubah)
    const updatedMengajar = await prisma.mengajar.update({
      where: { id_mengajar: id_mengajar },
      data: {
        guru_id: nextGuruId,
        mapel_id: nextMapelId,
        kelas_id: kelas_id || checkData.kelas_id,
        total_pertemuan: total_pertemuan ? parseInt(total_pertemuan) : checkData.total_pertemuan
      }
    });

    res.status(200).json({
      success: true,
      message: "Data tugas mengajar berhasil diperbarui!",
      data: updatedMengajar
    });

  } catch (error) {
    console.error("Error updateMengajar:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat memperbarui data."
    });
  }
};

// ==========================================
// 4. HAPUS DATA MENGAJAR (DELETE)
// ==========================================
const deleteMengajar = async (req, res) => {
  const { id_mengajar } = req.params;

  try {
    // Cek dulu apakah datanya ada
    const checkData = await prisma.mengajar.findUnique({
      where: { id_mengajar: id_mengajar }
    });

    if (!checkData) {
      return res.status(404).json({
        success: false,
        message: "Data tugas mengajar tidak ditemukan!"
      });
    }

    // Eksekusi penghapusan data
    await prisma.mengajar.delete({
      where: { id_mengajar: id_mengajar }
    });

    res.status(200).json({
      success: true,
      message: "Data plotting mengajar berhasil dihapus secara permanen!"
    });

  } catch (error) {
    console.error("Error deleteMengajar:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat menghapus data."
    });
  }
};

// JANGAN LUPA: Tambahkan nama fungsinya di dalam export!
export { getMengajar, tambahMengajar, updateMengajar, deleteMengajar };
