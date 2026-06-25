import React, { useState, useEffect } from "react";
import { Menu, Loader2, CheckCircle2, History, Eye, X } from "lucide-react";
import Swal from "sweetalert2";

// ==========================================
// 1. TIPE DATA
// ==========================================
interface SiswaPresensi {
  id: string;
  nama: string;
  status: "Hadir" | "Izin" | "Sakit" | "Alpha" | "";
  catatan: string;
}

interface MengajarItem {
  id_mengajar: string;
  kelas_id: string;
  total_pertemuan: number;
  label: string; 
}

interface RiwayatPresensi {
  pertemuan: string;
  tanggal: string;
  topik: string;
  total: number;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
}

export default function PresensiContent({ onMenuClick }: { onMenuClick: () => void }) {
  // --- STATE DATA MASTER DARI DATABASE ---
  const [listMengajar, setListMengajar] = useState<MengajarItem[]>([]);
  const [allSiswa, setAllSiswa] = useState<any[]>([]);

  // --- STATE UNTUK FORM & TABEL ---
  const [filter, setFilter] = useState({
    mengajar_id: "",
    pertemuan: "",
    tanggal: new Date().toISOString().split("T")[0],
  });

  const [topik, setTopik] = useState("");
  const [siswaData, setSiswaData] = useState<SiswaPresensi[]>([]);
  const [riwayatPresensi, setRiwayatPresensi] = useState<RiwayatPresensi[]>([]);
  
  // --- STATE UI ---
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // ==========================================
  // FUNGSI 1: TARIK DATA AWAL (MENGAJAR & SISWA)
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
          total_pertemuan: Number(m.total_pertemuan || 24),
          label: `${m.kelas?.nama_kelas || "Kelas Unknown"} - ${m.mapel?.mapel || "Mapel Unknown"} (${m.guru?.nama_guru || "Tanpa Guru"})`
        }));
        setListMengajar(mappedMengajar);
      }

      if (dataSiswaRes.success) {
        setAllSiswa(dataSiswaRes.data);
      }

    } catch (error) {
      console.error("Gagal menarik data:", error);
      setErrorMsg("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchRiwayatPresensi = async (mengajarId: string) => {
    if (!mengajarId) {
      setRiwayatPresensi([]);
      return;
    }

    setIsHistoryLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://187.127.121.139:3000/api/absensi/history/${mengajarId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await response.json();
      setRiwayatPresensi(result.success ? result.data : []);
    } catch (error) {
      console.error("Gagal mengambil riwayat presensi:", error);
      setRiwayatPresensi([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleMuatRiwayat = async (pertemuan: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://187.127.121.139:3000/api/absensi/history/${filter.mengajar_id}/${pertemuan}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await response.json();

      if (!result.success) {
        Swal.fire("Gagal!", result.message || "Riwayat presensi tidak dapat dimuat.", "error");
        return;
      }

      setFilter((prev) => ({
        ...prev,
        pertemuan: result.data.pertemuan,
        tanggal: result.data.tanggal || prev.tanggal,
      }));
      setTopik(result.data.topik || "");
      setSiswaData(result.data.siswaData || []);
      
      setIsHistoryModalOpen(false); 
      
      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "success",
        title: `Riwayat pertemuan ${pertemuan} dimuat`,
        showConfirmButton: false,
        timer: 2000
      });
    } catch (error) {
      console.error("Gagal memuat detail presensi:", error);
      Swal.fire("Error!", "Gagal memuat riwayat presensi akibat masalah jaringan.", "error");
    }
  };

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

        const mappedSiswa: SiswaPresensi[] = muridDiKelasIni.map((s: any) => ({
          id: s.id_siswa,
          nama: s.nama_siswa,
          status: "", 
          catatan: ""
        }));
        
        setSiswaData(mappedSiswa);
      }
      fetchRiwayatPresensi(filter.mengajar_id);
    } else {
      setSiswaData([]); 
      setRiwayatPresensi([]);
    }
  }, [filter.mengajar_id, listMengajar, allSiswa]);


  // ==========================================
  // HANDLER FORM & TABEL
  // ==========================================
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (id: string, statusBaru: SiswaPresensi["status"]) => {
    setSiswaData(prev => prev.map(siswa => siswa.id === id ? { ...siswa, status: statusBaru } : siswa));
  };

  const handleCatatanChange = (id: string, teks: string) => {
    setSiswaData(prev => prev.map(siswa => siswa.id === id ? { ...siswa, catatan: teks } : siswa));
  };

  // 🔥 FUNGSI BARU: MENUTUP FORM (BATAL)
  const handleBatal = () => {
    setFilter({
      mengajar_id: "",
      pertemuan: "",
      tanggal: new Date().toISOString().split("T")[0],
    });
    setTopik("");
    setSiswaData([]);
  };

  const isFilterLengkap = filter.mengajar_id !== "" && filter.pertemuan !== "" && filter.tanggal !== "";
  const selectedMengajar = listMengajar.find((item) => item.id_mengajar === filter.mengajar_id);
  const totalPertemuan = Math.max(1, selectedMengajar?.total_pertemuan || 24);

  // ==========================================
  // FUNGSI 3: SIMPAN KE DATABASE (POST ABSENSI)
  // ==========================================
  const handleSimpan = async () => {
    const adaYangKosong = siswaData.some(s => s.status === "");
    
    if (adaYangKosong) {
      const confirm = await Swal.fire({
        title: "Perhatian!",
        text: "Ada siswa yang belum diabsen. Sistem akan otomatis menandai mereka sebagai 'Alpha'. Lanjutkan?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#000000",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, Lanjutkan",
        cancelButtonText: "Batal"
      });
      if (!confirm.isConfirmed) return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        mengajar_id: filter.mengajar_id,
        tgl_absensi: filter.tanggal,
        topik: topik,
        pertemuan: filter.pertemuan,
        siswaData: siswaData
      };

      const response = await fetch("http://187.127.121.139:3000/api/absensi", {
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
          title: "Berhasil!",
          text: result.message || "Presensi berhasil disimpan.",
          icon: "success",
          confirmButtonColor: "#000000"
        });
        
        fetchRiwayatPresensi(filter.mengajar_id);
        
        setFilter({ ...filter, pertemuan: "" });
        setTopik("");
        setSiswaData(prev => prev.map(s => ({ ...s, status: "", catatan: "" })));
      } else {
        Swal.fire("Gagal!", result.message, "error");
      }
    } catch (error) {
      console.error("Gagal simpan presensi:", error);
      Swal.fire("Error!", "Terjadi kesalahan jaringan.", "error");
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
    <main className="flex-1 h-screen overflow-y-auto bg-gray-50 p-6 md:p-10">
      
      {/* Header Content */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 bg-white rounded-lg shadow-sm cursor-pointer" onClick={onMenuClick}>
            <Menu className="w-6 h-6 text-black" />
          </button>
          <div>
            <p className="text-gray-500 font-medium">Selamat Datang,</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-black">Presensi Siswa</h2>
          </div>
        </div>

        {filter.mengajar_id && (
          <div className="animate-fade-in">
            <button 
              onClick={() => setIsHistoryModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer text-sm"
            >
              <History className="w-4 h-4" /> Lihat Riwayat Presensi
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-bold">{errorMsg}</div>
      )}

      {/* Main Form Container */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
        
        {/* ========================================== */}
        {/* BAGIAN 1: FILTER KELAS                     */}
        {/* ========================================== */}
        <div className="space-y-5">
          
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Pilih Kelas & Mata Pelajaran</label>
            <select 
              name="mengajar_id"
              value={filter.mengajar_id}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer font-medium"
            >
              <option value="">-- Pilih Kelas dan Mapel --</option>
              {listMengajar.map((m) => (
                <option key={m.id_mengajar} value={m.id_mengajar}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Pertemuan Ke-</label>
              <select 
                name="pertemuan"
                value={filter.pertemuan}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="">-- Pilih Pertemuan --</option>
                {[...Array(totalPertemuan)].map((_, i) => (
                  <option key={i} value={i + 1}>Pertemuan {i + 1}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Hari, Tanggal</label>
              <input 
                type="date" 
                name="tanggal"
                value={filter.tanggal}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* BAGIAN 2: TOPIK & TABEL ABSENSI            */}
        {/* ========================================== */}
        {isFilterLengkap && (
          <div className="mt-6 pt-6 border-t border-gray-200 animate-fade-in">
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-800 mb-2">Topik Pembelajaran</label>
              <input 
                type="text" 
                value={topik}
                onChange={(e) => setTopik(e.target.value)}
                placeholder="Cth: Persamaan Kuadrat dan Fungsi Linear..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-bold">
                    <tr>
                      <th className="px-4 py-3 w-12 text-center">No</th>
                      <th className="px-4 py-3 w-64">Nama Siswa</th>
                      <th className="px-4 py-3 text-center">Hadir</th>
                      <th className="px-4 py-3 text-center">Izin</th>
                      <th className="px-4 py-3 text-center">Sakit</th>
                      <th className="px-4 py-3 text-center">Alpha</th>
                      <th className="px-4 py-3">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {siswaData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500 font-medium">
                          Tidak ada data siswa ditemukan di kelas ini.
                        </td>
                      </tr>
                    ) : (
                      siswaData.map((siswa, index) => (
                        <tr key={siswa.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-center font-bold text-gray-900">{index + 1}</td>
                          <td className="px-4 py-3 font-semibold text-black">{siswa.nama}</td>
                          <td className="px-4 py-3 text-center">
                            <input type="radio" name={`status-${siswa.id}`} className="w-4 h-4 cursor-pointer accent-green-600" checked={siswa.status === "Hadir"} onChange={() => handleStatusChange(siswa.id, "Hadir")} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input type="radio" name={`status-${siswa.id}`} className="w-4 h-4 cursor-pointer accent-blue-600" checked={siswa.status === "Izin"} onChange={() => handleStatusChange(siswa.id, "Izin")} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input type="radio" name={`status-${siswa.id}`} className="w-4 h-4 cursor-pointer accent-yellow-500" checked={siswa.status === "Sakit"} onChange={() => handleStatusChange(siswa.id, "Sakit")} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input type="radio" name={`status-${siswa.id}`} className="w-4 h-4 cursor-pointer accent-red-600" checked={siswa.status === "Alpha"} onChange={() => handleStatusChange(siswa.id, "Alpha")} />
                          </td>
                          <td className="px-4 py-2">
                            <input 
                              type="text" 
                              value={siswa.catatan}
                              onChange={(e) => handleCatatanChange(siswa.id, e.target.value)}
                              placeholder="Keterangan..."
                              className="w-full min-w-[150px] px-3 py-1.5 rounded-md border border-gray-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tombol Aksi Akhir */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              {/* 🔥 TOMBOL BATAL DENGAN ONCLICK HANDLER */}
              <button 
                type="button"
                onClick={handleBatal}
                className="px-6 py-2.5 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors shadow-sm cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={handleSimpan}
                disabled={isSubmitting || siswaData.length === 0}
                className="px-8 py-2.5 rounded-lg font-bold text-white bg-black hover:bg-gray-800 disabled:bg-gray-400 transition-colors shadow-sm cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {isSubmitting ? "Menyimpan..." : "Simpan Presensi"}
              </button>
            </div>
            
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* MODAL RIWAYAT PRESENSI                     */}
      {/* ========================================== */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsHistoryModalOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col animate-fade-in z-10">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-extrabold text-black">Riwayat Presensi</h3>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-400 hover:text-red-500 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content (Scrollable) */}
            <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50 flex-1 rounded-b-2xl">
              {isHistoryLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" /> 
                  <span className="text-sm font-semibold text-gray-500">Memuat riwayat...</span>
                </div>
              ) : riwayatPresensi.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm font-medium text-gray-500">Belum ada riwayat presensi untuk jadwal ini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {riwayatPresensi.map((item) => (
                    <div key={item.pertemuan} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-extrabold text-gray-900">Pertemuan {item.pertemuan}</p>
                          <p className="text-xs font-semibold text-gray-500">{item.tanggal}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleMuatRiwayat(item.pertemuan)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-bold text-white hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" /> Muat ke Form
                        </button>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm font-medium text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        {item.topik || "Tanpa topik"}
                      </p>
                      <div className="mt-3 flex gap-2 text-[11px] font-bold">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Hadir: {item.hadir}</span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Izin: {item.izin}</span>
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Sakit: {item.sakit}</span>
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded">Alpha: {item.alpha}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}