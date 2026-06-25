import React, { useState, useEffect } from "react";
import {
  Menu,
  Search,
  Users,
  CheckSquare,
  Square,
  ArrowRightCircle,
  Loader2,
  AlertCircle,
  ChevronLeft, // 🔥 Icon Pagination
  ChevronRight // 🔥 Icon Pagination
} from "lucide-react";
import Swal from "sweetalert2"; // 🔥 IMPORT SWEETALERT

// Tipe Data
interface SiswaTanpaKelas {
  id_siswa: string;
  nis: string;
  nisn: string;
  nama_siswa: string;
  gender: string;
}

export default function PenempatanKelasContent({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  // State Data
  const [siswaList, setSiswaList] = useState<SiswaTanpaKelas[]>([]);
  const [kelasOptions, setKelasOptions] = useState<any[]>([]);
  const [tahunAjaranOptions, setTahunAjaranOptions] = useState<any[]>([]);

  // State Form & Seleksi
  const [selectedSiswa, setSelectedSiswa] = useState<string[]>([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedTahun, setSelectedTahun] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // State Status
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ==========================================
  // STATE BARU UNTUK PAGINATION
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 🔥 Tampilkan 5 baris per halaman

  // Tarik Data dari API
  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Tarik 3 API sekaligus (Siswa Nganggur, Master Kelas, Master Tahun Ajaran)
      const [resSiswa, resKelas, resTahun] = await Promise.all([
        fetch("http://187.127.121.139:3000/api/penempatan/tanpa-kelas", {
          headers,
        }).catch(() => null),
        fetch("http://187.127.121.139:3000/api/kelas", { headers }).catch(() => null),
        // Abaikan error jika API tahun ajaran belum dibuat di backend
        fetch("http://187.127.121.139:3000/api/tahun-ajaran", { headers }).catch(
          () => null,
        ),
      ]);

      const dataSiswa = resSiswa ? await resSiswa.json() : { success: false };
      const dataKelas = resKelas ? await resKelas.json() : { success: false };
      const dataTahun = resTahun ? await resTahun.json() : { success: false };

      if (dataSiswa.success) setSiswaList(dataSiswa.data);
      if (dataKelas.success) setKelasOptions(dataKelas.data);

      // Jika API Tahun Ajaran sudah ada, pakai datanya. Jika belum, pakai data dummy sementara
      if (dataTahun && dataTahun.success) {
        setTahunAjaranOptions(dataTahun.data);
      } else {
        setTahunAjaranOptions([
          { id_tahun_ajaran: "dummy-1", tahun: "2026/2027 Ganjil" },
        ]);
      }
    } catch (error) {
      console.error("Gagal menarik data:", error);
      setErrorMsg("Gagal terhubung ke server saat menarik data penempatan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Pencarian
  const filteredSiswa = siswaList.filter(
    (s) =>
      s.nama_siswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.includes(searchQuery),
  );

  // Reset pagination ke halaman 1 saat user melakukan pencarian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // ==========================================
  // LOGIKA MATEMATIKA PAGINATION
  // ==========================================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSiswa.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSiswa.length / itemsPerPage);

  // Logika Checkbox Massal (Memilih SEMUA siswa hasil pencarian, bukan cuma 1 halaman)
  const handleSelectAll = () => {
    if (selectedSiswa.length === filteredSiswa.length) {
      setSelectedSiswa([]); // Uncheck all
    } else {
      setSelectedSiswa(filteredSiswa.map((s) => s.id_siswa)); // Check all visible
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedSiswa.includes(id)) {
      setSelectedSiswa(selectedSiswa.filter((siswaId) => siswaId !== id));
    } else {
      setSelectedSiswa([...selectedSiswa, id]);
    }
  };

  // Submit Penempatan (Bulk Insert)
  const handleSubmitPenempatan = async () => {
    // 🔥 GANTI ALERT DENGAN SWEETALERT2
    if (selectedSiswa.length === 0) return Swal.fire("Perhatian!", "Pilih minimal 1 siswa!", "warning");
    if (!selectedKelas) return Swal.fire("Perhatian!", "Pilih kelas tujuan!", "warning");
    if (!selectedTahun) return Swal.fire("Perhatian!", "Pilih tahun ajaran aktif!", "warning");

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://187.127.121.139:3000/api/penempatan/bulk-insert",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            kelas_id: selectedKelas,
            tahun_ajaran_id: selectedTahun,
            siswa_ids: selectedSiswa,
          }),
        },
      );

      const result = await response.json();
      if (result.success) {
        // 🔥 SWEETALERT SUCCESS
        Swal.fire({
          title: "Berhasil!",
          text: result.message || `${selectedSiswa.length} siswa berhasil ditempatkan ke kelas.`,
          icon: "success",
          confirmButtonColor: "#000000",
        });
        setSelectedSiswa([]); // Kosongkan pilihan
        setSelectedKelas("");
        fetchData(); // Refresh data tabel
      } else {
        Swal.fire("Gagal!", result.message || "Gagal memproses penempatan.", "error");
      }
    } catch (error) {
      console.error("Error penempatan:", error);
      Swal.fire("Server Error", "Terjadi kesalahan pada server saat mengeksekusi penempatan.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-[#f4f7f6] p-6 md:p-10 custom-scrollbar">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          className="lg:hidden p-2 bg-white shadow-sm border border-gray-200 rounded-lg cursor-pointer"
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium text-sm">
            Selamat Datang,
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight">
            Penempatan Siswa Baru
          </h2>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-semibold flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-5 h-5" /> {errorMsg}
        </div>
      )}

      {/* Grid Utama (Kiri: Tabel, Kanan: Form Eksekusi) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* BAGIAN KIRI: TABEL SISWA */}
        <div className="w-full lg:w-2/3 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
            <div>
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" /> Daftar Siswa Tanpa Kelas
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Siswa yang belum masuk ke rombel mana pun.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama / NIS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-bold">
                <tr>
                  <th className="px-5 py-4 w-12 text-center">
                    <button
                      onClick={handleSelectAll}
                      className="text-gray-400 hover:text-black transition-colors focus:outline-none cursor-pointer"
                      title="Pilih Semua Siswa (Termasuk halaman lain)"
                    >
                      {selectedSiswa.length > 0 &&
                      selectedSiswa.length === filteredSiswa.length ? (
                        <CheckSquare className="w-5 h-5 text-black" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-5 py-4">NIS</th>
                  <th className="px-5 py-4">Nama Siswa</th>
                  <th className="px-5 py-4 text-center">Gender</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-16 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-black" />
                        <p>Memuat data siswa...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  // 🔥 LOOPING MENGGUNAKAN currentItems BUKAN filteredSiswa
                  currentItems.map((siswa) => {
                    const isChecked = selectedSiswa.includes(siswa.id_siswa);
                    return (
                      <tr
                        key={siswa.id_siswa}
                        className={`transition-colors cursor-pointer ${isChecked ? "bg-blue-50/50" : "hover:bg-gray-50"}`}
                        onClick={() => handleSelectOne(siswa.id_siswa)}
                      >
                        <td className="px-5 py-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // Handler dipicu lewat onClick di <tr>
                            className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black cursor-pointer accent-black pointer-events-none"
                          />
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-600">
                          {siswa.nis}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-gray-900">
                          {siswa.nama_siswa}
                        </td>
                        <td className="px-5 py-3.5 text-center text-gray-500 font-medium">
                          {siswa.gender === "Pria" ? "L" : "P"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-16 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <CheckSquare className="w-10 h-10 mb-3 text-green-500/50" />
                        <p className="text-base font-bold text-gray-800">
                          Semua siswa sudah masuk kelas!
                        </p>
                        <p className="text-sm">
                          Tidak ada siswa baru yang perlu ditempatkan.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ==========================================
              UI PAGINATION
              ========================================== */}
          {!isLoading && filteredSiswa.length > 0 && (
            <div className="border-t border-gray-200 px-5 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
              <p className="text-sm text-gray-500 font-medium">
                Menampilkan <span className="font-bold text-gray-900">{indexOfFirstItem + 1}</span> - <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, filteredSiswa.length)}</span> dari <span className="font-bold text-gray-900">{filteredSiswa.length}</span> siswa
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="text-sm font-bold text-gray-800 px-2">
                  Hal {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BAGIAN KANAN: PANEL EKSEKUSI (STICKY) */}
        <div className="w-full lg:w-1/3 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:sticky lg:top-6">
          <h3 className="font-extrabold text-black text-lg mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
            <ArrowRightCircle className="w-5 h-5 text-gray-500" /> Panel Penempatan
          </h3>

          <div className="space-y-5">
            {/* Box Status Terpilih */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center transition-colors">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                Siswa Terpilih
              </p>
              <p className={`text-4xl font-extrabold ${selectedSiswa.length > 0 ? "text-blue-600" : "text-black"}`}>
                {selectedSiswa.length}
              </p>
            </div>

            {/* Form Pilihan */}
            <div className="space-y-5">
              {/* 1. Tahun Ajaran */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Tahun Ajaran Aktif
                </label>
                <select
                  value={selectedTahun}
                  onChange={(e) => setSelectedTahun(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all cursor-pointer hover:border-gray-300 disabled:opacity-50 disabled:bg-gray-50"
                >
                  <option value="" disabled>
                    -- Pilih Tahun Ajaran --
                  </option>
                  {tahunAjaranOptions.length > 0 ? (
                    tahunAjaranOptions.map((ta) => (
                      <option
                        key={ta.id_tahun_ajaran || ta.id_tahun}
                        value={ta.id_tahun_ajaran || ta.id_tahun}
                      >
                        {ta.tahun}
                      </option>
                    ))
                  ) : (
                    <option disabled>Data Tahun Ajaran belum tersedia</option>
                  )}
                </select>
              </div>

              {/* 2. Ruang Kelas */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Ruang Kelas Tujuan
                </label>
                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all cursor-pointer hover:border-gray-300 disabled:opacity-50 disabled:bg-gray-50"
                >
                  <option value="" disabled>
                    -- Pilih Ruangan Kelas --
                  </option>
                  {kelasOptions.length > 0 ? (
                    kelasOptions.map((k) => (
                      <option key={k.id_kelas} value={k.id_kelas}>
                        {k.nama_kelas} - {k.ruang_kelas} ({k.jurusan?.jurusan})
                      </option>
                    ))
                  ) : (
                    <option disabled>Data Kelas belum tersedia</option>
                  )}
                </select>
              </div>
            </div>

            {/* Tombol Eksekusi */}
            <button
              onClick={handleSubmitPenempatan}
              disabled={
                isSaving ||
                selectedSiswa.length === 0 ||
                !selectedKelas ||
                !selectedTahun
              }
              className={`w-full py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-sm ${
                selectedSiswa.length === 0 || !selectedKelas || !selectedTahun
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800 hover:shadow-md cursor-pointer"
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Memproses...
                </>
              ) : (
                `Pindahkan ${selectedSiswa.length} Siswa ke Kelas`
              )}
            </button>

            <p className="text-[10px] text-gray-400 text-center leading-relaxed mt-4">
              Pastikan Anda memilih kelas dan tahun ajaran yang tepat. Tindakan
              ini akan memindahkan siswa secara massal ke dalam ruangan
              terpilih.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}