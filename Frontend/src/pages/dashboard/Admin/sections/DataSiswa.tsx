import React, { useState, useEffect } from "react";
import ModalTambahSiswa from "../components/ModalTambahSiswa";
import ModalDetailSiswa from "../components/ModalDetailSiswa";
import ModalEditSiswa from "../components/ModalEditSiswa";
import ModalHapusSiswa from "../components/ModalHapusSiswa";
import {
  Menu,
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  Image as ImageIcon,
  Loader2,
  ChevronLeft, // 🔥 Icon pagination
  ChevronRight // 🔥 Icon pagination
} from "lucide-react";

// Tipe Data Siswa
interface SiswaItem {
  id: string; 
  nis: string;
  nama: string;
  jk: "L" | "P";
  kelas: string;
  jurusan: string;
  namaAyah: string;
  noHpWali: string;
  foto: string; 
}

const jurusanAliases: Record<string, string[]> = {
  PPLG: ["PPLG", "Pengembangan Perangkat Lunak", "Rekayasa Perangkat Lunak"],
  TJKT: ["TJKT", "TKJ", "Teknik Jaringan", "Teknik Komputer"],
  AKL: ["AKL", "Akuntansi"],
  OTKP: ["OTKP", "Otomatisasi Tata Kelola Perkantoran"],
};

export default function DataSiswaContent({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKelas, setFilterKelas] = useState("Semua Kelas");
  const [filterJurusan, setFilterJurusan] = useState("Semua Jurusan");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [isModalTambahOpen, setIsModalTambahOpen] = useState(false);
  const [detailSiswa, setDetailSiswa] = useState<SiswaItem | null>(null);
  const [editSiswa, setEditSiswa] = useState<SiswaItem | null>(null);
  const [hapusSiswa, setHapusSiswa] = useState<SiswaItem | null>(null);

  const [dataSiswa, setDataSiswa] = useState<SiswaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // ==========================================
  // STATE BARU UNTUK PAGINATION
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 🔥 Bisa kamu ubah jadi 10 atau 20 sesuai kebutuhan

  const fetchSiswa = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://187.127.121.139:3000/api/siswa", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        const mappedData: SiswaItem[] = result.data.map((siswa: any) => {
          const riwayatAktif = siswa.riwayat_kelas && siswa.riwayat_kelas.length > 0 
            ? siswa.riwayat_kelas[0] 
            : null;

          return {
            id: siswa.id_siswa, 
            nis: siswa.nis || "-",
            nama: siswa.nama_siswa || "-",
            jk: siswa.gender === "Wanita" ? "P" : "L",
            kelas: riwayatAktif ? riwayatAktif.kelas.nama_kelas : "Belum Ada Kelas", 
            jurusan: riwayatAktif ? riwayatAktif.kelas.jurusan.jurusan : "-", 
            namaAyah: siswa.nama_ayah || "-",
            noHpWali: siswa.no_hp_wali || "-",
            foto: siswa.foto ? `http://187.127.121.139:3000/uploads/${siswa.foto}` : "",
          };
        });

        setDataSiswa(mappedData);
      } else {
        setErrorMsg(result.message || "Gagal memuat data siswa.");
      }
    } catch (error) {
      console.error("Gagal menarik data siswa:", error);
      setErrorMsg("Kesalahan koneksi ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSiswa();
  }, []);

  // Filter Data
  const filteredSiswa = dataSiswa.filter((siswa) => {
    const matchSearch =
      siswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      siswa.nis.includes(searchQuery);
      
    const matchKelas =
      filterKelas === "Semua Kelas" || siswa.kelas.startsWith(filterKelas);
      
    const aliases = jurusanAliases[filterJurusan] || [filterJurusan];
    const matchJurusan =
      filterJurusan === "Semua Jurusan" ||
      aliases.some((alias) => siswa.jurusan.toLowerCase().includes(alias.toLowerCase()));

    return matchSearch && matchKelas && matchJurusan;
  });

  // 🔥 KEMBALIKAN KE HALAMAN 1 JIKA ADMIN MENGGANTI FILTER
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterKelas, filterJurusan]);

  // ==========================================
  // LOGIKA MATEMATIKA PAGINATION
  // ==========================================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Tabel HANYA akan me-render data yang sudah dipotong ini
  const currentItems = filteredSiswa.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSiswa.length / itemsPerPage);

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-white p-6 md:p-10 custom-scrollbar">
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
            Data Siswa
          </h2>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-36">
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-semibold focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="Semua Kelas">Semua Tingkat</option>
              <option value="X">Kelas X</option>
              <option value="XI">Kelas XI</option>
              <option value="XII">Kelas XII</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-44">
            <select
              value={filterJurusan}
              onChange={(e) => setFilterJurusan(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-semibold focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="Semua Jurusan">Semua Jurusan</option>
              <option value="PPLG">PPLG</option>
              <option value="TJKT">TJKT</option>
              <option value="AKL">AKL</option>
              <option value="OTKP">OTKP</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama atau NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
            />
          </div>

          <button
            onClick={() => setIsModalTambahOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
          >
            Tambah <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Container Tabel & Pagination */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-6 py-4 w-16 text-center">No</th>
                <th className="px-6 py-4 text-center">Foto</th>
                <th className="px-6 py-4">NIS</th>
                <th className="px-6 py-4">Nama Siswa</th>
                <th className="px-6 py-4 text-center">L/P</th>
                <th className="px-6 py-4 text-center">Ruang Kelas</th>
                <th className="px-6 py-4 text-center">Jurusan</th>
                <th className="px-6 py-4">Nama Ayah</th>
                <th className="px-6 py-4">No.Hp Wali</th>
                <th className="px-6 py-4 text-center w-24">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-black" />
                      <p className="font-medium">Memuat data induk siswa...</p>
                    </div>
                  </td>
                </tr>
              ) : errorMsg ? (
                <tr>
                  <td colSpan={10} className="px-6 py-10 text-center text-red-500 font-semibold">
                    ⚠️ {errorMsg}
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                // 🔥 Looping sekarang pakai currentItems
                currentItems.map((siswa, index) => (
                  <tr
                    key={siswa.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4 text-center text-gray-500 font-medium">
                      {/* 🔥 Rumus nomor urut pagination */}
                      {indexOfFirstItem + index + 1}
                    </td>

                    <td className="px-6 py-4 flex justify-center">
                      <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-white overflow-hidden relative shadow-sm">
                        {siswa.foto ? (
                          <img
                            src={siswa.foto}
                            alt={`Foto ${siswa.nama}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-bold text-gray-600">
                      {siswa.nis}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-black">
                      {siswa.nama}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-500">
                      {siswa.jk}
                    </td>
                    <td className="px-6 py-4 text-center font-bold">
                      {siswa.kelas === "Belum Ada Kelas" ? (
                        <span className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">Tanpa Kelas</span>
                      ) : (
                        <span className="text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-xs">{siswa.kelas}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-900 font-semibold">
                      {siswa.jurusan}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {siswa.namaAyah}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {siswa.noHpWali}
                    </td>

                    <td className="px-6 py-4 text-center relative">
                      <button
                        onClick={() => toggleDropdown(siswa.id)}
                        className="p-2 rounded-md hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeDropdown === siswa.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveDropdown(null)}
                          ></div>
                          <div className="absolute right-8 top-10 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 animate-fade-in">
                            <button
                              onClick={() => {
                                setDetailSiswa(siswa);
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> Lihat Detail
                            </button>
                            <button
                              onClick={() => {
                                setEditSiswa(siswa);
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit Biodata
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                              onClick={() => {
                                setHapusSiswa(siswa);
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
                  <td
                    colSpan={10}
                    className="px-6 py-16 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-10 h-10 mb-3 text-gray-300" />
                      <p className="text-base font-semibold text-gray-700">Data siswa tidak ditemukan</p>
                      <p className="text-sm mt-1">Coba sesuaikan kata kunci atau filter pencarian Anda.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ==========================================
            UI PAGINATION (KONTROL HALAMAN)
            ========================================== */}
        {!isLoading && !errorMsg && filteredSiswa.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
            <p className="text-sm text-gray-600 font-medium">
              Menampilkan <span className="font-bold text-gray-900">{indexOfFirstItem + 1}</span> hingga <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, filteredSiswa.length)}</span> dari <span className="font-bold text-gray-900">{filteredSiswa.length}</span> data siswa
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
                Halaman {currentPage} dari {totalPages}
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
      
      {/* Area Render Modal */}
      <ModalHapusSiswa siswa={hapusSiswa as any} onClose={() => { setHapusSiswa(null); fetchSiswa(); }} />
      <ModalEditSiswa siswa={editSiswa as any} onClose={() => { setEditSiswa(null); fetchSiswa(); }} />
      <ModalDetailSiswa siswa={detailSiswa as any} onClose={() => setDetailSiswa(null)} />
      <ModalTambahSiswa isOpen={isModalTambahOpen} onClose={() => { setIsModalTambahOpen(false); fetchSiswa(); }} />
    </main>
  );
}