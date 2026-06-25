import prisma from '../../config/prisma.js';

// ==========================================
// 1. API UNTUK DROPDOWN KELAS MENGAJAR
// ==========================================
export const getKelasMengajar = async (req, res) => {
  try {

    // Ambil ID dari token (Coba id_users, kalau kosong coba id)
    const userId = req.user.id_users || req.user.id;

    if (!userId) {
      return res.status(400).json({ success: false, message: "ID User tidak ditemukan di dalam token JWT." });
    }

    // Cari profil guru berdasarkan ID User tersebut
    const guru = await prisma.guruProfile.findUnique({ 
      where: { users_id: userId } 
    });

    if (!guru) return res.status(404).json({ success: false, message: "Profil guru tidak ditemukan." });

    // Tarik daftar kelas tempat guru ini mengajar
    const listMengajar = await prisma.mengajar.findMany({
      where: {
        guru_id: guru.id_guru,
        jadwal: { some: { les: { not: 0 } } }
      },
      include: {
        kelas: true,
        mapel: true,
        jadwal: {
          where: { les: { not: 0 } },
          orderBy: [{ hari: 'asc' }, { jam_mulai: 'asc' }]
        }
      }
    });

    res.status(200).json({ success: true, data: listMengajar });
  } catch (error) {
    console.error("Error getKelasMengajar:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

// ==========================================
// 2. API UNTUK MENAMPILKAN TABEL REKAP NILAI
// ==========================================
export const getRekapNilaiKelas = async (req, res) => {
  try {
    const { mengajar_id } = req.params;

    // Cari data pengajaran untuk mengetahui kelas dan tahun ajaran
    const mengajar = await prisma.mengajar.findUnique({
      where: { id_mengajar: mengajar_id },
      include: { kelas: true }
    });

    if (!mengajar) return res.status(404).json({ success: false, message: "Data tidak ditemukan." });

    // Tarik daftar siswa yang ada di kelas tersebut melalui tabel Riwayat
    const daftarSiswa = await prisma.riwayatKelasSiswa.findMany({
      where: {
        kelas_id: mengajar.kelas_id,
        tahun_ajaran_id: mengajar.tahun_ajaran_id
      },
      include: { siswa: true }
    });

    // Looping untuk menghitung rata-rata nilai per siswa secara On-The-Fly
    const rekapData = await Promise.all(daftarSiswa.map(async (riwayat) => {
      const s_id = riwayat.siswa_id;

      // Hitung Rata Tugas
      const tugas = await prisma.nilaiTugas.aggregate({
        where: { mengajar_id, siswa_id: s_id },
        _avg: { nilai_tugas: true }
      });

      // Hitung Rata PH
      const ph = await prisma.penilaianHarian.aggregate({
        where: { mengajar_id, siswa_id: s_id },
        _avg: { nilai_penilaian_harian: true }
      });

      // Ambil PTS & PAS
      const pts = await prisma.penilaianTengahSemester.findFirst({ where: { mengajar_id, siswa_id: s_id } });
      const pas = await prisma.penilaianAkhirSemester.findFirst({ where: { mengajar_id, siswa_id: s_id } });

      return {
        id_siswa: s_id,
        riwayat_id: riwayat.id_riwayat,
        nama_siswa: riwayat.siswa.nama_siswa,
        rata_tugas: tugas._avg.nilai_tugas ? Math.round(tugas._avg.nilai_tugas) : null,
        rata_ph: ph._avg.nilai_penilaian_harian ? Math.round(ph._avg.nilai_penilaian_harian) : null,
        nilai_pts: pts ? pts.pts : null,
        nilai_pas: pas ? pas.pas : null
      };
    }));

    res.status(200).json({ success: true, data: rekapData });
  } catch (error) {
    console.error("Error getRekapNilaiKelas:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

// ==========================================
// 3. API EKSEKUSI (FINALISASI MASSAL 1 KELAS)
// ==========================================
export const finalisasiRaporKelas = async (req, res) => {
  try {
    const { mengajar_id, data_rekap, kktp_mapel } = req.body;
    const kktpAngka = parseFloat(kktp_mapel || "75");

    // Ambil data semester dari jadwal mengajar
    const mengajar = await prisma.mengajar.findUnique({
      where: { id_mengajar: mengajar_id },
      include: { mapel: true }
    });

    if (!mengajar) return res.status(404).json({ success: false, message: "Data tidak ditemukan." });

    // Validasi Gembok (Pastikan tidak ada data null dari frontend)
    const isComplete = data_rekap.every((s) => 
      s.rata_tugas !== null && s.rata_ph !== null && s.nilai_pts !== null && s.nilai_pas !== null
    );

    if (!isComplete) {
      return res.status(400).json({ success: false, message: "Finalisasi ditolak! Masih ada nilai siswa yang kosong." });
    }

    // Proses penyimpanan massal (Bulk Upsert/Loop)
    for (const siswa of data_rekap) {
      // 1. Hitung Nilai Akhir
      const nilaiAkhir = (siswa.rata_tugas * 0.20) + (siswa.rata_ph * 0.30) + (siswa.nilai_pts * 0.20) + (siswa.nilai_pas * 0.30);
      
      // 2. Generate Deskripsi
      let capaian = "";
      if (nilaiAkhir >= kktpAngka) {
        capaian = `Menunjukkan penguasaan yang sangat baik dalam materi ${mengajar.mapel.mapel}.`;
      } else {
        capaian = `Perlu bimbingan lebih lanjut dalam menguasai kompetensi ${mengajar.mapel.mapel}.`;
      }

      // 3. Cek apakah rapor untuk mapel ini sudah pernah dibuat sebelumnya
      const existingRapor = await prisma.rapor.findFirst({
        where: { riwayat_kelas_siswa_id: siswa.riwayat_id, mengajar_id: mengajar_id, semester_id: mengajar.semester_id }
      });

      if (existingRapor) {
        await prisma.rapor.update({
          where: { id_rapor: existingRapor.id_rapor },
          data: { nilai_akhir: nilaiAkhir, capaian_kompetensi: capaian, kktp: kktp_mapel || "75", status_acc: "PENDING" }
        });
      } else {
        await prisma.rapor.create({
          data: {
            riwayat_kelas_siswa_id: siswa.riwayat_id,
            mengajar_id: mengajar_id,
            semester_id: mengajar.semester_id,
            kktp: kktp_mapel || "75",
            nilai_akhir: nilaiAkhir,
            capaian_kompetensi: capaian,
            status_acc: "PENDING"
          }
        });
      }
    }

    res.status(200).json({ success: true, message: "Semua nilai kelas berhasil difinalisasi dan disimpan ke Rapor!" });
  } catch (error) {
    console.error("Error finalisasiRaporKelas:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat menyimpan rapor." });
  }
};
