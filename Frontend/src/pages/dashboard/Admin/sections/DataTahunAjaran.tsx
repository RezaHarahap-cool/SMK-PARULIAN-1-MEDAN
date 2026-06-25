import React, { useState, useEffect } from "react";
import ModalTambahTahun from "../components/ModalTambahTahun";
import ModalEditTahun from "../components/ModalEditTahun";
import ModalHapusTahun from "../components/ModalHapusTahun";
import { 
  Menu, Plus, MoreVertical, Edit, Trash2, Loader2,
  ChevronLeft, ChevronRight // 🔥 Import Icon Pagination
} from "lucide-react";

// 1. Tipe Data Tahun Ajaran
interface TahunAjaranItem {
  id: string;
  tahun: string;
  status: "Aktif" | "Nonaktif";
}

export default function DataTahunAjaranContent({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // State untuk Modals
  const [isModalTambahOpen, setIsModalTambahOpen] = useState(false);
  const [editTahun, setEditTahun] = useState<TahunAjaranItem | null>(null);
  const [hapusTahun, setHapusTahun] = useState<TahunAjaranItem | null>(null);

  // State untuk Data API
  const [dataTahunAjaran, setDataTahunAjaran] = useState<TahunAjaranItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // STATE BARU UNTUK PAGINATION
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 🔥 Tampilkan 5 baris per halaman

  // ==========================================
  // FUNGSI FETCH DIKELUARKAN DARI USEEFFECT
  // ==========================================
  const fetchTahunAjaran = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://187.127.121.139:3000/api/tahun-ajaran", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        const mappedData: TahunAjaranItem[] = result.data.map((item: any) => ({
          id: item.id_tahun_ajaran,
          tahun: item.tahun,
          status: item.status === "AKTIF" ? "Aktif" : "Nonaktif"
        }));

        setDataTahunAjaran(mappedData);
      }
    } catch (error) {
      console.error("Gagal menarik data tahun ajaran:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTahunAjaran();
  }, []);

  // ==========================================
  // LOGIKA MATEMATIKA PAGINATION
  // ==========================================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dataTahunAjaran.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(dataTahunAjaran.length / itemsPerPage);

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-white p-6 md:p-10">
      {/* Header Content */}
      <div className="flex items-center gap-4 mb-8 lg:mb-10">
        <button
          className="lg:hidden p-2 bg-gray-100 rounded-lg cursor-pointer"
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">
            Tahun Ajaran
          </h2>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsModalTambahOpen(true)}
          className="flex items-center justify-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
        >
          Tambah <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-6 py-4 w-20">No</th>
                <th className="px-6 py-4 text-center">Tahun Ajaran</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center w-24">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-black" />
                      <p>Memuat data tahun ajaran...</p>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                // 🔥 LOOPING MENGGUNAKAN currentItems
                currentItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    {/* Kolom No Dinamis */}
                    <td className="px-6 py-4 text-black font-extrabold">
                      {indexOfFirstItem + index + 1}
                    </td>

                    <td className="px-6 py-4 text-center text-gray-800 font-medium">
                      {item.tahun}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-4 py-1.5 rounded-md text-xs font-bold text-white shadow-sm
                          ${
                            item.status === "Aktif"
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-red-500 hover:bg-red-600"
                          }
                        `}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center relative">
                      <button
                        onClick={() => toggleDropdown(item.id)}
                        className="p-2 rounded-md hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeDropdown === item.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveDropdown(null)}
                          ></div>
                          <div className="absolute right-8 top-10 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 animate-fade-in">
                            <button
                              onClick={() => {
                                setEditTahun(item);
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                              onClick={() => {
                                setHapusTahun(item);
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
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    Data tahun ajaran belum tersedia di sistem.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ==========================================
            UI PAGINATION KONTROL
            ========================================== */}
        {!isLoading && dataTahunAjaran.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
            <p className="text-sm text-gray-600 font-medium">
              Menampilkan <span className="font-bold text-gray-900">{indexOfFirstItem + 1}</span> hingga <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, dataTahunAjaran.length)}</span> dari <span className="font-bold text-gray-900">{dataTahunAjaran.length}</span> data
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

      {/* 🔥 MODALS DENGAN KABEL ONREFRESH */}
      <ModalHapusTahun
        tahunAjaran={hapusTahun}
        onClose={() => setHapusTahun(null)}
        onRefresh={fetchTahunAjaran} 
      />
      <ModalEditTahun
        tahunAjaran={editTahun}
        onClose={() => setEditTahun(null)}
        onRefresh={fetchTahunAjaran} 
      />
      <ModalTambahTahun
        isOpen={isModalTambahOpen}
        onClose={() => setIsModalTambahOpen(false)}
        onRefresh={fetchTahunAjaran} 
      />
    </main>
  );
}