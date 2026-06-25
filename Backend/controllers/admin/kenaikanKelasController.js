import prisma from '../../config/prisma.js';

// =======================================================
// 1. FUNGSI GET SISWA (Untuk ditampilkan di tabel frontend)
// =======================================================
export const getSiswa = async (req, res) => {
  try {
    const { kelas_id, tahun_ajaran_id } = req.query;

    // Filter pencarian khusus di dalam tabel Riwayat
    let riwayatFilter = { status_kenaikan: 'Sedang_Belajar' };
    if (kelas_id) riwayatFilter.kelas_id = kelas_id;
    if (tahun_ajaran_id) riwayatFilter.tahun_ajaran_id = tahun_ajaran_id;

    const dataSiswa = await prisma.siswaProfile.findMany({
      where: {
        // Tarik siswa yang riwayat kelas aktifnya sesuai dengan filter dropdown
        riwayat_kelas: {
          some: riwayatFilter
        }
      },
      include: {
        user: true, // Relasi ke tabel User
        riwayat_kelas: {
          where: { status_kenaikan: 'Sedang_Belajar' }, 
          include: {
            kelas: true,         // Menarik data nama kelas dari riwayat
            tahun_ajaran: true   // Menarik data tahun ajaran dari riwayat
          }
        }
      }
    });

    return res.status(200).json({ success: true, data: dataSiswa });
  } catch (error) {
    console.error("Error getSiswa:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// =======================================================
// 2. FUNGSI PROSES KENAIKAN KELAS (Bulk Update/Insert)
// =======================================================
export const prosesKenaikanKelas = async (req, res) => {
  try {
    // Tangkap data dari Payload Frontend
    const { siswa_ids, status, kelas_tujuan_id, tahun_ajaran_tujuan_id } = req.body;

    // Validasi Dasar
    if (!siswa_ids || !Array.isArray(siswa_ids) || siswa_ids.length === 0) {
      return res.status(400).json({ success: false, message: "Pilih minimal 1 siswa untuk diproses." });
    }

    if (status === "Naik Kelas" && (!kelas_tujuan_id || !tahun_ajaran_tujuan_id)) {
      return res.status(400).json({ success: false, message: "Kelas Tujuan dan Tahun Ajaran Tujuan wajib diisi untuk siswa yang naik kelas!" });
    }

    // Pemetaan Status sesuai ENUM di schema.prisma
    let enumStatus = "Naik_Kelas"; 
    if (status === "Lulus") enumStatus = "Tamat";          
    if (status === "Tinggal Kelas") enumStatus = "Tinggal_Kelas";

    // EKSEKUSI DATABASE SECARA TRANSACTIONAL (Aman dari data korup)
    await prisma.$transaction(async (tx) => {
      
      // ---------------------------------------------------
      // A. LOGIKA: NAIK KELAS
      // ---------------------------------------------------
      if (status === "Naik Kelas") {
        
        // 1. VALIDASI ANTI-DOBEL KELAS
        // Cek apakah ada siswa yang terpilih sudah punya riwayat di Tahun Ajaran Tujuan
        const cekRiwayatGanda = await tx.riwayatKelasSiswa.findFirst({
          where: {
            siswa_id: { in: siswa_ids },
            tahun_ajaran_id: tahun_ajaran_tujuan_id // Mencari di tahun ajaran baru
          },
          include: {
            siswa: true // Tarik data profil siswa untuk menampilkan namanya di pesan error
          }
        });

        if (cekRiwayatGanda) {
          // Jika ketemu, gagalkan proses (Rollback)
          throw new Error(`Siswa atas nama ${cekRiwayatGanda.siswa.nama_siswa} sudah terdaftar di kelas lain pada Tahun Ajaran tujuan! Batalkan pilihan pada siswa tersebut.`);
        }

        // 2. Daftarkan mereka ke kelas baru (Insert Riwayat Baru)
        const dataKelasBaru = siswa_ids.map((id) => ({
          siswa_id: id,
          kelas_id: kelas_tujuan_id,
          tahun_ajaran_id: tahun_ajaran_tujuan_id, 
          status_kenaikan: "Sedang_Belajar" // Status mereka di kelas yang baru adalah Sedang Belajar
        }));

        await tx.riwayatKelasSiswa.createMany({
          data: dataKelasBaru
        });
        
        // 3. Matikan status aktif di riwayat lama (Ubah jadi Naik_Kelas)
        await tx.riwayatKelasSiswa.updateMany({
          where: { 
            siswa_id: { in: siswa_ids },
            status_kenaikan: "Sedang_Belajar",
            tahun_ajaran_id: { not: tahun_ajaran_tujuan_id } // Kecualikan yang baru saja dibuat
          },
          data: {
            status_kenaikan: enumStatus
          }
        });
      } 
      
      // ---------------------------------------------------
      // B. LOGIKA: LULUS (JADI ALUMNI)
      // ---------------------------------------------------
      else if (status === "Lulus") {
        // 1. Update status di profil siswa jadi Alumni
        await tx.siswaProfile.updateMany({
          where: { id_siswa: { in: siswa_ids } },
          data: { status_siswa: "Alumni" }
        });

        // 2. Tutup buku riwayat kelas terakhir mereka menjadi "Tamat"
        await tx.riwayatKelasSiswa.updateMany({
          where: { 
            siswa_id: { in: siswa_ids },
            status_kenaikan: "Sedang_Belajar"
          },
          data: { status_kenaikan: enumStatus }
        });

        // 3. Nonaktifkan akun login mereka (Mencegah alumni login kembali sebagai siswa)
        const userIds = await tx.siswaProfile.findMany({
          where: { id_siswa: { in: siswa_ids } },
          select: { users_id: true }
        });
        
        const validUserIds = userIds.map(u => u.users_id).filter(id => id !== null);
        if (validUserIds.length > 0) {
          await tx.user.updateMany({ 
            where: { id_users: { in: validUserIds } },
            data: { is_active: false }
          });
        }
      } 
      
      // ---------------------------------------------------
      // C. LOGIKA: TINGGAL KELAS
      // ---------------------------------------------------
      else if (status === "Tinggal Kelas") {
        // Ubah status di riwayat terakhir menjadi "Tinggal_Kelas"
        await tx.riwayatKelasSiswa.updateMany({
          where: { 
            siswa_id: { in: siswa_ids },
            status_kenaikan: "Sedang_Belajar"
          },
          data: { status_kenaikan: enumStatus }
        });
      }

    });

    // Jika seluruh transaksi berhasil
    return res.status(200).json({ 
      success: true, 
      message: `Berhasil memproses ${siswa_ids.length} siswa!` 
    });

  } catch (error) {
    console.error("Error proses Kenaikan Kelas:", error);
    
    // Tangkap lemparan pesan error kustom (dari validasi anti-dobel)
    if (error.message && error.message.includes("sudah terdaftar di kelas lain")) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan pada server saat memproses data." 
    });
  }
};