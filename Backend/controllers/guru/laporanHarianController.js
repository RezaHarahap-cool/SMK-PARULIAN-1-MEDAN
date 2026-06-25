import prisma from '../../config/prisma.js';
import { aktifkanWhatsApp, kirimPesanWA, nonaktifkanWhatsApp } from '../../services/whatsappService.js';
import { waStatus, waQrData } from '../../services/whatsappService.js';

// ==========================================
// 1. GENERATE REKAP HARIAN (UNTUK DITAMPILKAN DI UI)
// ==========================================
export const generateRekapHarian = async (req, res) => {
  try {
    const id_users = req.user.id_users;

    const profilGuru = await prisma.guruProfile.findUnique({ where: { users_id: id_users } });
    if (!profilGuru) return res.status(404).json({ success: false, message: "Profil guru tidak ditemukan." });

    // 🔥 Tambahkan include jurusan untuk mengambil nama jurusan sesuai format pesan
    const kelasBinaan = await prisma.kelas.findFirst({ 
      where: { guru_id: profilGuru.id_guru },
      include: { jurusan: true } // Pastikan relasi jurusan ada di schema prisma kamu
    });
    if (!kelasBinaan) return res.status(403).json({ success: false, message: "Akses ditolak. Anda bukan Wali Kelas." });

    const riwayatSiswaRaw = await prisma.riwayatKelasSiswa.findMany({
      where: {
        kelas_id: kelasBinaan.id_kelas,
        status_kenaikan: "Sedang_Belajar",
        siswa: {
          status_siswa: { not: "Alumni" }
        }
      },
      include: { siswa: true }
    });

    // FILTER ANTI DUPLIKAT
    const riwayatSiswa = [];
    const idSiswaUnik = new Set();
    for (const riwayat of riwayatSiswaRaw) {
      if (!idSiswaUnik.has(riwayat.siswa_id)) {
        idSiswaUnik.add(riwayat.siswa_id);
        riwayatSiswa.push(riwayat);
      }
    }

    const daftarIdSiswa = riwayatSiswa.map(r => r.siswa_id);

    let tanggalRekap = new Date();
    tanggalRekap.setHours(0, 0, 0, 0);
    let besok = new Date(tanggalRekap);
    besok.setDate(besok.getDate() + 1);

    const adaAbsensiHariIni = await prisma.absensi.count({
      where: {
        siswa_id: { in: daftarIdSiswa },
        tgl_absensi: { gte: tanggalRekap, lt: besok }
      }
    });

    if (adaAbsensiHariIni === 0) {
      const absensiTerakhir = await prisma.absensi.findFirst({
        where: { siswa_id: { in: daftarIdSiswa } },
        orderBy: { tgl_absensi: 'desc' }
      });

      if (absensiTerakhir) {
        tanggalRekap = new Date(absensiTerakhir.tgl_absensi);
        tanggalRekap.setHours(0, 0, 0, 0);
        besok = new Date(tanggalRekap);
        besok.setDate(besok.getDate() + 1);
      }
    }

    const tanggalFormat = tanggalRekap.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const absensiHariIni = await prisma.absensi.findMany({
      where: {
        siswa_id: { in: daftarIdSiswa },
        tgl_absensi: { gte: tanggalRekap, lt: besok }
      },
      include: { mengajar: { include: { mapel: true } } },
      orderBy: { tgl_absensi: 'asc' }
    });

    const semuaAbsensiKelas = await prisma.absensi.findMany({
      where: { siswa_id: { in: daftarIdSiswa } },
      include: { mengajar: { include: { mapel: true } } },
      orderBy: { tgl_absensi: 'desc' }
    });

    const drafLaporan = riwayatSiswa.map(riwayat => {
      const murid = riwayat.siswa;
      let absenAnakIni = absensiHariIni.filter(a => a.siswa_id === murid.id_siswa);

      if (absenAnakIni.length === 0) {
        const latestAbsensi = semuaAbsensiKelas.find(a => a.siswa_id === murid.id_siswa);
        if (latestAbsensi) {
          const latestDate = latestAbsensi.tgl_absensi.toISOString().split('T')[0];
          absenAnakIni = semuaAbsensiKelas.filter(a =>
            a.siswa_id === murid.id_siswa &&
            a.tgl_absensi.toISOString().split('T')[0] === latestDate
          );
        }
      }
      
      // 🔥 FORMAT PESAN WHATSAPP BARU (Sesuai Gambar Referensi)
      const namaJurusan = kelasBinaan.jurusan?.jurusan || "-"; // Fallback jika tidak ada tabel jurusan

      let isiPesan = `Selamat siang Bapak/Ibu,\nKami dari pihak sekolah ingin menyampaikan laporan kegiatan belajar peserta didik :\n`;
      isiPesan += `Nama    : ${murid.nama_siswa}\n`;
      isiPesan += `Kelas   : ${kelasBinaan.nama_kelas}\n`;
      isiPesan += `Jurusan : ${namaJurusan}\n\n`;
      isiPesan += `Berikut kami sampaikan informasi kehadiran beserta catatan sikap siswa dalam mengikuti kegiatan pembelajaran hari ini :\n\n`;

      if (absenAnakIni.length === 0) {
        isiPesan += "_Belum ada data absensi yang diinput oleh guru mata pelajaran hari ini._\n\n";
      } else {
        absenAnakIni.forEach((absen, idx) => {
          const namaMapel = absen.mengajar.mapel.mapel;
          const status = absen.keterangan;
          const topik = absen.topik || "-";
          const sikap = absen.catatan_sikap || "-";
          
          isiPesan += `${idx + 1}. ${namaMapel}\n`;
          isiPesan += `   Topik Pembelajaran : ${topik}\n`;
          isiPesan += `   Status             : ${status}\n`;
          isiPesan += `   Catatan            : ${sikap}\n\n`;
        });
      }

      isiPesan += `Demikian informasi yang dapat kami sampaikan. Terima kasih atas perhatian Bapak/Ibu.\n`;
      isiPesan += `Salam hormat,\n`;
      isiPesan += `*${profilGuru.nama_guru}*\n`;
      isiPesan += `Wali Kelas ${kelasBinaan.nama_kelas} - SMK Swasta Parulian 1 Medan`;

      return {
        id_siswa: murid.id_siswa,
        nama_siswa: murid.nama_siswa,
        no_hp_wali: murid.no_hp_wali,
        pesan_whatsapp: isiPesan,
        jumlah_absen_terekam: absenAnakIni.length
      };
    });

    res.status(200).json({ success: true, kelas: kelasBinaan.nama_kelas, tanggal: tanggalFormat, data: drafLaporan });
  } catch (error) {
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat men-generate laporan." });
  }
};

// ==========================================
// 2. EKSEKUSI PENGIRIMAN PESAN WHATSAPP
// ==========================================
export const kirimLaporanWA = async (req, res) => {
    try {
        const id_users = req.user.id_users;
        const profilGuru = await prisma.guruProfile.findUnique({ where: { users_id: id_users } });
        if (!profilGuru) return res.status(404).json({ success: false, message: "Profil guru tidak ditemukan." });

        const kelasBinaan = await prisma.kelas.findFirst({ where: { guru_id: profilGuru.id_guru } });
        if (!kelasBinaan) return res.status(403).json({ success: false, message: "Akses ditolak. Hanya wali kelas yang bisa mengirim laporan WhatsApp." });

        const { no_hp_wali, pesan_whatsapp } = req.body;

        if (!no_hp_wali || !pesan_whatsapp) {
            return res.status(400).json({ success: false, message: "Data nomor HP atau pesan kosong." });
        }

        const isSent = await kirimPesanWA(no_hp_wali, pesan_whatsapp);

        if (isSent) {
            return res.status(200).json({ success: true, message: "Pesan berhasil dikirim ke WhatsApp." });
        } else {
            return res.status(500).json({ success: false, message: "Gagal mengirim pesan." });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || "Terjadi kesalahan sistem gateway." });
    }
};

export const cekStatusWA = (req, res) => {
    res.status(200).json({
        success: true,
        status: waStatus,
        qr: waQrData
    });
};

export const aktifkanWA = async (req, res) => {
    const result = await aktifkanWhatsApp();
    res.status(result.success ? 200 : 500).json({ ...result, qr: waQrData });
};

export const nonaktifkanWA = async (req, res) => {
    const result = await nonaktifkanWhatsApp();
    res.status(200).json({ ...result, qr: waQrData });
};
