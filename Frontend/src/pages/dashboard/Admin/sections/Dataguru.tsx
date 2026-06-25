import React, { useState, useEffect } from "react";
import ModalTambahGuru from "../components/ModalTambahGuru";
import ModalDetailGuru from "../components/ModalDetailGuru";
import ModalEditGuru from "../components/ModalEditGuru";
import ModalHapusGuru from "../components/ModalHapusGuru";
import {
  Menu,
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
  Loader2,
  ChevronLeft, // 🔥 Icon baru untuk pagination
  ChevronRight // 🔥 Icon baru untuk pagination
} from "lucide-react";

// 1. Tipe Data Guru
interface GuruItem {
  id: string;
  nama: string;
  jk: "L" | "P";
  ijazah: string;
  mapel: string;
  noHp: string;
  foto: string;
}

export default function DataGuruContent({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailGuru, setDetailGuru] = useState<GuruItem | null>(null);
  const [editGuru, setEditGuru] = useState<GuruItem | null>(null);
  const [hapusGuru, setHapusGuru] = useState<GuruItem | null>(null);

  const [dataGuru, setDataGuru] = useState<GuruItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // STATE BARU UNTUK PAGINATION
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 🔥 Atur jumlah baris per halaman di sini

  const fetchGuru = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://187.127.121.139:3000/api/guru", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        const mappedData: GuruItem[] = result.data.map((user: any) => ({
          id: user.id_users,
          nama: user.guru?.nama_guru || user.username, 
          jk: user.guru?.gender === "Wanita" ? "P" : "L", 
          ijazah: user.guru?.pendidikan_tertinggi || "-",
          mapel: user.guru?.mata_pelajaran?.mapel || "Belum ada mapel",
          noHp: user.guru?.no_hp || "-",
          foto: user.guru?.foto ? `http://187.127.121.139:3000/uploads/${user.guru.foto}` : "",
        }));

        setDataGuru(mappedData);
      }
    } catch (error) {
      console.error("Gagal menarik data guru:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuru();
  }, []);

  // Kembalikan ke halaman 1 setiap kali admin mengetik di kotak pencarian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Fungsi Filter Pencarian
  const filteredGuru = dataGuru.filter(
    (guru) =>
      guru.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guru.mapel.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ==========================================
  // LOGIKA MATEMATIKA PAGINATION
  // ==========================================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // 🔥 Tabel HANYA akan me-render data yang sudah dipotong ini
  const currentItems = filteredGuru.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredGuru.length / itemsPerPage);

  const toggleDropdown = (id: string) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id); 
    }
  };

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-white p-6 md:p-10">
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
            Data Guru
          </h2>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="cari guru atau mapel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
        >
          Tambah <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-6 py-4 w-16 text-center">No</th>
                <th className="px-6 py-4">Foto</th>
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4 text-center">Jenis Kelamin</th>
                <th className="px-6 py-4 text-center">Ijazah Tertinggi</th>
                <th className="px-6 py-4">Mapel</th>
                <th className="px-6 py-4">No.Hp</th>
                <th className="px-6 py-4 text-center w-24">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-black" />
                      <p>Memuat data dari database...</p>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                // 🔥 Looping sekarang menggunakan currentItems, BUKAN filteredGuru
                currentItems.map((guru, index) => (
                  <tr
                    key={guru.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4 text-center text-gray-500 font-medium">
                      {/* Rumus agar nomor urut tidak kembali ke 1 di halaman 2 */}
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded flex items-center justify-center text-white overflow-hidden relative bg-gray-100 border border-gray-200">
                        {guru.foto ? (
                          <img
                            src={guru.foto}
                            alt={guru.nama}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {guru.nama}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {guru.jk}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {guru.ijazah}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{guru.mapel}</td>
                    <td className="px-6 py-4 text-gray-600">{guru.noHp}</td>

                    <td className="px-6 py-4 text-center relative">
                      <button
                        onClick={() => toggleDropdown(guru.id)}
                        className="p-2 rounded-md hover:bg-gray-200 text-gray-500 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeDropdown === guru.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveDropdown(null)}
                          ></div>

                          <div className="absolute right-8 top-10 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 animate-fade-in">
                            <button
                              onClick={() => {
                                setDetailGuru(guru);
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="w-3.5 h-3.5" /> Lihat Detail
                            </button>
                            <button
                              onClick={() => {
                                setEditGuru(guru);
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                              onClick={() => {
                                setHapusGuru(guru);
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
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                    Data guru tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ==========================================
            UI PAGINATION (KONTROL HALAMAN)
            ========================================== */}
        {!isLoading && filteredGuru.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
            <p className="text-sm text-gray-600 font-medium">
              Menampilkan <span className="font-bold text-gray-900">{indexOfFirstItem + 1}</span> hingga <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, filteredGuru.length)}</span> dari <span className="font-bold text-gray-900">{filteredGuru.length}</span> data
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
      
      {/* Komponen Modal */}
      <ModalHapusGuru 
        guru={hapusGuru} 
        onClose={() => setHapusGuru(null)} 
        onRefresh={fetchGuru}
      />
      <ModalEditGuru 
        guru={editGuru} 
        onClose={() => setEditGuru(null)} 
        onRefresh={fetchGuru}
      />
      <ModalDetailGuru 
        guru={detailGuru} 
        onClose={() => setDetailGuru(null)} 
      />
      <ModalTambahGuru
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchGuru}
      />
    </main>
  );
}