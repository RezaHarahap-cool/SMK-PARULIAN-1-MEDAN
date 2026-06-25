import React, { useState, useEffect } from "react";
import ModalTambahJurusan from "../components/ModalTambahJurusan";
import ModalEditJurusan from "../components/ModalEditJurusan";
import ModalHapusJurusan from "../components/ModalHapusJurusan";
import { 
  Menu, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Loader2,
  ChevronLeft, // 🔥 Icon pagination
  ChevronRight // 🔥 Icon pagination
} from "lucide-react";

// 1. Tipe Data Jurusan
interface JurusanItem {
  id: string;
  nama: string;
  status: "Aktif" | "Non-Aktif";
}

export default function DataJurusanContent({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  // State Dropdown dan Modal
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isModalTambahOpen, setIsModalTambahOpen] = useState(false);
  const [editJurusan, setEditJurusan] = useState<JurusanItem | null>(null);
  const [hapusJurusan, setHapusJurusan] = useState<JurusanItem | null>(null);

  // State untuk Data API
  const [dataJurusan, setDataJurusan] = useState<JurusanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // STATE BARU UNTUK PAGINATION
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 🔥 Atur jumlah baris per halaman

  // Tarik Data dari API Backend
  const fetchJurusan = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://187.127.121.139:3000/api/jurusan", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        const mappedData: JurusanItem[] = result.data.map((item: any) => ({
          id: item.id_jurusan,
          nama: item.jurusan,
          status: item.status === "AKTIF" ? "Aktif" : "Non-Aktif" 
        }));

        setDataJurusan(mappedData);
      }
    } catch (error) {
      console.error("Gagal menarik data jurusan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJurusan();
  }, []);

  // ==========================================
  // LOGIKA MATEMATIKA PAGINATION
  // ==========================================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // 🔥 Tabel HANYA akan me-render potongan data ini
  const currentItems = dataJurusan.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(dataJurusan.length / itemsPerPage);

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-white p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 lg:mb-10">
        <button className="lg:hidden p-2 bg-gray-100 rounded-lg" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">Data Jurusan</h2>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsModalTambahOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
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
                <th className="px-6 py-4 w-16 text-center">No</th>
                <th className="px-6 py-4">Jurusan</th>
                <th className="px-6 py-4 text-center w-32">Status</th>
                <th className="px-6 py-4 text-center w-24">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-black" />
                      <p>Memuat data jurusan...</p>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                // 🔥 Looping sekarang menggunakan currentItems
                currentItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-center text-gray-900 font-bold">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium">{item.nama}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-4 py-1.5 rounded-md text-xs font-bold text-white shadow-sm ${
                          item.status === "Aktif" ? "bg-[#10b981]" : "bg-[#ef4444]"
                        }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center relative">
                      <button onClick={() => toggleDropdown(item.id)} className="p-2 rounded-md hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {activeDropdown === item.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                          <div className="absolute right-8 top-10 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 animate-fade-in">
                            <button onClick={() => { setEditJurusan(item); setActiveDropdown(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button onClick={() => { setHapusJurusan(item); setActiveDropdown(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer">
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
                    Data jurusan belum ada di dalam sistem.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* UI PAGINATION */}
        {!isLoading && dataJurusan.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
            <p className="text-sm text-gray-600 font-medium">
              Menampilkan <span className="font-bold text-gray-900">{indexOfFirstItem + 1}</span> hingga <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, dataJurusan.length)}</span> dari <span className="font-bold text-gray-900">{dataJurusan.length}</span> data
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors bg-white text-gray-700">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-4 py-2 text-sm font-bold text-gray-800">
                Halaman {currentPage} dari {totalPages}
              </div>
              <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors bg-white text-gray-700">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Modals dengan Kabel Refresh */}
      <ModalHapusJurusan jurusan={hapusJurusan} onRefresh={fetchJurusan} onClose={() => { setHapusJurusan(null); fetchJurusan(); }} />
      <ModalEditJurusan jurusan={editJurusan} onRefresh={fetchJurusan} onClose={() => { setEditJurusan(null); fetchJurusan(); }} />
      <ModalTambahJurusan isOpen={isModalTambahOpen} onRefresh={fetchJurusan} onClose={() => { setIsModalTambahOpen(false); fetchJurusan(); }} />
    </main>
  );
}