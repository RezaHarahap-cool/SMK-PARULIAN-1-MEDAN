import prisma from '../../config/prisma.js';
import * as XLSX from 'xlsx';

// ==========================================
// SIMPAN / UPDATE NILAI (UPSERT LOGIC)
// ==========================================
export const simpanNilai = async (req, res) => {
  // Payload dari Frontend React
  const { mengajar_id, jenisPenilaian, jenisNilai, grades } = req.body;

  try {
    if (!mengajar_id || !jenisPenilaian || !grades) {
      return res.status(400).json({ success: false, message: "Data tidak lengkap!" });
    }

    // Mapping nama kolom UI React ke format ENUM Prisma
    const mapTugas = { "Tugas 1": "TUGAS_1", "Tugas 2": "TUGAS_2", "Tugas 3": "TUGAS_3", "Tugas 4": "TUGAS_4" };
    const mapPH = { "PH1": "PH_1", "PH2": "PH_2", "PH3": "PH_3", "PH4": "PH_4" };

    // Kita kumpulkan semua proses database ke dalam array Promise agar cepat dieksekusi bersamaan
    const transaksiDb = [];

    // Looping data per siswa (Key = id_siswa, Value = Objek nilai)
    for (const [siswa_id, dataNilaiSiswa] of Object.entries(grades)) {
      
      // Looping kolom nilai per siswa (Contoh Key = "Tugas 1", Value = "90")
      for (const [kolomUI, nilaiString] of Object.entries(dataNilaiSiswa)) {
        if (!nilaiString || nilaiString === "") continue; // Lewati kalau inputannya kosong
        
        const nilaiAngka = Number(nilaiString);
        if (!Number.isFinite(nilaiAngka) || nilaiAngka < 0 || nilaiAngka > 100) {
          return res.status(400).json({
            success: false,
            message: "Nilai harus berupa angka 0 sampai 100."
          });
        }

        // ==========================================
        // CABANG 1: NILAI TUGAS
        // ==========================================
        if (jenisPenilaian === "Tugas") {
          const enumKe = mapTugas[kolomUI];
          if (!enumKe) continue;

          transaksiDb.push(async () => {
            const existing = await prisma.nilaiTugas.findFirst({
              where: { mengajar_id, siswa_id, penilaian_ke: enumKe, jenis_nilai: jenisNilai }
            });
            if (existing) {
              return prisma.nilaiTugas.update({
                where: { id_nilai_tugas: existing.id_nilai_tugas },
                data: { nilai_tugas: nilaiAngka }
              });
            } else {
              return prisma.nilaiTugas.create({
                data: { mengajar_id, siswa_id, penilaian_ke: enumKe, jenis_nilai: jenisNilai, nilai_tugas: nilaiAngka }
              });
            }
          });
        }

        // ==========================================
        // CABANG 2: PENILAIAN HARIAN (PH)
        // ==========================================
        else if (jenisPenilaian === "PH") {
          const enumKe = mapPH[kolomUI];
          if (!enumKe) continue;

          transaksiDb.push(async () => {
            const existing = await prisma.penilaianHarian.findFirst({
              where: { mengajar_id, siswa_id, penilaian_ke: enumKe, jenis_nilai: jenisNilai }
            });
            if (existing) {
              return prisma.penilaianHarian.update({
                where: { id_penilaian_harian: existing.id_penilaian_harian },
                data: { nilai_penilaian_harian: nilaiAngka }
              });
            } else {
              return prisma.penilaianHarian.create({
                data: { mengajar_id, siswa_id, penilaian_ke: enumKe, jenis_nilai: jenisNilai, nilai_penilaian_harian: nilaiAngka }
              });
            }
          });
        }

        // ==========================================
        // CABANG 3: PTS
        // ==========================================
        else if (jenisPenilaian === "PTS") {
          transaksiDb.push(async () => {
            const existing = await prisma.penilaianTengahSemester.findFirst({
              where: { mengajar_id, siswa_id }
            });
            if (existing) {
              return prisma.penilaianTengahSemester.update({
                where: { id_penilaian_tengah_semester: existing.id_penilaian_tengah_semester },
                data: { pts: nilaiAngka }
              });
            } else {
              return prisma.penilaianTengahSemester.create({
                data: { mengajar_id, siswa_id, pts: nilaiAngka }
              });
            }
          });
        }

        // ==========================================
        // CABANG 4: PAS
        // ==========================================
        else if (jenisPenilaian === "PAS") {
          transaksiDb.push(async () => {
            const existing = await prisma.penilaianAkhirSemester.findFirst({
              where: { mengajar_id, siswa_id }
            });
            if (existing) {
              return prisma.penilaianAkhirSemester.update({
                where: { id_penilaian_akhir_semester: existing.id_penilaian_akhir_semester },
                data: { pas: nilaiAngka }
              });
            } else {
              return prisma.penilaianAkhirSemester.create({
                data: { mengajar_id, siswa_id, pas: nilaiAngka }
              });
            }
          });
        }

      }
    }

    // Eksekusi semua query secara paralel agar super cepat
    for (const eksekusiQuery of transaksiDb) {
  await eksekusiQuery();
}

    res.status(200).json({
      success: true,
      message: `Data nilai ${jenisPenilaian} berhasil disimpan!`
    });

  } catch (error) {
    console.error("Error simpanNilai:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat menyimpan nilai."
    });
  }
};

// ==========================================
// AMBIL NILAI (UNTUK DITAMPILKAN KEMBALI)
// ==========================================
export const getNilai = async (req, res) => {
  // Ambil parameter dari query URL
  const { mengajar_id, jenisPenilaian, jenisNilai } = req.query;

  try {
    if (!mengajar_id || !jenisPenilaian) {
      return res.status(400).json({ success: false, message: "Parameter tidak lengkap!" });
    }

    let dataNilai = [];

    // Cari di tabel yang sesuai dengan pilihan guru
    if (jenisPenilaian === "Tugas") {
      dataNilai = await prisma.nilaiTugas.findMany({
        where: { mengajar_id, jenis_nilai: jenisNilai }
      });
    } else if (jenisPenilaian === "PH") {
      dataNilai = await prisma.penilaianHarian.findMany({
        where: { mengajar_id, jenis_nilai: jenisNilai }
      });
    } else if (jenisPenilaian === "PTS") {
      dataNilai = await prisma.penilaianTengahSemester.findMany({
        where: { mengajar_id }
      });
    } else if (jenisPenilaian === "PAS") {
      dataNilai = await prisma.penilaianAkhirSemester.findMany({
        where: { mengajar_id }
      });
    }

    res.status(200).json({
      success: true,
      data: dataNilai
    });

  } catch (error) {
    console.error("Error getNilai:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengambil data nilai."
    });
  }
};


export const downloadTemplateExcel = async (req, res) => {
  try {
    const { mengajar_id, jenisPenilaian } = req.query;

    if (!mengajar_id || !jenisPenilaian) {
      return res.status(400).json({ success: false, message: "Parameter tidak lengkap!" });
    }

    // 1. Cari data mengajar untuk mendapatkan kelas_id
    const mengajar = await prisma.mengajar.findUnique({
      where: { id_mengajar: mengajar_id }
    });

    if (!mengajar) {
      return res.status(404).json({ success: false, message: "Jadwal mengajar tidak ditemukan!" });
    }

    // 2. Ambil data siswa yang aktif di kelas tersebut
    const riwayatSiswa = await prisma.riwayatKelasSiswa.findMany({
      where: { 
        kelas_id: mengajar.kelas_id, 
        status_kenaikan: "Sedang_Belajar",
        siswa: { status_siswa: { not: "Alumni" } } 
      },
      include: { siswa: true },
      orderBy: { siswa: { nama_siswa: 'asc' } } // Urutkan sesuai abjad
    });

    // 3. Tentukan Kolom Header Berdasarkan Jenis Penilaian
    let activeColumns = [];
    if (jenisPenilaian === "Tugas") activeColumns = ["Tugas 1", "Tugas 2", "Tugas 3", "Tugas 4"];
    else if (jenisPenilaian === "PH") activeColumns = ["PH1", "PH2", "PH3", "PH4"];
    else if (jenisPenilaian === "PTS") activeColumns = ["PTS"];
    else if (jenisPenilaian === "PAS") activeColumns = ["PAS"];

    // 4. Susun Data untuk Template Excel
    const excelData = riwayatSiswa.map((item, index) => {
      const rowData = {
        "No": index + 1,
        "NIS": item.siswa.nis,
        "Nama Lengkap": item.siswa.nama_siswa
      };
      
      // Tambahkan kolom nilai yang masih kosong
      activeColumns.forEach(col => {
        rowData[col] = ""; 
      });
      
      return rowData;
    });

    // 5. Buat Workbook & Worksheet menggunakan library xlsx
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Template ${jenisPenilaian}`);

    // Atur lebar kolom agar rapi saat dibuka di Excel
    worksheet["!cols"] = [
      { wch: 5 },  // No
      { wch: 15 }, // NIS
      { wch: 35 }, // Nama Lengkap
      ...activeColumns.map(() => ({ wch: 10 })) // Kolom Nilai
    ];

    // 6. Ubah jadi file buffer
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // 7. Kirim sebagai File Download ke Browser
    res.setHeader("Content-Disposition", `attachment; filename="Template_Nilai_${jenisPenilaian}.xlsx"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    
    return res.send(excelBuffer);

  } catch (error) {
    console.error("Error downloadTemplateExcel:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat membuat template." });
  }
};
