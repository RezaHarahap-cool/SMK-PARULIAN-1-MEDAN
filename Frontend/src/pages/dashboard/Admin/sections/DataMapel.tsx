import React, { useState, useEffect } from "react";
import ModalTambahMapel from "../components/ModalTambahMapel";
import ModalEditMapel from "../components/ModalEditMapel";
import ModalHapusMapel from "../components/ModalHapusMapel";
import { 
  Menu, Search, Plus, MoreVertical, Edit, Trash2, Loader2, ChevronDown, ChevronLeft, ChevronRight 
} from "lucide-react";

type KelompokMapel = "UMUM" | "MULOK" | "KEJURUAN";

const kelompokLabels: Record<KelompokMapel, string> = {
  UMUM: "Umum",
  MULOK: "Muatan Lokal",
  KEJURUAN: "Kejuruan",
};

const kelompokBadgeClass: Record<KelompokMapel, string> = {
  UMUM: "bg-blue-50 text-blue-700",
  MULOK: "bg-emerald-50 text-emerald-700",
  KEJURUAN: "bg-amber-50 text-amber-700",
};

// 🔥 1. Tipe Data diperbarui sesuai respon Database
interface MapelItem {
  id: string;
  nama: string;
  kelompok: KelompokMapel; 
}

export default function DataMapelContent({ onMenuClick }: { onMenuClick: () => void; }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKelompok, setFilterKelompok] = useState("Semua");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const [isModalTambahOpen, setIsModalTambahOpen] = useState(false);
  const [editMapel, setEditMapel] = useState<MapelItem | null>(null);
  const [hapusMapel, setHapusMapel] = useState<MapelItem | null>(null);

  const [dataMapel, setDataMapel] = useState<MapelItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  const fetchMapel = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://187.127.121.139:3000/api/mapel", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.success) {
        // 🔥 2. Ambil data kelompok langsung dari item.kelompok
        const mappedData: MapelItem[] = result.data.map((item: any) => ({
          id: item.id_mapel, 
          nama: item.mapel,  
          kelompok: item.kelompok 
        }));
        setDataMapel(mappedData);
      }
    } catch (error) {
      console.error("Gagal menarik data mata pelajaran:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMapel();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterKelompok]);

  const filteredMapel = dataMapel.filter((item) => {
    const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKelompok = filterKelompok === "Semua" || item.kelompok === filterKelompok;
    return matchSearch && matchKelompok;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMapel.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMapel.length / itemsPerPage);

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-white p-6 md:p-10">
      <div className="flex items-center gap-4 mb-8 lg:mb-10">
        <button className="lg:hidden p-2 bg-gray-100 rounded-lg" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">Data Mata Pelajaran</h2>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input type="text" placeholder="cari mata pelajaran..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all" />
          </div>

          <div className="relative w-full sm:w-44">
            <select value={filterKelompok} onChange={(e) => setFilterKelompok(e.target.value)} className="w-full appearance-none px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black cursor-pointer">
              <option value="Semua">Semua Kelompok</option>
              {/* 🔥 Pastikan valuenya sama persis dengan Enum Prisma */}
              <option value="UMUM">Umum</option>
              <option value="MULOK">Muatan Lokal</option>
              <option value="KEJURUAN">Kejuruan</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <button onClick={() => setIsModalTambahOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-sm cursor-pointer">
          Tambah <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-6 py-4 w-20 text-center">No</th>
                <th className="px-6 py-4">Mata Pelajaran</th>
                <th className="px-6 py-4">Kelompok</th>
                <th className="px-6 py-4 text-center w-24">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-black" />
                      <p>Memuat data mata pelajaran...</p>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-center text-gray-500 font-bold">{indexOfFirstItem + index + 1}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{item.nama}</td>
                    <td className="px-6 py-4">
                      {/* 🔥 Logika UI sederhana untuk Badge */}
                      <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${
                        kelompokBadgeClass[item.kelompok] || "bg-gray-50 text-gray-700"
                      }`}>
                        {kelompokLabels[item.kelompok] || item.kelompok}
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
                            <button onClick={() => { setEditMapel(item); setActiveDropdown(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button onClick={() => { setHapusMapel(item); setActiveDropdown(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer">
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
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">Mata pelajaran tidak ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredMapel.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
            <p className="text-sm text-gray-600 font-medium">
              Menampilkan <span className="font-bold text-gray-900">{indexOfFirstItem + 1}</span> hingga <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, filteredMapel.length)}</span> dari <span className="font-bold text-gray-900">{filteredMapel.length}</span> data
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white text-gray-700">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-4 py-2 text-sm font-bold text-gray-800">Halaman {currentPage} dari {totalPages}</div>
              <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white text-gray-700">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <ModalHapusMapel mapel={hapusMapel} onClose={() => setHapusMapel(null)} onRefresh={fetchMapel} />
      <ModalEditMapel mapel={editMapel} onClose={() => setEditMapel(null)} onRefresh={fetchMapel} />
      <ModalTambahMapel isOpen={isModalTambahOpen} onClose={() => setIsModalTambahOpen(false)} onRefresh={fetchMapel} />
    </main>
  );
}
