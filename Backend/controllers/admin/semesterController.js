import prisma from '../../config/prisma.js';

const getSemesters = async (req, res) => {
  try {
    const semesters = await prisma.semester.findMany({
      orderBy: {
        semester: "desc", // Diurutkan agar rapi
      },
    });

    res.status(200).json({
      success: true,
      data: semesters,
    });
  } catch (error) {
    console.error("Error getSemesters:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data semester.",
    });
  }
};

// ==========================================
// 2. TOGGLE AKTIFKAN SEMESTER (Saklar Utama)
// ==========================================
const aktifkanSemester = async (req, res) => {
  const { id_semester } = req.params;

  try {
    const checkSemester = await prisma.semester.findUnique({
      where: { id_semester: id_semester },
    });

    if (!checkSemester) {
      return res.status(404).json({
        success: false,
        message: "Data semester tidak ditemukan!",
      });
    }

    await prisma.$transaction(async (tx) => {
      // Langkah 1: Ubah SEMUA semester menjadi NON_AKTIF
      await tx.semester.updateMany({
        data: {
          status: "NON_AKTIF",
        },
      });

      // Langkah 2: Ubah HANYA semester yang dipilih menjadi AKTIF
      await tx.semester.update({
        where: { id_semester: id_semester },
        data: {
          status: "AKTIF",
        },
      });
    });

    res.status(200).json({
      success: true,
      message: `Semester ${checkSemester.semester} berhasil diaktifkan. Semester lain otomatis dinonaktifkan.`,
    });
  } catch (error) {
    console.error("Error aktifkanSemester:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengubah status semester.",
    });
  }
};

// Gunakan export ESM modern, BUKAN module.exports

// ==========================================
// 3. TAMBAH SEMESTER BARU (Untuk Postman)
// ==========================================
const tambahSemester = async (req, res) => {
  const { semester, status } = req.body;

  try {
    const newSemester = await prisma.semester.create({
      data: {
        semester: semester, // "GANJIL" atau "GENAP"
        status: status || "NON_AKTIF", // Defaultnya mati kalau tidak diisi
      },
    });

    res.status(201).json({
      success: true,
      message: `Semester ${semester} berhasil ditambahkan!`,
      data: newSemester,
    });
  } catch (error) {
    console.error("Error tambahSemester:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menyimpan semester baru.",
    });
  }
};

// Jangan lupa daftarkan fungsinya di sini!
export { getSemesters, aktifkanSemester, tambahSemester };