import prisma from '../../config/prisma.js';
import { getRaporPendukungStatuses, makeRaporPendukungKey } from '../../services/raporPendukungService.js';
import { hitungKetidakhadiranRapor } from '../../services/raporAttendanceService.js';
import { compareMapelForRapor } from '../../services/mapelCatalog.js';
import { PRAKERIN_MAPEL, formatEmptyRaporPrakerinWaliItem, formatRaporPrakerinWaliItem } from '../../services/raporPrakerinWaliService.js';

const formatPredikat = (predikat) => {
  const labels = {
    SANGAT_BAIK: 'Sangat Baik',
    BAIK: 'Baik',
    CUKUP: 'Cukup',
    KURANG: 'Kurang',
    SANGAT_BURUK: 'Sangat Buruk'
  };
  return labels[predikat] || predikat || '-';
};

export const getRaporSiswa = async (req, res) => {
  try {
    const userId = req.user.id_users;
    // Tangkap parameter filter dari URL frontend
    const { riwayat_id, semester_id } = req.query;

    // 1. Cari profil siswa
    const siswa = await prisma.siswaProfile.findUnique({
      where: { users_id: userId },
    });

    if (!siswa) {
      return res.status(404).json({ success: false, message: 'Profil siswa tidak ditemukan.' });
    }

    // 2. Ambil Opsi Riwayat Kelas untuk Dropdown (Riwayat historis siswa)
    const riwayatOptions = await prisma.riwayatKelasSiswa.findMany({
      where: { siswa_id: siswa.id_siswa },
      include: {
        kelas: true,
        tahun_ajaran: true
      },
      orderBy: { tahun_ajaran: { tahun: 'desc' } } // Urutkan dari tahun terbaru
    });

    // 3. Ambil Opsi Semester untuk Dropdown
    const semesterOptions = await prisma.semester.findMany({
      orderBy: { semester: 'asc' }
    });

    if (riwayatOptions.length === 0) {
      return res.status(404).json({ success: false, message: 'Siswa belum memiliki riwayat kelas.' });
    }

    // 4. Tentukan filter yang aktif
    // Jika user belum memilih (baru buka halaman), gunakan data yang sedang aktif
    let targetRiwayatId = riwayat_id;
    let targetSemesterId = semester_id;

    if (!targetRiwayatId) {
      const activeRiwayat = riwayatOptions.find(r => r.status_kenaikan === 'Sedang_Belajar') || riwayatOptions[0];
      targetRiwayatId = activeRiwayat.id_riwayat;
    }

    if (!targetSemesterId) {
      const activeSemester = semesterOptions.find(s => s.status === 'AKTIF') || semesterOptions[0];
      targetSemesterId = activeSemester.id_semester;
    }

    // 5. Tarik data Rapor spesifik berdasarkan filter yang dipilih
    const targetRiwayat = await prisma.riwayatKelasSiswa.findUnique({
      where: { id_riwayat: targetRiwayatId },
      include: {
        kelas: { include: { jurusan: true, wali_kelas: true } },
        tahun_ajaran: true,
      }
    });

    const targetSemester = semesterOptions.find(s => s.id_semester === targetSemesterId);

    const raporData = await prisma.rapor.findMany({
      where: {
        riwayat_kelas_siswa_id: targetRiwayatId,
        semester_id: targetSemesterId,
        status_acc: 'DISETUJUI'
      },
      include: {
        kepala_sekolah: true,
        mengajar: {
          include: {
            mapel: true, // 🔥 Ini akan menarik kolom 'kelompok' otomatis
            guru: true,
          }
        }
      },
      orderBy: { mengajar: { mapel: { mapel: 'asc' } } }
    });

    // 6. Hitung absensi spesifik untuk riwayat dan semester ini
    const kehadiran = await hitungKetidakhadiranRapor(prisma, {
      siswa_id: siswa.id_siswa,
      tahun_ajaran_id: targetRiwayat.tahun_ajaran_id,
      semester_id: targetSemesterId,
      kelas_id: targetRiwayat.kelas_id,
    });

    const [nilaiEkstrakurikuler, catatanWali, nilaiPrakerinWali, pendukungStatuses] = await Promise.all([
      prisma.raporEkstrakurikuler.findMany({
        where: {
          riwayat_kelas_siswa_id: targetRiwayatId,
          semester_id: targetSemesterId
        },
        include: { ekstrakurikuler: true }
      }),
      prisma.raporCatatanWali.findUnique({
        where: {
          riwayat_kelas_siswa_id_semester_id: {
            riwayat_kelas_siswa_id: targetRiwayatId,
            semester_id: targetSemesterId
          }
        }
      }),
      prisma.raporPrakerinWali.findMany({
        where: {
          riwayat_kelas_siswa_id: targetRiwayatId,
          semester_id: targetSemesterId,
          status_acc: 'DISETUJUI'
        },
        include: {
          wali_kelas: { select: { nama_guru: true } }
        }
      }),
      getRaporPendukungStatuses(prisma, [{ riwayat_id: targetRiwayatId, semester_id: targetSemesterId }])
    ]);
    const kelengkapanWali = pendukungStatuses.get(makeRaporPendukungKey(targetRiwayatId, targetSemesterId)) || {
      lengkap: false,
      kurang: ['Predikat Pramuka', 'Catatan wali kelas']
    };
    const nilaiAkademik = raporData.map((rapor) => ({
      id_rapor: rapor.id_rapor,
      mapel: rapor.mengajar.mapel.mapel,
      kelompok: rapor.mengajar.mapel.kelompok,
      guru: rapor.mengajar.guru.nama_guru,
      kktp: rapor.kktp,
      nilai_akhir: rapor.nilai_akhir,
      capaian_kompetensi: rapor.capaian_kompetensi,
    }));
    const sudahAdaPrakerin = nilaiAkademik.some((item) => item.mapel === PRAKERIN_MAPEL);
    const shouldShowPrakerin = raporData.length > 0 || nilaiPrakerinWali.length > 0;
    const nilaiPrakerin = sudahAdaPrakerin || !shouldShowPrakerin
      ? []
      : nilaiPrakerinWali.length > 0
        ? nilaiPrakerinWali.map((item) => formatRaporPrakerinWaliItem(item, targetRiwayat.kelas.wali_kelas?.nama_guru))
        : [formatEmptyRaporPrakerinWaliItem(targetRiwayat.kelas.wali_kelas?.nama_guru)];

    return res.status(200).json({
      success: true,
      data: {
        // 🔥 Kirim data opsi filter ke frontend
        filters: {
          riwayatOptions: riwayatOptions.map(r => ({ 
            id: r.id_riwayat, 
            label: `${r.kelas.nama_kelas} (${r.tahun_ajaran.tahun})` 
          })),
          semesterOptions: semesterOptions.map(s => ({ 
            id: s.id_semester, 
            label: s.semester 
          })),
          activeRiwayatId: targetRiwayatId,
          activeSemesterId: targetSemesterId,
        },
        siswa: {
          nama_siswa: siswa.nama_siswa,
          nis: siswa.nis,
          nisn: siswa.nisn,
          nama_ayah: siswa.nama_ayah,
        },
        kelas: {
          nama_kelas: targetRiwayat.kelas.nama_kelas,
          jurusan: targetRiwayat.kelas.jurusan.jurusan,
          wali_kelas: targetRiwayat.kelas.wali_kelas?.nama_guru || 'Belum Ditentukan',
        },
        tahun_ajaran: targetRiwayat.tahun_ajaran.tahun,
        semester: targetSemester?.semester || 'GENAP',
        kepala_sekolah: raporData.find((r) => r.kepala_sekolah)?.kepala_sekolah?.nama_ks || 'Belum di-ACC',
        tanggal_cetak: new Date(raporData[0]?.tgl_acc || Date.now()).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        nilai: [...nilaiAkademik, ...nilaiPrakerin].sort(compareMapelForRapor),
        kehadiran,
        catatan: catatanWali?.catatan || '',
        kelengkapan_wali: kelengkapanWali,
        ekstrakurikuler: nilaiEkstrakurikuler.map((item) => ({
          kegiatan: item.ekstrakurikuler.nama,
          predikat: formatPredikat(item.predikat),
          keterangan: item.keterangan || ''
        })),
      },
    });
  } catch (error) {
    console.error('Error getRaporSiswa:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat mengambil rapor.' });
  }
};
