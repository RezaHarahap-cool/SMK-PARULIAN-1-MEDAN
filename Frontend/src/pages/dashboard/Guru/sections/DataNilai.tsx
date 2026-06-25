import React, { useState, useEffect, useRef } from "react";
import { Menu, FileUp, Loader2, CheckCircle2, Download } from "lucide-react"; // 🔥 Tambah icon Download
import * as XLSX from "xlsx";
import Swal from "sweetalert2";

// ==========================================
// 1. TIPE DATA
// ==========================================
interface SiswaItem {
  id_siswa: string;
  nis: string;
  nama_siswa: string;
}

interface MengajarItem {
  id_mengajar: string;
  kelas_id: string;
  label: string; 
}

export default function DataNilaiContent({ onMenuClick }: { onMenuClick: () => void }) {
  // --- STATE DATA MASTER DARI DATABASE ---
  const [listMengajar, setListMengajar] = useState<MengajarItem[]>([]);
  const [allSiswa, setAllSiswa] = useState<any[]>([]); 

  // --- STATE FILTER ---
  const [filter, setFilter] = useState({
    mengajar_id: "",
    jenisPenilaian: "Tugas", // Default
    jenisNilai: "PENGETAHUAN",
  });

  // --- STATE TABEL & INPUT ---
  const [siswaData, setSiswaData] = useState<SiswaItem[]>([]);
  const [penilaianAktif, setPenilaianAktif] = useState("");
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [grades, setGrades] = useState<Record<string, Record<string, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE UI ---
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // ==========================================
  // FUNGSI 1: TARIK DATA JADWAL GURU & SISWA
  // ==========================================
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const headers = { "Authorization": `Bearer ${token}` };

      const [resMengajar, resSiswa] = await Promise.all([
        fetch("http://187.127.121.139:3000/api/jadwal-saya", { headers }),
        fetch("http://187.127.121.139:3000/api/siswa", { headers })
      ]);

      const [dataMengajarRes, dataSiswaRes] = await Promise.all([
        resMengajar.json(), resSiswa.json()
      ]);

      if (dataMengajarRes.success) {
        const mappedMengajar = dataMengajarRes.data.map((m: any) => ({
          id_mengajar: m.id_mengajar,
          kelas_id: m.kelas_id,
          label: `${m.kelas?.nama_kelas || "Kelas Unknown"} - ${m.mapel?.mapel || "Mapel Unknown"}`
        }));
        setListMengajar(mappedMengajar);
      }

      if (dataSiswaRes.success) {
        setAllSiswa(dataSiswaRes.data);
      }
    } catch (error) {
      console.error("Gagal menarik data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // ==========================================
  // FUNGSI 2: FILTER SISWA BERDASARKAN KELAS
  // ==========================================
  useEffect(() => {
    if (filter.mengajar_id) {
      const selectedMengajar = listMengajar.find(m => m.id_mengajar === filter.mengajar_id);
      if (selectedMengajar) {
        const muridDiKelasIni = allSiswa.filter((siswa: any) => {
          const riwayatAktif = siswa.riwayat_kelas && siswa.riwayat_kelas.length > 0 ? siswa.riwayat_kelas[0] : null;
          return riwayatAktif && riwayatAktif.kelas_id === selectedMengajar.kelas_id;
        });
        setSiswaData(muridDiKelasIni);
      }
    } else {
      setSiswaData([]);
      setIsTableVisible(false);
    }
  }, [filter.mengajar_id, listMengajar, allSiswa]);


  // ==========================================
  // HANDLER UI
  // ==========================================
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
    setIsTableVisible(false); 
  };

  // Handler Klik Tampilkan
  const handleTampilkan = async () => {
    if (!filter.mengajar_id) {
      Swal.fire({
        title: "Perhatian!",
        text: "Silakan pilih Jadwal Mengajar terlebih dahulu!",
        icon: "warning",
        confirmButtonColor: "#000000"
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      const url = `http://187.127.121.139:3000/api/nilai?mengajar_id=${filter.mengajar_id}&jenisPenilaian=${filter.jenisPenilaian}&jenisNilai=${filter.jenisNilai}`;
      
      const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await response.json();

      if (result.success) {
        const existingGrades: Record<string, Record<string, string>> = {};

        const reverseMapTugas: any = { "TUGAS_1": "Tugas 1", "TUGAS_2": "Tugas 2", "TUGAS_3": "Tugas 3", "TUGAS_4": "Tugas 4" };
        const reverseMapPH: any = { "PH_1": "PH1", "PH_2": "PH2", "PH_3": "PH3", "PH_4": "PH4" };

        result.data.forEach((item: any) => {
          if (!existingGrades[item.siswa_id]) {
            existingGrades[item.siswa_id] = {};
          }

          if (filter.jenisPenilaian === "Tugas") {
            const namaKolom = reverseMapTugas[item.penilaian_ke];
            existingGrades[item.siswa_id][namaKolom] = item.nilai_tugas.toString();
          } 
          else if (filter.jenisPenilaian === "PH") {
            const namaKolom = reverseMapPH[item.penilaian_ke];
            existingGrades[item.siswa_id][namaKolom] = item.nilai_penilaian_harian.toString();
          } 
          else if (filter.jenisPenilaian === "PTS") {
            existingGrades[item.siswa_id]["PTS"] = item.pts.toString();
          } 
          else if (filter.jenisPenilaian === "PAS") {
            existingGrades[item.siswa_id]["PAS"] = item.pas.toString();
          }
        });

        setGrades(existingGrades);
      } else {
        setGrades({}); 
      }

      setPenilaianAktif(filter.jenisPenilaian);
      setIsTableVisible(true);

    } catch (error) {
      console.error("Gagal menarik data nilai:", error);
      Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat mengambil riwayat nilai.",
        icon: "error",
        confirmButtonColor: "#d33"
      });
    }
  };

  const handleGradeChange = (siswaId: string, kolom: string, value: string) => {
    setGrades(prev => ({
      ...prev,
      [siswaId]: {
        ...(prev[siswaId] || {}),
        [kolom]: value
      }
    }));
  };

  // Konfigurasi Kolom Dinamis Berdasarkan Jenis Penilaian
  const getColumns = () => {
    switch (penilaianAktif) {
      case "Tugas": return ["Tugas 1", "Tugas 2", "Tugas 3", "Tugas 4"];
      case "PH": return ["PH1", "PH2", "PH3", "PH4"];
      case "PTS": return ["PTS"];
      case "PAS": return ["PAS"];
      default: return [];
    }
  };

  const activeColumns = getColumns();
  const normalizeHeader = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

  // 🔥 FUNGSI BARU: DOWNLOAD TEMPLATE EXCEL
  const handleDownloadTemplate = async () => {
    if (!filter.mengajar_id || !isTableVisible) {
      Swal.fire("Perhatian!", "Silakan tekan tombol 'Tampilkan' terlebih dahulu.", "warning");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = `http://187.127.121.139:3000/api/nilai/template?mengajar_id=${filter.mengajar_id}&jenisPenilaian=${filter.jenisPenilaian}`;
      
      const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Gagal mengunduh template");
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Template_Nilai_${filter.jenisPenilaian}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (error) {
      console.error("Gagal download template:", error);
      Swal.fire("Error!", "Gagal mengunduh template Excel.", "error");
    }
  };

  const handleUploadExcel = async (file: File) => {
    if (!isTableVisible || activeColumns.length === 0) {
      Swal.fire({
        title: "Perhatian!",
        text: "Tampilkan tabel nilai terlebih dahulu sebelum upload Excel.",
        icon: "warning",
        confirmButtonColor: "#000000"
      });
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

      if (rows.length === 0) {
        Swal.fire({
          title: "Data Kosong!",
          text: "File Excel yang Anda unggah kosong.",
          icon: "warning",
          confirmButtonColor: "#000000"
        });
        return;
      }

      const nextGrades: Record<string, Record<string, string>> = { ...grades };
      let jumlahTerbaca = 0;

      rows.forEach((row) => {
        const entries = Object.entries(row);
        const normalizedRow = new Map(entries.map(([key, value]) => [normalizeHeader(key), value]));
        const nis = String(normalizedRow.get("nis") || normalizedRow.get("nisn") || "").trim();
        const nama = String(normalizedRow.get("nama") || normalizedRow.get("namasiswa") || normalizedRow.get("namalengkap") || "").trim().toLowerCase();

        const targetSiswa = siswaData.find((siswa) =>
          (nis && String(siswa.nis).trim() === nis) ||
          (nama && siswa.nama_siswa.toLowerCase().trim() === nama)
        );

        if (!targetSiswa) return;

        const nilaiSiswa = { ...(nextGrades[targetSiswa.id_siswa] || {}) };
        activeColumns.forEach((kolom, index) => {
          const key = normalizeHeader(kolom);
          const nilai = normalizedRow.get(key) ?? normalizedRow.get(`nilai${index + 1}`) ?? entries[index + 2]?.[1];
          if (nilai !== undefined && nilai !== "") {
            const angka = Number(nilai);
            if (!Number.isNaN(angka)) {
              nilaiSiswa[kolom] = String(Math.max(0, Math.min(100, Math.round(angka))));
            }
          }
        });

        nextGrades[targetSiswa.id_siswa] = nilaiSiswa;
        jumlahTerbaca += 1;
      });

      setGrades(nextGrades);
      
      Swal.fire({
        title: "Berhasil!",
        text: `Berhasil membaca nilai untuk ${jumlahTerbaca} siswa. Periksa tabel, lalu klik Simpan Nilai.`,
        icon: "success",
        confirmButtonColor: "#000000"
      });

    } catch (error) {
      console.error("Gagal membaca Excel:", error);
      Swal.fire({
        title: "Gagal Membaca Excel",
        text: "Pastikan format file tidak rusak dan nama kolom nilai sudah sesuai.",
        icon: "error",
        confirmButtonColor: "#d33"
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ==========================================
  // FUNGSI 3: SIMPAN KE DATABASE (POST NILAI)
  // ==========================================
  const handleSimpan = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      
      const payload = {
        mengajar_id: filter.mengajar_id,
        jenisPenilaian: penilaianAktif,
        jenisNilai: filter.jenisNilai, 
        grades: grades 
      };

      const response = await fetch("http://187.127.121.139:3000/api/nilai", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          title: "Tersimpan!",
          text: result.message || "Data nilai berhasil disimpan.",
          icon: "success",
          confirmButtonColor: "#000000"
        }).then(() => {
          setIsTableVisible(false); 
        });
      } else {
        Swal.fire({
          title: "Gagal!",
          text: result.message || "Gagal menyimpan data nilai.",
          icon: "error",
          confirmButtonColor: "#d33"
        });
      }
    } catch (error) {
      console.error("Gagal simpan nilai:", error);
      Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan jaringan saat menyimpan data.",
        icon: "error",
        confirmButtonColor: "#d33"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 h-screen flex flex-col justify-center items-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold">Memuat Data Akademik...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-[#f4f7fb] p-6 md:p-10">
      
      {/* Header Content */}
      <div className="flex items-center gap-4 mb-8">
        <button className="lg:hidden p-2 bg-white rounded-lg shadow-sm cursor-pointer" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">Input Nilai</h2>
        </div>
      </div>

      {/* PANEL FILTER LENGKAP */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
          
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-800 mb-2">Pilih Kelas & Mata Pelajaran</label>
            <select 
              name="mengajar_id"
              value={filter.mengajar_id}
              onChange={handleFilterChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer font-medium"
            >
              <option value="">-- Silakan Pilih Jadwal Anda --</option>
              {listMengajar.map((m) => (
                <option key={m.id_mengajar} value={m.id_mengajar}>{m.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Jenis Penilaian</label>
            <select 
              name="jenisPenilaian" 
              value={filter.jenisPenilaian} 
              onChange={handleFilterChange} 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
            >
              <option value="Tugas">Nilai Tugas</option>
              <option value="PH">Penilaian Harian (PH)</option>
              <option value="PTS">Ujian Tengah Semester (PTS)</option>
              <option value="PAS">Ujian Akhir Semester (PAS)</option>
            </select>
          </div>

          <div className="lg:col-start-4">
            <button 
              onClick={handleTampilkan}
              className="w-full bg-black text-white px-4 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-colors cursor-pointer text-sm"
            >
              Tampilkan
            </button>
          </div>

        </div>
      </div>

      {/* AREA TABEL NILAI */}
      {isTableVisible && (
        <div className="animate-fade-in">
          
          {/* 🔥 TOMBOL DOWNLOAD TEMPLATE & UPLOAD EXCEL */}
          <div className="mb-6 flex flex-wrap gap-3">
            <button 
              onClick={handleDownloadTemplate} 
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer text-sm"
            >
              <Download className="w-4 h-4" /> Download Template
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm cursor-pointer text-sm"
            >
              <FileUp className="w-4 h-4" /> Upload Nilai dari Excel
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadExcel(file);
              }}
            />
          </div>

          {/* Frame Utama Tabel */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm relative mb-20">
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-extrabold text-black">
                Input Nilai {penilaianAktif}
              </h3>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  
                  <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-bold">
                    <tr>
                      <th className="px-4 py-4 w-16 text-center">No</th>
                      <th className="px-4 py-4 w-32">NIS</th>
                      <th className="px-4 py-4">Nama Lengkap</th>
                      {activeColumns.map((col, idx) => (
                        <th key={idx} className="px-4 py-4 text-center w-28 bg-blue-50 border-l border-white">{col}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {siswaData.length === 0 ? (
                      <tr>
                        <td colSpan={activeColumns.length + 3} className="px-6 py-8 text-center text-gray-500 font-medium">
                          Tidak ada siswa di kelas ini.
                        </td>
                      </tr>
                    ) : (
                      siswaData.map((siswa, index) => (
                        <tr key={siswa.id_siswa} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-center font-bold text-gray-900">{index + 1}</td>
                          <td className="px-4 py-3 text-gray-500 font-medium">{siswa.nis}</td>
                          <td className="px-4 py-3 font-semibold text-black">{siswa.nama_siswa}</td>
                          
                          {/* Input Form Dinamis */}
                          {activeColumns.map((col, idx) => (
                            <td key={idx} className="px-4 py-3 text-center bg-blue-50/30 border-l border-white">
                              <input 
                                type="number"
                                min="0"
                                max="100"
                                placeholder="-"
                                value={grades[siswa.id_siswa]?.[col] || ""}
                                onChange={(e) => handleGradeChange(siswa.id_siswa, col, e.target.value)}
                                className="w-16 px-2 py-2 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-blue-700 bg-white placeholder-gray-300"
                              />
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tombol Simpan & Batal */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setIsTableVisible(false)}
                className="px-6 py-2.5 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={handleSimpan}
                disabled={isSubmitting || siswaData.length === 0}
                className="px-8 py-2.5 rounded-lg font-bold text-white bg-black hover:bg-gray-800 disabled:bg-gray-400 transition-colors shadow-sm cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {isSubmitting ? "Menyimpan..." : "Simpan Nilai"}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </main>
  );
}