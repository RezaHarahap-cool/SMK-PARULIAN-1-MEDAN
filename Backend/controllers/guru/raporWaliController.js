import prisma from '../../config/prisma.js';
import { PRAKERIN_MAPEL } from '../../services/raporPrakerinWaliService.js';

const PREDIKAT_EKSKUL = new Set([
  'SANGAT_BAIK',
  'BAIK',
  'CUKUP',
  'KURANG',
  'SANGAT_BURUK'
]);

const getOrCreatePramuka = async (tx = prisma) => {
  return tx.ekstrakurikuler.upsert({
    where: { nama: 'Pramuka' },
    update: { status: 'AKTIF' },
    create: { nama: 'Pramuka', status: 'AKTIF' }
  });
};

const getWaliKelasContext = async (userId, kelasId) => {
  const guru = await prisma.guruProfile.findUnique({
    where: { users_id: userId },
    include: {
      kelas_wali: {
        include: {
          jurusan: true,
          tahun_ajaran: true
        },
        orderBy: { nama_kelas: 'asc' }
      }
    }
  });

  if (!guru) {
    return { errorStatus: 404, errorMessage: 'Profil guru tidak ditemukan.' };
  }

  if (!guru.kelas_wali || guru.kelas_wali.length === 0) {
    return { errorStatus: 403, errorMessage: 'Akses ditolak. Fitur ini hanya untuk wali kelas.' };
  }

  const targetKelas = kelasId
    ? guru.kelas_wali.find((kelas) => kelas.id_kelas === kelasId)
    : guru.kelas_wali.find((kelas) => kelas.tahun_ajaran?.status === 'AKTIF') || guru.kelas_wali[0];

  if (!targetKelas) {
    return { errorStatus: 403, errorMessage: 'Kelas tersebut bukan kelas wali Anda.' };
  }

  return { guru, targetKelas };
};

const parseOptionalNilai = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  const nilai = Number(value);
  if (!Number.isFinite(nilai) || nilai < 0 || nilai > 100) {
    return undefined;
  }

  return Number(nilai.toFixed(2));
};

const getTargetSemester = async (semesterId) => {
  if (semesterId) {
    return prisma.semester.findUnique({ where: { id_semester: semesterId } });
  }

  return prisma.semester.findFirst({
    where: { status: 'AKTIF' },
    orderBy: { semester: 'asc' }
  });
};

export const getRaporPendukungWali = async (req, res) => {
  try {
    const userId = req.user.id_users;
    const { kelas_id, semester_id } = req.query;

    const context = await getWaliKelasContext(userId, kelas_id);
    if (context.errorStatus) {
      return res.status(context.errorStatus).json({ success: false, message: context.errorMessage });
    }

    const semester = await getTargetSemester(semester_id);
    if (!semester) {
      return res.status(400).json({ success: false, message: 'Semester aktif tidak ditemukan.' });
    }

    const pramuka = await getOrCreatePramuka();

    const riwayatSiswa = await prisma.riwayatKelasSiswa.findMany({
      where: {
        kelas_id: context.targetKelas.id_kelas,
        tahun_ajaran_id: context.targetKelas.tahun_ajaran_id,
        status_kenaikan: 'Sedang_Belajar',
        siswa: { status_siswa: { not: 'Alumni' } }
      },
      include: { siswa: true },
      orderBy: { siswa: { nama_siswa: 'asc' } }
    });

    const riwayatIds = riwayatSiswa.map((riwayat) => riwayat.id_riwayat);

    const [nilaiEkskul, catatanWali, nilaiPrakerin, semesterOptions] = await Promise.all([
      prisma.raporEkstrakurikuler.findMany({
        where: {
          riwayat_kelas_siswa_id: { in: riwayatIds },
          semester_id: semester.id_semester,
          ekstrakurikuler_id: pramuka.id_ekstrakurikuler
        }
      }),
      prisma.raporCatatanWali.findMany({
        where: {
          riwayat_kelas_siswa_id: { in: riwayatIds },
          semester_id: semester.id_semester
        }
      }),
      prisma.raporPrakerinWali.findMany({
        where: {
          riwayat_kelas_siswa_id: { in: riwayatIds },
          semester_id: semester.id_semester
        }
      }),
      prisma.semester.findMany({ orderBy: { semester: 'asc' } })
    ]);

    const nilaiByRiwayat = new Map(nilaiEkskul.map((item) => [item.riwayat_kelas_siswa_id, item]));
    const catatanByRiwayat = new Map(catatanWali.map((item) => [item.riwayat_kelas_siswa_id, item]));
    const prakerinByRiwayat = new Map(nilaiPrakerin.map((item) => [item.riwayat_kelas_siswa_id, item]));

    return res.status(200).json({
      success: true,
      data: {
        kelasOptions: context.guru.kelas_wali.map((kelas) => ({
          id: kelas.id_kelas,
          label: `${kelas.nama_kelas} (${kelas.tahun_ajaran?.tahun || '-'})`
        })),
        semesterOptions: semesterOptions.map((item) => ({
          id: item.id_semester,
          label: item.semester
        })),
        activeKelasId: context.targetKelas.id_kelas,
        activeSemesterId: semester.id_semester,
        kelas: {
          nama_kelas: context.targetKelas.nama_kelas,
          jurusan: context.targetKelas.jurusan?.jurusan || '-',
          tahun_ajaran: context.targetKelas.tahun_ajaran?.tahun || '-'
        },
        ekstrakurikuler: {
          id: pramuka.id_ekstrakurikuler,
          nama: pramuka.nama
        },
        prakerin: {
          tersedia: true,
          mapel: PRAKERIN_MAPEL,
          guru: context.guru.nama_guru
        },
        siswa: riwayatSiswa.map((riwayat) => {
          const nilai = nilaiByRiwayat.get(riwayat.id_riwayat);
          const catatan = catatanByRiwayat.get(riwayat.id_riwayat);
          const prakerin = prakerinByRiwayat.get(riwayat.id_riwayat);

          return {
            riwayat_id: riwayat.id_riwayat,
            id_siswa: riwayat.siswa.id_siswa,
            nama_siswa: riwayat.siswa.nama_siswa,
            nisn: riwayat.siswa.nisn,
            predikat: nilai?.predikat || '',
            keterangan: nilai?.keterangan || '',
            catatan: catatan?.catatan || '',
            nilai_prakerin: prakerin?.nilai_akhir === undefined ? '' : String(prakerin.nilai_akhir)
          };
        })
      }
    });
  } catch (error) {
    console.error('Error getRaporPendukungWali:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat mengambil data rapor wali.' });
  }
};

export const saveRaporPendukungWali = async (req, res) => {
  try {
    const userId = req.user.id_users;
    const { kelas_id, semester_id, items } = req.body;

    if (!kelas_id || !semester_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Kelas, semester, dan data siswa wajib dikirim.' });
    }

    const context = await getWaliKelasContext(userId, kelas_id);
    if (context.errorStatus) {
      return res.status(context.errorStatus).json({ success: false, message: context.errorMessage });
    }

    const semester = await getTargetSemester(semester_id);
    if (!semester) {
      return res.status(400).json({ success: false, message: 'Semester tidak ditemukan.' });
    }

    const riwayatSiswa = await prisma.riwayatKelasSiswa.findMany({
      where: {
        kelas_id,
        tahun_ajaran_id: context.targetKelas.tahun_ajaran_id,
        status_kenaikan: 'Sedang_Belajar',
        siswa: { status_siswa: { not: 'Alumni' } }
      },
      select: { id_riwayat: true }
    });

    const validRiwayatIds = new Set(riwayatSiswa.map((riwayat) => riwayat.id_riwayat));
    const requestedRiwayatIds = new Set(items.map((item) => item?.riwayat_id));

    if (requestedRiwayatIds.size !== items.length || requestedRiwayatIds.size !== validRiwayatIds.size) {
      return res.status(400).json({ success: false, message: 'Data siswa harus lengkap dan tidak boleh duplikat.' });
    }

    for (const item of items) {
      if (!validRiwayatIds.has(item.riwayat_id)) {
        return res.status(403).json({ success: false, message: 'Terdapat siswa yang bukan bagian dari kelas wali Anda.' });
      }

      if (!PREDIKAT_EKSKUL.has(item.predikat)) {
        return res.status(400).json({ success: false, message: 'Predikat ekstrakurikuler wajib dipilih untuk semua siswa.' });
      }

      const nilaiPrakerinInput = item.nilai_prakerin;
      if (parseOptionalNilai(nilaiPrakerinInput) === undefined) {
        return res.status(400).json({ success: false, message: 'Nilai Prakerin harus berupa angka 0 sampai 100 atau dikosongkan.' });
      }
    }

    await prisma.$transaction(async (tx) => {
      const pramuka = await getOrCreatePramuka(tx);

      for (const item of items) {
        const keterangan = item.keterangan?.trim() || null;
        const catatan = item.catatan?.trim() || null;
        const nilaiPrakerin = parseOptionalNilai(item.nilai_prakerin);

        await tx.raporEkstrakurikuler.upsert({
          where: {
            riwayat_kelas_siswa_id_semester_id_ekstrakurikuler_id: {
              riwayat_kelas_siswa_id: item.riwayat_id,
              semester_id,
              ekstrakurikuler_id: pramuka.id_ekstrakurikuler
            }
          },
          update: {
            wali_kelas_id: context.guru.id_guru,
            predikat: item.predikat,
            keterangan
          },
          create: {
            riwayat_kelas_siswa_id: item.riwayat_id,
            semester_id,
            ekstrakurikuler_id: pramuka.id_ekstrakurikuler,
            wali_kelas_id: context.guru.id_guru,
            predikat: item.predikat,
            keterangan
          }
        });

        await tx.raporCatatanWali.upsert({
          where: {
            riwayat_kelas_siswa_id_semester_id: {
              riwayat_kelas_siswa_id: item.riwayat_id,
              semester_id
            }
          },
          update: {
            wali_kelas_id: context.guru.id_guru,
            catatan
          },
          create: {
            riwayat_kelas_siswa_id: item.riwayat_id,
            semester_id,
            wali_kelas_id: context.guru.id_guru,
            catatan
          }
        });

        if (nilaiPrakerin === null) {
          await tx.raporPrakerinWali.deleteMany({
            where: {
              riwayat_kelas_siswa_id: item.riwayat_id,
              semester_id
            }
          });
        } else {
          await tx.raporPrakerinWali.upsert({
            where: {
              riwayat_kelas_siswa_id_semester_id: {
                riwayat_kelas_siswa_id: item.riwayat_id,
                semester_id
              }
            },
            update: {
              wali_kelas_id: context.guru.id_guru,
              kktp: '',
              nilai_akhir: nilaiPrakerin,
              capaian_kompetensi: '',
              status_acc: 'PENDING',
              kepala_sekolah_id: null,
              tgl_acc: null
            },
            create: {
              riwayat_kelas_siswa_id: item.riwayat_id,
              semester_id,
              wali_kelas_id: context.guru.id_guru,
              kktp: '',
              nilai_akhir: nilaiPrakerin,
              capaian_kompetensi: '',
              status_acc: 'PENDING'
            }
          });
        }
      }
    });

    return res.status(200).json({ success: true, message: 'Nilai Prakerin, ekstrakurikuler, dan catatan rapor berhasil disimpan.' });
  } catch (error) {
    console.error('Error saveRaporPendukungWali:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat menyimpan rapor wali.' });
  }
};
