import React, { useState, useEffect } from "react";
import { 
  Menu, CheckSquare, Square, Loader2, AlertCircle
} from "lucide-react";
import Swal from "sweetalert2"; // 🔥 IMPORT SWEETALERT DI SINI

// 1. Tipe Data Siswa (Diperbarui agar TypeScript 100% Bahagia)
interface SiswaItem {
  id_siswa: string;
  nis: string;
  nama_siswa: string;
  gender: string;
  riwayat_kelas: Array<{
    kelas: { nama_kelas: string; ruang_kelas: string | null } | null;
    tahun_ajaran: { tahun: string } | null;
  }>;
  no_hp_wali: string;
}

export default function KenaikanKelasContent({ onMenuClick }: { onMenuClick: () => void }) {
  // State untuk Opsi Filter dari Database
  const [options, setOptions] = useState({
    kelas: [],
    tahunAjaran: []
  });

  // State Filter Aktif
  const [filterKelas, setFilterKelas] = useState("");
  const [filterTahun, setFilterTahun] = useState("");

  // State Data & UI
  const [dataSiswa, setDataSiswa] = useState<SiswaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // State Pilihan Checkbox Siswa
  const [selectedSiswa, setSelectedSiswa] = useState<string[]>([]);

  // State Form Kenaikan
  const [statusKenaikan, setStatusKenaikan] = useState("Naik Kelas");
  const [kelasTujuan, setKelasTujuan] = useState("");
  const [tahunAjaranTujuan, setTahunAjaranTujuan] = useState("");

  // 1. Ambil Data Master untuk Dropdown Filter saat komponen dimuat
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [resKelas, resTahun] = await Promise.all([
          fetch("http://187.127.121.139:3000/api/kelas", { headers }).catch(() => null),
          fetch("http://187.127.121.139:3000/api/tahun-ajaran", { headers }).catch(() => null)
        ]);

        const dataKelas = resKelas ? await resKelas.json() : { success: false };
        const dataTahun = resTahun ? await resTahun.json() : { success: false };

        if (dataKelas.success && dataTahun.success) {
          setOptions({
            kelas: dataKelas.data,
            tahunAjaran: dataTahun.data
          });
          
          // Set default filter ke opsi pertama agar tabel tidak kosong
          if (dataKelas.data.length > 0) setFilterKelas(dataKelas.data[0].id_kelas);
          if (dataTahun.data.length > 0) setFilterTahun(dataTahun.data[0].id_tahun_ajaran);
        }
      } catch (error) {
        console.error("Gagal menarik data master:", error);
      }
    };
    fetchMasterData();
  }, []);

  // 2. Fungsi Tarik Data Siswa
  const fetchSiswa = async () => {
    if (!filterKelas || !filterTahun) return;

    setIsLoading(true);
    setSelectedSiswa([]); // Reset pilihan jika filter ganti
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://187.127.121.139:3000/api/kenaikan-kelas/siswa?kelas_id=${filterKelas}&tahun_ajaran_id=${filterTahun}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();

      if (result.success) {
        setDataSiswa(result.data);
      } else {
        setDataSiswa([]);
      }
    } catch (error) {
      console.error("Gagal menarik data siswa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Tarik Data Siswa setiap kali Filter berubah
  useEffect(() => {
    fetchSiswa();
  }, [filterKelas, filterTahun]);

  // Logika Checkbox
  const handleSelectAll = () => {
    if (selectedSiswa.length === dataSiswa.length) {
      setSelectedSiswa([]);
    } else {
      setSelectedSiswa(dataSiswa.map(s => s.id_siswa));
    }
  };

  const toggleSiswa = (id: string) => {
    if (selectedSiswa.includes(id)) {
      setSelectedSiswa(selectedSiswa.filter(siswaId => siswaId !== id));
    } else {
      setSelectedSiswa([...selectedSiswa, id]);
    }
  };

  const isAllSelected = selectedSiswa.length === dataSiswa.length && dataSiswa.length > 0;

  // 3. Eksekusi Proses Kenaikan Kelas (POST/PUT ke API)
  const handleProsesKenaikan = async () => {
    if (statusKenaikan === "Naik Kelas" && (!kelasTujuan || !tahunAjaranTujuan)) {
      // 🔥 Ganti alert/errorMsg manual dengan SweetAlert2
      Swal.fire({
        title: "Perhatian!",
        text: "Mohon lengkapi Kelas Tujuan dan Tahun Ajaran Tujuan untuk siswa yang Naik Kelas!",
        icon: "warning",
        confirmButtonColor: "#d33"
      });
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      const payload = {
        siswa_ids: selectedSiswa,
        status: statusKenaikan,
        kelas_tujuan_id: statusKenaikan === "Naik Kelas" ? kelasTujuan : null,
        tahun_ajaran_tujuan_id: statusKenaikan === "Naik Kelas" ? tahunAjaranTujuan : null,
      };

      const res = await fetch("http://187.127.121.139:3000/api/kenaikan-kelas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (result.success) {
        // 🔥 Notifikasi Sukses SweetAlert2
        Swal.fire({
          title: "Berhasil!",
          text: `Berhasil memproses ${selectedSiswa.length} siswa!`,
          icon: "success",
          confirmButtonColor: "#000000",
          confirmButtonText: "Selesai"
        }).then(() => {
          setSelectedSiswa([]);
          setStatusKenaikan("Naik Kelas");
          setKelasTujuan("");
          setTahunAjaranTujuan("");
          fetchSiswa(); // Refresh tabel otomatis tanpa reload halaman
        });
      } else {
        // 🔥 Notifikasi Gagal SweetAlert2
        Swal.fire({
          title: "Gagal!",
          text: result.message || "Gagal memproses data.",
          icon: "error",
          confirmButtonColor: "#d33"
        });
        setErrorMsg(result.message || "Gagal memproses data.");
      }
    } catch (error) {
      console.error("Error API:", error);
      Swal.fire({
        title: "Server Error",
        text: "Terjadi kesalahan pada server saat memproses data.",
        icon: "error",
        confirmButtonColor: "#d33"
      });
      setErrorMsg("Terjadi kesalahan pada server.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-gray-50 p-6 md:p-10">
      
      {/* Header Content */}
      <div className="flex items-center gap-4 mb-8">
        <button className="lg:hidden p-2 bg-white rounded-lg shadow-sm cursor-pointer" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">Pengelolaan Kenaikan Kelas</h2>
        </div>
      </div>

      {/* Filter Row & Tombol Pilih Semua */}
      <div className="flex flex-col xl:flex-row justify-between items-end gap-4 mb-6">
        
        {/* Kiri: Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm w-full xl:w-auto">
          <select 
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold focus:outline-none focus:border-black cursor-pointer"
          >
            <option value="" disabled>-- Pilih Tahun Ajaran --</option>
            {options.tahunAjaran.map((ta: any) => (
              <option key={ta.id_tahun_ajaran} value={ta.id_tahun_ajaran}>{ta.tahun}</option>
            ))}
          </select>

          <select 
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold focus:outline-none focus:border-black cursor-pointer max-w-[200px] truncate"
          >
            <option value="" disabled>-- Pilih Kelas --</option>
            {options.kelas.map((k: any) => (
              <option key={k.id_kelas} value={k.id_kelas}>
                {k.nama_kelas} {k.ruang_kelas ? `- ${k.ruang_kelas}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Kanan: Tombol Pilih Semua */}
        <button 
          onClick={handleSelectAll}
          disabled={dataSiswa.length === 0}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors cursor-pointer border-2 disabled:opacity-50 disabled:cursor-not-allowed
            ${isAllSelected 
              ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
              : 'bg-black border-black text-white hover:bg-gray-800'}`}
        >
          {isAllSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
          {isAllSelected ? "Batalkan Pilihan" : "Pilih Semua"}
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-8">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-6 py-4 w-16 text-center">No</th>
                <th className="px-6 py-4">NIS</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4 text-center">L/P</th>
                <th className="px-6 py-4 text-center">Kelas Saat Ini</th>
                <th className="px-6 py-4 text-center">Tahun Ajaran</th>
                <th className="px-6 py-4 text-center">Pilih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-black mb-2" />
                    <p className="text-gray-500 font-medium">Memuat data siswa...</p>
                  </td>
                </tr>
              ) : dataSiswa.length > 0 ? (
                dataSiswa.map((item, index) => {
                  const isSelected = selectedSiswa.includes(item.id_siswa);
                  
                  // BONGKAR DATA KELAS (Langsung di elemen JSX agar TS tidak rewel)
                  return (
                    <tr 
                      key={item.id_siswa} 
                      onClick={() => toggleSiswa(item.id_siswa)}
                      className={`transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 text-center font-bold text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{item.nis}</td>
                      <td className="px-6 py-4 text-black font-extrabold">{item.nama_siswa || "N/A"}</td>
                      <td className="px-6 py-4 text-center">
                        {item.gender === "Laki_laki" || item.gender === "Pria" ? "L" : "P"}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold">
                        {/* TypeScript Super Aman: Ambil nama kelas langsung dari array jika ada */}
                        {item.riwayat_kelas?.[0]?.kelas?.nama_kelas || "-"}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        {/* TypeScript Super Aman: Ambil tahun ajaran langsung dari array jika ada */}
                        {item.riwayat_kelas?.[0]?.tahun_ajaran?.tahun || "-"}
                      </td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleSiswa(item.id_siswa)}
                          className="w-5 h-5 cursor-pointer accent-blue-600 rounded"
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-gray-500">
                    Siswa tidak ditemukan untuk filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bagian Bawah: Form Penentuan Status & Kelas Tujuan */}
      {selectedSiswa.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg animate-fade-in mb-24">
          <div className="mb-4">
            <h3 className="font-extrabold text-lg text-black">Proses Data Terpilih</h3>
            <p className="text-sm text-gray-500">Anda telah memilih <span className="font-bold text-blue-600">{selectedSiswa.length} siswa</span> untuk diproses.</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Box 1: Pilih Status */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Status</label>
              <select 
                value={statusKenaikan}
                onChange={(e) => {
                  setStatusKenaikan(e.target.value);
                  if (e.target.value !== "Naik Kelas") {
                    setKelasTujuan("");
                    setTahunAjaranTujuan("");
                  }
                }}
                className={`w-full px-4 py-3 rounded-lg font-bold outline-none cursor-pointer border-2 transition-colors
                  ${statusKenaikan === 'Naik Kelas' ? 'bg-green-500 border-green-600 text-white' : 
                    statusKenaikan === 'Tinggal Kelas' ? 'bg-red-500 border-red-600 text-white' : 
                    'bg-blue-500 border-blue-600 text-white'}`}
              >
                <option value="Naik Kelas" className="bg-white text-black">Naik Kelas</option>
                <option value="Tinggal Kelas" className="bg-white text-black">Tinggal Kelas</option>
                <option value="Lulus" className="bg-white text-black">Lulus</option>
              </select>
            </div>

            {/* Box 2: Kelas Tujuan */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <label className="block text-sm font-bold text-gray-700 mb-2">Kelas Tujuan</label>
              <select 
                value={kelasTujuan}
                onChange={(e) => setKelasTujuan(e.target.value)}
                disabled={statusKenaikan === 'Lulus' || statusKenaikan === 'Tinggal Kelas'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:border-black cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <option value="">-- Pilih Kelas Tujuan --</option>
                {options.kelas.map((k: any) => (
                  <option key={k.id_kelas} value={k.id_kelas}>
                    {k.nama_kelas} {k.ruang_kelas ? `- ${k.ruang_kelas}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Box 3: Tahun Ajaran Tujuan */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <label className="block text-sm font-bold text-gray-700 mb-2">Tahun Ajaran Tujuan</label>
              <select 
                value={tahunAjaranTujuan}
                onChange={(e) => setTahunAjaranTujuan(e.target.value)}
                disabled={statusKenaikan === 'Lulus' || statusKenaikan === 'Tinggal Kelas'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:border-black cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <option value="">-- Pilih Tahun Ajaran --</option>
                {options.tahunAjaran.map((ta: any) => (
                  <option key={ta.id_tahun_ajaran} value={ta.id_tahun_ajaran}>
                    {ta.tahun}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Tombol Aksi Akhir */}
          <div className="flex justify-end gap-4 border-t border-gray-100 pt-6">
            <button 
              onClick={() => setSelectedSiswa([])}
              disabled={isSaving}
              className="px-8 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button 
              onClick={handleProsesKenaikan}
              disabled={isSaving}
              className="px-8 py-3 flex items-center gap-2 rounded-xl font-bold bg-black text-white hover:bg-gray-800 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</> : "Simpan Data"}
            </button>
          </div>
        </div>
      )}

    </main>
  );
}