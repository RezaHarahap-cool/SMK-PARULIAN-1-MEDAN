import prisma from '../../config/prisma.js';
import { getRaporPendukungStatuses, makeRaporPendukungKey } from '../../services/raporPendukungService.js';
import { PRAKERIN_MAPEL } from '../../services/raporPrakerinWaliService.js';

// ==========================================
// 1. API DAFTAR KELAS & MAPEL YANG MENUNGGU ACC
// ==========================================
export const getDaftarRaporPending = async (req, res) => {
  try {
    // 1. Identifikasi Kepala Sekolah yang sedang login dari token JWT
    const userId = req.user.id_users || req.user.id;
    const kepsek = await prisma.kepalaSekolahProfile.findUnique({ where: { users_id: userId } });
    if (!kepsek) {
      return res.status(404).json({ success: false, message: "Profil Kepala Sekolah tidak ditemukan." });
    }

    const [raporPending, prakerinPending] = await Promise.all([
      prisma.rapor.findMany({
        where: { status_acc: "PENDING" },
        include: {
          mengajar: {
            include: {
              kelas: {
                include: { wali_kelas: true }
              },
              mapel: true,
              guru: true
            }
          }
        }
      }),
      prisma.raporPrakerinWali.findMany({
        where: { status_acc: "PENDING" },
        include: {
          riwayat_kelas_siswa: {
            include: {
              kelas: { include: { wali_kelas: true } }
            }
          }
        }
      })
    ]);

    // 🔥 AMBIL TOTAL SELURUH MAPEL PER KELAS AGAR KEPSEK TAHU PROGRESNYA
    const mapelPerKelas = await prisma.mengajar.groupBy({
      by: ['kelas_id'],
      _count: { id_mengajar: true }
    });

    const uniqueKelas = [];
    const pendingByKelas = new Map();

    const ensurePendingGroup = (kelas) => {
      if (!pendingByKelas.has(kelas.id_kelas)) {
        pendingByKelas.set(kelas.id_kelas, {
          kelas,
          riwayatSemester: new Map(),
          siswaIds: new Set(),
          mapelMasuk: new Set(),
          hasPrakerin: false
        });
      }

      return pendingByKelas.get(kelas.id_kelas);
    };
    
    for (const item of raporPending) {
      const group = ensurePendingGroup(item.mengajar.kelas);
      group.siswaIds.add(item.riwayat_kelas_siswa_id);
      group.mapelMasuk.add(item.mengajar_id);
      group.riwayatSemester.set(
        makeRaporPendukungKey(item.riwayat_kelas_siswa_id, item.semester_id),
        { riwayat_id: item.riwayat_kelas_siswa_id, semester_id: item.semester_id }
      );
    }

    for (const item of prakerinPending) {
      const group = ensurePendingGroup(item.riwayat_kelas_siswa.kelas);
      group.siswaIds.add(item.riwayat_kelas_siswa_id);
      group.hasPrakerin = true;
      group.mapelMasuk.add(PRAKERIN_MAPEL);
      group.riwayatSemester.set(
        makeRaporPendukungKey(item.riwayat_kelas_siswa_id, item.semester_id),
        { riwayat_id: item.riwayat_kelas_siswa_id, semester_id: item.semester_id }
      );
    }

    for (const [kelasId, group] of pendingByKelas.entries()) {
      const targetKelas = mapelPerKelas.find(k => k.kelas_id === kelasId);
      const totalMapelSeharusnya = (targetKelas ? targetKelas._count.id_mengajar : 0) + (group.hasPrakerin ? 1 : 0);

      const pendukungStatuses = await getRaporPendukungStatuses(prisma, [...group.riwayatSemester.values()]);
      const jumlahPendukungBelumLengkap = [...group.riwayatSemester.values()].filter((pair) => {
        const status = pendukungStatuses.get(makeRaporPendukungKey(pair.riwayat_id, pair.semester_id));
        return status?.lengkap !== true;
      }).length;

      uniqueKelas.push({
        mengajar_id: kelasId,
        nama_kelas: group.kelas.nama_kelas,
        nama_mapel: `${group.mapelMasuk.size} dari ${totalMapelSeharusnya} Mapel Terkumpul`,
        nama_guru: group.kelas.wali_kelas?.nama_guru || "Wali kelas belum ditentukan",
        total_siswa_pending: group.siswaIds.size,
        rapor_pendukung_lengkap: jumlahPendukungBelumLengkap === 0,
        rapor_pendukung_belum_lengkap: jumlahPendukungBelumLengkap
      });
    }

    res.status(200).json({ success: true, data: uniqueKelas });
  } catch (error) {
    console.error("Error getDaftarRaporPending:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
  }
};

// ==========================================
// 2. API DETAIL SISWA DI KELAS TERSEBUT (PRATINJAU KEPSEK)
// ==========================================
export const getDetailRaporKelasPending = async (req, res) => {
  try {
    const { mengajar_id: kelas_id } = req.params;

    const detailRapor = await prisma.rapor.findMany({
      where: {
        mengajar: { kelas_id },
        status_acc: "PENDING"
      },
      include: {
        mengajar: { include: { mapel: true } },
        riwayat_kelas_siswa: {
          include: {
            siswa: true
          }
        }
      }
    });
    const detailPrakerin = await prisma.raporPrakerinWali.findMany({
      where: {
        riwayat_kelas_siswa: { kelas_id },
        status_acc: "PENDING"
      },
      include: {
        riwayat_kelas_siswa: {
          include: {
            siswa: true
          }
        }
      }
    });

    // Format ulang data agar rapi saat dibaca Frontend
    const result = [
      ...detailRapor.map(r => ({
        id_rapor: r.id_rapor,
        nama_siswa: r.riwayat_kelas_siswa.siswa.nama_siswa,
        nisn: r.riwayat_kelas_siswa.siswa.nisn,
        mapel: r.mengajar.mapel.mapel,
        nilai_akhir: r.nilai_akhir,
        kktp: r.kktp,
        capaian_kompetensi: r.capaian_kompetensi
      })),
      ...detailPrakerin.map(r => ({
        id_rapor: r.id_rapor_prakerin_wali,
        nama_siswa: r.riwayat_kelas_siswa.siswa.nama_siswa,
        nisn: r.riwayat_kelas_siswa.siswa.nisn,
        mapel: PRAKERIN_MAPEL,
        nilai_akhir: r.nilai_akhir,
        kktp: r.kktp,
        capaian_kompetensi: r.capaian_kompetensi
      }))
    ];

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error getDetailRaporKelasPending:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

// ==========================================
// 3. API EKSEKUSI ACC MASSAL PER KELAS & MAPEL
// ==========================================
export const accRaporKelasMassal = async (req, res) => {
  try {
    const { mengajar_id: kelas_id } = req.body;

    if (!kelas_id) {
      return res.status(400).json({ success: false, message: "ID kelas wajib dikirim." });
    }

    // 1. Cari profile Kepsek untuk disematkan sebagai digital signature
    const userId = req.user.id_users || req.user.id;
    const kepsek = await prisma.kepalaSekolahProfile.findUnique({ where: { users_id: userId } });
    if (!kepsek) {
      return res.status(404).json({ success: false, message: "Akses ditolak. Profil Anda tidak ditemukan." });
    }

    const [raporPending, prakerinPending] = await Promise.all([
      prisma.rapor.findMany({
        where: {
          mengajar: { kelas_id },
          status_acc: "PENDING"
        },
        include: {
          riwayat_kelas_siswa: {
            include: { siswa: true }
          }
        }
      }),
      prisma.raporPrakerinWali.findMany({
        where: {
          riwayat_kelas_siswa: { kelas_id },
          status_acc: "PENDING"
        },
        include: {
          riwayat_kelas_siswa: {
            include: { siswa: true }
          }
        }
      })
    ]);

    if (raporPending.length === 0 && prakerinPending.length === 0) {
      return res.status(400).json({ success: false, message: "Tidak ada rapor yang perlu disetujui di kelas ini." });
    }

    const dataTidakLengkap = [
      ...raporPending.map((rapor) => {
        const kurang = [];
        if (rapor.nilai_akhir === null || rapor.nilai_akhir === undefined) kurang.push("nilai akhir");
        if (!rapor.kktp) kurang.push("KKTP");
        if (!rapor.capaian_kompetensi) kurang.push("capaian kompetensi");

        return {
          nama_siswa: rapor.riwayat_kelas_siswa?.siswa?.nama_siswa || "-",
          nisn: rapor.riwayat_kelas_siswa?.siswa?.nisn || "-",
          kurang,
        };
      }),
      ...prakerinPending.map((rapor) => {
        const kurang = [];
        if (rapor.nilai_akhir === null || rapor.nilai_akhir === undefined) kurang.push("nilai akhir");

        return {
          nama_siswa: rapor.riwayat_kelas_siswa?.siswa?.nama_siswa || "-",
          nisn: rapor.riwayat_kelas_siswa?.siswa?.nisn || "-",
          kurang,
        };
      })
    ]
      .filter((item) => item.kurang.length > 0);

    if (dataTidakLengkap.length > 0) {
      return res.status(400).json({
        success: false,
        message: "ACC ditolak. Masih ada data rapor yang belum lengkap.",
        data_tidak_lengkap: dataTidakLengkap,
      });
    }

    const siswaSemesterMap = new Map(
      [...raporPending, ...prakerinPending].map((rapor) => [
        makeRaporPendukungKey(rapor.riwayat_kelas_siswa_id, rapor.semester_id),
        rapor
      ])
    );
    const pendukungStatuses = await getRaporPendukungStatuses(
      prisma,
      [...siswaSemesterMap.values()].map((rapor) => ({
        riwayat_id: rapor.riwayat_kelas_siswa_id,
        semester_id: rapor.semester_id
      }))
    );
    const dataPendukungTidakLengkap = [...siswaSemesterMap.values()]
      .map((rapor) => {
        const status = pendukungStatuses.get(makeRaporPendukungKey(rapor.riwayat_kelas_siswa_id, rapor.semester_id));
        return {
          nama_siswa: rapor.riwayat_kelas_siswa?.siswa?.nama_siswa || "-",
          nisn: rapor.riwayat_kelas_siswa?.siswa?.nisn || "-",
          kurang: status?.kurang || ['Predikat Pramuka', 'Catatan wali kelas']
        };
      })
      .filter((item) => item.kurang.length > 0);

    if (dataPendukungTidakLengkap.length > 0) {
      return res.status(400).json({
        success: false,
        message: "ACC ditolak. Data pendukung wali kelas belum lengkap.",
        data_tidak_lengkap: dataPendukungTidakLengkap,
      });
    }

    const tanggalAcc = new Date();
    const [prosesAcc, prosesPrakerinAcc] = await prisma.$transaction([
      prisma.rapor.updateMany({
        where: {
          mengajar: { kelas_id },
          status_acc: "PENDING"
        },
        data: {
          status_acc: "DISETUJUI",
          kepala_sekolah_id: kepsek.id_kepsek,
          tgl_acc: tanggalAcc
        }
      }),
      prisma.raporPrakerinWali.updateMany({
        where: {
          id_rapor_prakerin_wali: { in: prakerinPending.map((item) => item.id_rapor_prakerin_wali) },
          status_acc: "PENDING"
        },
        data: {
          status_acc: "DISETUJUI",
          kepala_sekolah_id: kepsek.id_kepsek,
          tgl_acc: tanggalAcc
        }
      })
    ]);

    const totalDiproses = prosesAcc.count + prosesPrakerinAcc.count;
    if (totalDiproses === 0) {
      return res.status(400).json({ success: false, message: "Tidak ada rapor yang perlu disetujui di kelas ini." });
    }

    res.status(200).json({ 
      success: true, 
      message: `Berhasil menyetujui ${totalDiproses} nilai rapor siswa secara massal!` 
    });
  } catch (error) {
    console.error("Error accRaporKelasMassal:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat memproses ACC." });
  }
};
