import prisma from '../../config/prisma.js';

// =======================================================
// 1. AMBIL DAFTAR SISWA YANG BELUM PUNYA KELAS AKTIF (GET)
// =======================================================
export const getSiswaBelumAdaKelas = async (req, res) => {
  try {
    // Logika: Cari siswa yang TIDAK MEMILIKI (none) riwayat_kelas dengan status 'Sedang_Belajar'
    const siswaTanpaKelas = await prisma.siswaProfile.findMany({
      where: {
        riwayat_kelas: {
          none: {
            status_kenaikan: 'Sedang_Belajar'
          }
        },
        // Pastikan akun siswanya aktif (jika ada flag status_siswa di tabel profile)
        // status_siswa: "Aktif" 
      },
      select: {
        id_siswa: true,
        nis: true,
        nisn: true,
        nama_siswa: true,
        gender: true,
      },
      orderBy: { nama_siswa: 'asc' }
    });

    return res.status(200).json({
      success: true,
      message: "Data siswa tanpa kelas aktif berhasil ditarik!",
      data: siswaTanpaKelas
    });
  } catch (error) {
    console.error("Error get siswa tanpa kelas:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat menarik data siswa." 
    });
  }
};

// =======================================================
// 2. MASUKKAN SISWA KE KELAS SECARA MASSAL (POST BULK INSERT)
// =======================================================
export const bulkInsertPenempatan = async (req, res) => {
  try {
    // Menerima 3 data utama dari Frontend
    // siswa_ids harus berupa array berisi ID siswa: ["id_1", "id_2", "id_3"]
    const { kelas_id, tahun_ajaran_id, siswa_ids } = req.body;
    if (!kelas_id || kelas_id.includes('/')) {
        return res.status(400).json({ success: false, message: "ID Kelas tidak valid!" });
    }

    // 1. Validasi Keamanan Data
    if (!kelas_id || !tahun_ajaran_id || !siswa_ids || !Array.isArray(siswa_ids) || siswa_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Pilih ruangan kelas, tahun ajaran, dan minimal centang 1 siswa!"
      });
    }

    // 2. Mapping Data untuk disiapkan ke Prisma
    const dataPenempatan = siswa_ids.map((idSiswa) => ({
      siswa_id: idSiswa,
      kelas_id: kelas_id, // Gunakan ID dari request
      tahun_ajaran_id: tahun_ajaran_id, // Gunakan ID dari request
      status_kenaikan: 'Sedang_Belajar'
    }));


    // 3. Eksekusi Create Many
    const result = await prisma.riwayatKelasSiswa.createMany({
      data: dataPenempatan,
      skipDuplicates: true 
    });

    return res.status(201).json({
      success: true,
      message: `Berhasil menempatkan ${result.count} siswa ke dalam kelas!`,
    });

  } catch (error) {
    console.error("Error bulk insert penempatan:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat menyimpan data penempatan kelas." 
    });
  }
};