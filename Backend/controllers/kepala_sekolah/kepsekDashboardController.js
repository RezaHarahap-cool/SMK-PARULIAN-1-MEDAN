import prisma from '../../config/prisma.js'; // Sesuaikan path Prisma-mu
import { kelompokMapelLabels } from '../../services/mapelCatalog.js';

export const getKepsekDashboardSummary = async (req, res) => {
  try {
    // 1. Hitung total data master menggunakan Prisma Count
    const totalSiswa = await prisma.siswaProfile.count();
    const totalGuru = await prisma.guruProfile.count();
    const totalKelas = await prisma.kelas.count();
    
    // Hitung Mapel (Tetap aman dengan catch 0)
    const totalMapel = await prisma.mataPelajaran.count().catch(() => 0); 

    const [detailSiswa, detailGuru, detailKelas, detailMapel] = await Promise.all([
      prisma.siswaProfile.findMany({
        orderBy: { nama_siswa: 'asc' },
        select: {
          id_siswa: true,
          nama_siswa: true,
          nisn: true,
          status_siswa: true,
          riwayat_kelas: {
            take: 1,
            select: {
              kelas: { select: { nama_kelas: true } }
            }
          }
        }
      }),
      prisma.guruProfile.findMany({
        orderBy: { nama_guru: 'asc' },
        select: {
          id_guru: true,
          nama_guru: true,
          no_hp: true,
          mata_pelajaran: { select: { mapel: true } }
        }
      }),
      prisma.kelas.findMany({
        orderBy: { nama_kelas: 'asc' },
        select: {
          id_kelas: true,
          nama_kelas: true,
          ruang_kelas: true,
          status: true,
          jurusan: { select: { jurusan: true } },
          wali_kelas: { select: { nama_guru: true } }
        }
      }),
      prisma.mataPelajaran.findMany({
        orderBy: { mapel: 'asc' },
        select: {
          id_mapel: true,
          mapel: true,
          kelompok: true
        }
      })
    ]);

    // 2. Ambil data untuk Grafik (Jumlah Siswa per Tahun Ajaran)
    const tahunAjaranData = await prisma.tahunAjaran.findMany({
      orderBy: { tahun: 'asc' }, 
      include: {
        _count: {
          select: { riwayat_siswa: true } 
        }
      }
    });

    // Format data agar sesuai dengan Recharts di frontend
    const chartData = tahunAjaranData.map(ta => ({
      tahun: ta.tahun,
      jumlah: ta._count.riwayat_siswa 
    }));

    // Jika database grafik masih kosong
    const finalChartData = chartData.length > 0 ? chartData : [
      { tahun: "Belum Ada Data", jumlah: 0 }
    ];

    // 3. Kirimkan semua data ke Frontend
    return res.status(200).json({
      success: true,
      message: "Data dasbor Kepala Sekolah berhasil ditarik!",
      data: {
        stats: {
          siswa: totalSiswa,
          guru: totalGuru,
          kelas: totalKelas,
          mapel: totalMapel
        },
        details: {
          siswa: detailSiswa.map((siswa) => ({
            id: siswa.id_siswa,
            nama: siswa.nama_siswa,
            info: siswa.nisn,
            status: siswa.riwayat_kelas[0]?.kelas?.nama_kelas || siswa.status_siswa || '-'
          })),
          guru: detailGuru.map((guru) => ({
            id: guru.id_guru,
            nama: guru.nama_guru,
            info: guru.mata_pelajaran?.mapel || 'Mapel belum ditentukan',
            status: guru.no_hp || '-'
          })),
          kelas: detailKelas.map((kelas) => ({
            id: kelas.id_kelas,
            nama: kelas.nama_kelas,
            info: kelas.jurusan?.jurusan || '-',
            status: kelas.wali_kelas?.nama_guru || 'Wali kelas belum ditentukan'
          })),
          mapel: detailMapel.map((mapel) => ({
            id: mapel.id_mapel,
            nama: mapel.mapel,
            info: kelompokMapelLabels[mapel.kelompok] || mapel.kelompok,
            status: mapel.kelompok
          }))
        },
        chart: finalChartData
      }
    });

  } catch (error) {
    console.error("Error get kepsek dashboard data:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat menarik data dasbor." 
    });
  }
};
