import prisma from '../../config/prisma.js';

export const getDashboardSummary = async (req, res) => {
  try {
    // 1. Hitung total data master menggunakan Prisma Count
    const totalSiswa = await prisma.siswaProfile.count();
    const totalGuru = await prisma.guruProfile.count();
    const totalKelas = await prisma.kelas.count();
    
    // Hitung Mapel (Tetap aman dengan catch 0)
    const totalMapel = await prisma.mataPelajaran.count().catch(() => 0); 

    // 2. Ambil data untuk Grafik (Jumlah Siswa per Tahun Ajaran)
    const tahunAjaranData = await prisma.tahunAjaran.findMany({
      orderBy: { tahun: 'asc' }, 
      include: {
        _count: {
          // PERBAIKAN DI SINI: Gunakan 'riwayat_siswa' sesuai yang diminta Prisma
          select: { riwayat_siswa: true } 
        }
      }
    });

    // Format data agar sesuai dengan Recharts di frontend
    const chartData = tahunAjaranData.map(ta => ({
      tahun: ta.tahun,
      // PERBAIKAN DI SINI JUGA: Akses '_count.riwayat_siswa'
      jumlah: ta._count.riwayat_siswa 
    }));

    // Jika database grafik masih kosong
    const finalChartData = chartData.length > 0 ? chartData : [
      { tahun: "Belum Ada Data", jumlah: 0 }
    ];

    // 3. Kirimkan semua data dalam 1 paket
    return res.status(200).json({
      success: true,
      message: "Data dasbor berhasil ditarik!",
      data: {
        stats: {
          siswa: totalSiswa,
          guru: totalGuru,
          kelas: totalKelas,
          mapel: totalMapel
        },
        chart: finalChartData
      }
    });

  } catch (error) {
    console.error("Error get dashboard data:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat menarik data dasbor." 
    });
  }
};