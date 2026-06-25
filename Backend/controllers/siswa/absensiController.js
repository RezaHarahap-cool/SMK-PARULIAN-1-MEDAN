import prisma from '../../config/prisma.js';

// ==========================================
// AMBIL RIWAYAT ABSENSI KHUSUS SISWA YANG LOGIN
// ==========================================
export const getAbsensiSiswa = async (req, res) => {
  try {
    // 1. Ambil ID Akun dari token JWT
    const id_users = req.user.id_users;

    // 2. Cari Profil Siswa aslinya
    const profilSiswa = await prisma.siswaProfile.findUnique({
      where: { users_id: id_users }
    });

    if (!profilSiswa) {
      return res.status(404).json({ success: false, message: "Profil siswa tidak ditemukan." });
    }

    // 3. Tarik seluruh riwayat absensi siswa ini
    const dataAbsensi = await prisma.absensi.findMany({
      where: { siswa_id: profilSiswa.id_siswa },
      include: {
        mengajar: {
          include: {
            mapel: true,
            guru: true,
            kelas: true,
            semester: true
          }
        }
      },
      orderBy: {
        tgl_absensi: 'desc' // Urutkan dari yang paling baru
      }
    });

    // 4. Mapping data ke format yang diminta Frontend (UI Card & Modal)
    const mappedData = dataAbsensi.map(item => ({
      id: item.id_absensi,
      mengajar_id: item.mengajar_id,
      mapel: item.mengajar?.mapel?.mapel || "-",
      kelas: item.mengajar?.kelas?.nama_kelas || "-", // Cth: "X RPL 1"
      semester: item.mengajar?.semester?.semester || "-", 
      guruPengajar: item.mengajar?.guru?.nama_guru || "Tanpa Guru",
      pertemuan: parseInt(item.pertemuan) || 0,
      
      // Format tanggal menjadi "Senin, 17 Maret 2026"
      tanggal: new Date(item.tgl_absensi).toLocaleDateString('id-ID', { 
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
      }),
      
      topik: item.topik || "-",
      keterangan: item.keterangan || "Alpha",
      catatan_sikap: item.catatan_sikap || "Tidak ada catatan."
    }));

    res.status(200).json({
      success: true,
      data: mappedData
    });

  } catch (error) {
    console.error("Error getAbsensiSiswa:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengambil riwayat absensi."
    });
  }
};

// ==========================================
// AMBIL DETAIL ABSENSI PER MATA PELAJARAN
// ==========================================
export const getDetailAbsensiMapel = async (req, res) => {
  try {
    const id_users = req.user.id_users;
    const { mengajar_id } = req.params; // Ditangkap dari URL

    const profilSiswa = await prisma.siswaProfile.findUnique({
      where: { users_id: id_users }
    });

    if (!profilSiswa) {
      return res.status(404).json({ success: false, message: "Profil siswa tidak ditemukan." });
    }

    // Tarik semua riwayat absen untuk mapel ini
    const detailAbsensi = await prisma.absensi.findMany({
      where: { 
        siswa_id: profilSiswa.id_siswa,
        mengajar_id: mengajar_id 
      },
      include: {
        mengajar: {
          include: { mapel: true }
        }
      },
      orderBy: { tgl_absensi: 'asc' } // Urutkan dari pertemuan paling awal ke akhir
    });

    // Format ulang datanya untuk Modal UI
    const mappedData = detailAbsensi.map(item => ({
      id: item.id_absensi,
      mapel: item.mengajar?.mapel?.mapel || "-",
      pertemuan: item.pertemuan,
      tanggal: new Date(item.tgl_absensi).toLocaleDateString('id-ID', { 
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
      }),
      absen: item.keterangan,
      catatan: item.catatan_sikap || "-"
    }));

    res.status(200).json({
      success: true,
      data: mappedData
    });

  } catch (error) {
    console.error("Error getDetailAbsensiMapel:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengambil detail absensi."
    });
  }
};