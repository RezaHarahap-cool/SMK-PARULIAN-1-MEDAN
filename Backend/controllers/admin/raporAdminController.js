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

// API untuk menarik data utuh 1 lembar rapor siswa
// API untuk menarik data utuh 1 lembar rapor siswa
export const getDataCetakRapor = async (req, res) => {
  try {
    const { riwayat_id } = req.params;

    const dataCetak = await prisma.riwayatKelasSiswa.findUnique({
      where: { id_riwayat: riwayat_id },
      include: {
        siswa: true,
        kelas: {
          include: { wali_kelas: true, jurusan: true }
        },
        tahun_ajaran: true,
        rapor: {
          where: { status_acc: 'DISETUJUI' },
          include: {
            mengajar: {
              include: { mapel: true, semester: true }
            },
            kepala_sekolah: true
          }
        }
      }
    });

    if (!dataCetak || dataCetak.rapor.length === 0) {
      return res.status(404).json({ success: false, message: "Data rapor tidak ditemukan atau belum di-ACC." });
    }

    // Ambil info kepsek dari salah satu data rapor yang sudah di-ACC
    const kepsekInfo = dataCetak.rapor[0].kepala_sekolah;
    const semesterId = dataCetak.rapor[0]?.semester_id;
    const kehadiran = await hitungKetidakhadiranRapor(prisma, {
      siswa_id: dataCetak.siswa_id,
      tahun_ajaran_id: dataCetak.tahun_ajaran_id,
      semester_id: semesterId,
      kelas_id: dataCetak.kelas_id,
    });

    const [nilaiEkstrakurikuler, catatanWali, nilaiPrakerinWali, pendukungStatuses] = await Promise.all([
      prisma.raporEkstrakurikuler.findMany({
        where: {
          riwayat_kelas_siswa_id: riwayat_id,
          semester_id: semesterId
        },
        include: { ekstrakurikuler: true }
      }),
      prisma.raporCatatanWali.findUnique({
        where: {
          riwayat_kelas_siswa_id_semester_id: {
            riwayat_kelas_siswa_id: riwayat_id,
            semester_id: semesterId
          }
        }
      }),
      prisma.raporPrakerinWali.findMany({
        where: {
          riwayat_kelas_siswa_id: riwayat_id,
          semester_id: semesterId,
          status_acc: 'DISETUJUI'
        },
        include: {
          wali_kelas: { select: { nama_guru: true } }
        }
      }),
      getRaporPendukungStatuses(prisma, [{ riwayat_id, semester_id: semesterId }])
    ]);
    const kelengkapanWali = pendukungStatuses.get(makeRaporPendukungKey(riwayat_id, semesterId)) || {
      lengkap: false,
      kurang: ['Predikat Pramuka', 'Catatan wali kelas']
    };
    const nilaiAkademik = dataCetak.rapor.map(r => ({
      mapel: r.mengajar.mapel.mapel,
      kelompok: r.mengajar.mapel.kelompok,
      kktp: r.kktp,
      nilai_akhir: r.nilai_akhir,
      capaian: r.capaian_kompetensi
    }));
    const sudahAdaPrakerin = nilaiAkademik.some((item) => item.mapel === PRAKERIN_MAPEL);
    const nilaiPrakerin = sudahAdaPrakerin
      ? []
      : nilaiPrakerinWali.length > 0
        ? nilaiPrakerinWali.map((item) => formatRaporPrakerinWaliItem(item, dataCetak.kelas.wali_kelas?.nama_guru))
        : [formatEmptyRaporPrakerinWaliItem(dataCetak.kelas.wali_kelas?.nama_guru)];

    const formattedData = {
      id_siswa: dataCetak.siswa.id_siswa,
      nama_siswa: dataCetak.siswa.nama_siswa,
      nis: dataCetak.siswa.nis,
      nisn: dataCetak.siswa.nisn,
      kelas: dataCetak.kelas.nama_kelas,
      jurusan: dataCetak.kelas.jurusan.jurusan,
      tahun_pelajaran: dataCetak.tahun_ajaran.tahun,
      nama_ayah: dataCetak.siswa.nama_ayah,
      
      // 💡 DATA DINAMIS TANDA TANGAN
      nama_wali_kelas: dataCetak.kelas.wali_kelas ? dataCetak.kelas.wali_kelas.nama_guru : "Belum Ditentukan",
      nama_kepsek: kepsekInfo ? kepsekInfo.nama_ks : "Belum Ditentukan",
      semester: dataCetak.rapor[0]?.mengajar?.semester?.semester || 'GENAP',
      tanggal_cetak: new Date(dataCetak.rapor[0]?.tgl_acc || Date.now()).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      kehadiran,
      catatan: catatanWali?.catatan || '',
      kelengkapan_wali: kelengkapanWali,
      ekstrakurikuler: nilaiEkstrakurikuler.map((item) => ({
        kegiatan: item.ekstrakurikuler.nama,
        predikat: formatPredikat(item.predikat),
        keterangan: item.keterangan || ''
      })),

      nilai: [...nilaiAkademik, ...nilaiPrakerin].sort(compareMapelForRapor)
    };

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    console.error("Error getDataCetakRapor:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};


// ==========================================
// API UNTUK MENDAPATKAN DAFTAR SISWA PER KELAS YANG RAPORNYA SUDAH ACC
// ==========================================
export const getSiswaSiapCetakByKelas = async (req, res) => {
  try {
    const { kelas_id } = req.params;

    // Cari riwayat kelas siswa di kelas tersebut yang memiliki minimal 1 rapor berstatus DISETUJUI
    const daftarSiswa = await prisma.riwayatKelasSiswa.findMany({
      where: {
        kelas_id: kelas_id,
        rapor: {
          some: { status_acc: 'DISETUJUI' }
        }
      },
      include: {
        siswa: true,
        rapor: {
          where: { status_acc: 'DISETUJUI' },
          select: { semester_id: true },
          orderBy: { tgl_acc: 'desc' }
        }
      }
    });

    const pendukungStatuses = await getRaporPendukungStatuses(
      prisma,
      daftarSiswa.map((item) => ({
        riwayat_id: item.id_riwayat,
        semester_id: item.rapor[0]?.semester_id
      }))
    );

    const formattedData = daftarSiswa.map(item => ({
      id_riwayat: item.id_riwayat,
      nama_siswa: item.siswa.nama_siswa,
      nisn: item.siswa.nisn,
      rapor_pendukung_lengkap: item.rapor[0]?.semester_id
        ? pendukungStatuses.get(makeRaporPendukungKey(item.id_riwayat, item.rapor[0].semester_id))?.lengkap === true
        : false,
      kurang_rapor_pendukung: item.rapor[0]?.semester_id
        ? pendukungStatuses.get(makeRaporPendukungKey(item.id_riwayat, item.rapor[0].semester_id))?.kurang || []
        : ['Predikat Pramuka', 'Catatan wali kelas']
    }));

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    console.error("Error getSiswaSiapCetakByKelas:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};
