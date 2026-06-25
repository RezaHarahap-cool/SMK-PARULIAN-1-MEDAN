import prisma from '../../config/prisma.js';

export const getAlumni = async (req, res) => {
  try {
    // Tangkap query filter dari frontend (opsional, jika nanti kamu mau buat filter tahun lulus)
    const { tahun_ajaran_id } = req.query;

    // Filter dasar: WAJIB berstatus Alumni
    let whereClause = {
      status_siswa: "Alumni"
    };

    // Jika difilter berdasarkan tahun lulusan tertentu
    if (tahun_ajaran_id) {
      whereClause.riwayat_kelas = {
        some: {
          tahun_ajaran_id: tahun_ajaran_id,
          status_kenaikan: 'Tamat'
        }
      };
    }

    const dataAlumni = await prisma.siswaProfile.findMany({
      where: whereClause,
      orderBy: { nama_siswa: 'asc' }, // Urutkan berdasarkan abjad A-Z
      include: {
        user: { select: { username: true, email: true } },
        // Tarik riwayat kelas saat mereka Lulus (Tamat)
        riwayat_kelas: {
          where: { status_kenaikan: 'Tamat' }, 
          include: {
            kelas: {
              include: { jurusan: true } // Bawa data jurusan sekalian
            },
            tahun_ajaran: true // Bawa data angkatan/tahun lulus
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: "Data alumni berhasil ditarik!",
      data: dataAlumni
    });
  } catch (error) {
    console.error("Error get alumni:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat menarik data alumni." 
    });
  }
};