import ModalTambahKelas from "../components/ModalTambahKelas";
import ModalEditKelas from "../components/ModalEditKelas";
import ModalHapusKelas from "../components/ModalHapusKelas";
import React, { useState, useEffect } from "react";
import {
  Menu,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  ChevronDown,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle
} from "lucide-react";

// Tipe Data Kelas sesuai dengan response API Backend terbaru
export interface KelasItem {
  id_kelas: string;
  nama_kelas: string;
  ruang_kelas: string;
  jurusan_id: string;
  guru_id: string | null;
  tahun_ajaran_id: string; // 🔥 TAMBAHAN
  status: string;          // 🔥 TAMBAHAN
  wali_kelas?: {
    nama_guru: string;
  };
  jurusan?: {
    jurusan: string;
  };
  tahun_ajaran?: {         // 🔥 TAMBAHAN
    tahun: string;
  };
  riwayat_siswa?: Array<{ id_riwayat: string }>;
}

export default function DataKelasContent({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  // State untuk Pencarian dan Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTingkat, setFilterTingkat] = useState("Semua");
  const [filterJurusan, setFilterJurusan] = useState("Semua");

  // State untuk Dropdown & Modals
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isModalTambahOpen, setIsModalTambahOpen] = useState(false);
  const [editKelas, setEditKelas] = useState<KelasItem | null>(null);
  const [hapusKelas, setHapusKelas] = useState<KelasItem | null>(null);

  // State untuk Data API
  const [dataKelas, setDataKelas] = useState<KelasItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // ==========================================
  // STATE BARU UNTUK PAGINATION
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fungsi Menarik Data dari Backend
  const fetchKelas = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://187.127.121.139:3000/api/kelas", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await response.json();

      if (result.success) {
        setDataKelas(result.data);
      } else {
        setErrorMsg(result.message || "Gagal memuat data kelas fisik.");
      }
    } catch (error) {
      console.error("Error fetching kelas:", error);
      setErrorMsg("Tidak dapat terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKelas();
  }, []);

  // Kembalikan ke halaman 1 jika user mengubah filter/pencarian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterTingkat, filterJurusan]);

  // Logika Filter Berlapis (Search + Tingkat Dinamis + Jurusan)
  const filteredKelas = dataKelas.filter((item) => {
    const namaWali = item.wali_kelas?.nama_guru || "Belum Diatur";
    const namaJurusan = item.jurusan?.jurusan || "-";
    const tahunAjaran = item.tahun_ajaran?.tahun || "-";
    
    // Ambil tingkat kelas dari kata pertama (Misal: "X RPL 1" -> "X")
    const tingkatDinamis = item.nama_kelas.split(" ")[0];

    const matchSearch =
      item.nama_kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      namaWali.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ruang_kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tahunAjaran.toLowerCase().includes(searchQuery.toLowerCase()); // 🔥 Bisa dicari pakai tahun ajaran

    const matchTingkat =
      filterTingkat === "Semua" || tingkatDinamis === filterTingkat;
      
    const jurusanAliases: Record<string, string[]> = {
      PPLG: ["PPLG", "Pengembangan Perangkat Lunak", "Rekayasa Perangkat Lunak"],
      TJKT: ["TJKT", "TKJ", "Teknik Jaringan", "Teknik Komputer"],
      AKL: ["AKL", "Akuntansi"],
      OTKP: ["OTKP", "Otomatisasi Tata Kelola Perkantoran"],
    };
    const aliases = jurusanAliases[filterJurusan] || [filterJurusan];
    const matchJurusan =
      filterJurusan === "Semua" ||
      aliases.some((alias) => namaJurusan.toLowerCase().includes(alias.toLowerCase()));

    return matchSearch && matchTingkat && matchJurusan;
  });

  // ==========================================
  // LOGIKA MATEMATIKA PAGINATION
  // ==========================================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredKelas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredKelas.length / itemsPerPage);

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-white p-6 md:p-10 custom-scrollbar">
      {/* Header Content */}
      <div className="flex items-center gap-4 mb-8 lg:mb-10">
        <button
          className="lg:hidden p-2 bg-gray-100 rounded-lg"
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">
            Kelas (Ruangan Fisik)
          </h2>
        </div>
      </div>

      {/* Action Bar: Search, Filters, dan Tombol Tambah */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 rounded-xl">
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <Filter className="w-5 h-5 text-gray-400 hidden md:block" />

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari ruang / tahun ajaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
            />
          </div>

          {/* Dropdown Tingkat Kelas */}
          <div className="relative w-full sm:w-36">
            <select
              value={filterTingkat}
              onChange={(e) => setFilterTingkat(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-bold focus:outline-none focus:border-black cursor-pointer text-gray-700"
            >
              <option value="Semua">Semua Tingkat</option>
              <option value="X">Kelas X</option>
              <option value="XI">Kelas XI</option>
              <option value="XII">Kelas XII</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Dropdown Jurusan */}
          <div className="relative w-full sm:w-44">
            <select
              value={filterJurusan}
              onChange={(e) => setFilterJurusan(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-bold focus:outline-none focus:border-black cursor-pointer text-gray-700"
            >
              <option value="Semua">Semua Jurusan</option>
              <option value="PPLG">PPLG</option>
              <option value="TJKT">TJKT</option>
              <option value="AKL">AKL</option>
              <option value="OTKP">OTKP</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Tombol Tambah */}
        <button
          onClick={() => setIsModalTambahOpen(true)}
          className="w-full xl:w-auto flex items-center justify-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
        >
          Tambah Kelas <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-6 py-4 w-16 text-center">No</th>
                <th className="px-6 py-4">Nama Kelas</th>
                <th className="px-6 py-4">Ruangan</th>
                <th className="px-6 py-4">Jurusan</th>
                <th className="px-6 py-4">Tahun Ajaran</th> {/* 🔥 TAMBAHAN */}
                <th className="px-6 py-4">Wali Kelas</th>
                <th className="px-6 py-4 text-center">Jml. Siswa</th>
                <th className="px-6 py-4 text-center">Status</th> {/* 🔥 TAMBAHAN */}
                <th className="px-6 py-4 text-center w-24">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-black" />
                      <p>Memuat daftar kelas fisik...</p>
                    </div>
                  </td>
                </tr>
              ) : errorMsg ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-red-500 font-medium">
                    ⚠️ {errorMsg}
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr
                    key={item.id_kelas}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4 text-center text-gray-900 font-bold">
                      {indexOfFirstItem + index + 1}
                    </td>

                    <td className="px-6 py-4 text-black font-extrabold">
                      {item.nama_kelas}
                    </td>
                    
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {item.ruang_kelas}
                    </td>

                    <td className="px-6 py-4 text-gray-600 font-semibold">
                      {item.jurusan?.jurusan || "-"}
                    </td>

                    {/* 🔥 KOLOM TAHUN AJARAN */}
                    <td className="px-6 py-4 text-gray-800 font-bold">
                      {item.tahun_ajaran?.tahun || "-"}
                    </td>

                    <td className="px-6 py-4 text-gray-700 font-medium">
                      {item.wali_kelas?.nama_guru || (
                        <span className="text-red-400 italic text-xs">Belum Diatur</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-bold text-xs border border-gray-200">
                        <Users className="w-3.5 h-3.5" /> {item.riwayat_siswa?.length || 0} Siswa
                      </span>
                    </td>

                    {/* 🔥 KOLOM STATUS KELAS */}
                    <td className="px-6 py-4 text-center">
                      {item.status === "AKTIF" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full font-bold text-xs border border-green-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full font-bold text-xs border border-red-200">
                          <XCircle className="w-3.5 h-3.5" /> Non-Aktif
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center relative">
                      <button
                        onClick={() => toggleDropdown(item.id_kelas)}
                        className="p-2 rounded-md hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeDropdown === item.id_kelas && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveDropdown(null)}
                          ></div>
                          <div className="absolute right-8 top-10 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 animate-fade-in">
                            <button
                              onClick={() => {
                                setEditKelas(item); 
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                              onClick={() => {
                                setHapusKelas(item);
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Hapus
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Filter className="w-10 h-10 mb-3 opacity-20" />
                      <p className="text-base font-medium text-gray-600">
                        Kelas fisik tidak ditemukan
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION UI KONTROL */}
        {!isLoading && filteredKelas.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
            <p className="text-sm text-gray-600 font-medium">
              Menampilkan <span className="font-bold text-gray-900">{indexOfFirstItem + 1}</span> hingga <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, filteredKelas.length)}</span> dari <span className="font-bold text-gray-900">{filteredKelas.length}</span> kelas
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white text-gray-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="px-4 py-2 text-sm font-bold text-gray-800">
                Halaman {currentPage} / {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white text-gray-700"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <ModalHapusKelas 
        kelas={hapusKelas as any} 
        onClose={() => setHapusKelas(null)} 
        onRefresh={fetchKelas} 
      />
      <ModalEditKelas 
        kelas={editKelas as any} 
        onClose={() => setEditKelas(null)} 
        onRefresh={fetchKelas} 
      />
      <ModalTambahKelas
        isOpen={isModalTambahOpen}
        onClose={() => setIsModalTambahOpen(false)}
        onRefresh={fetchKelas}
      />
    </main>
  );
}