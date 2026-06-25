import React, { useState, useEffect } from "react";
import ModalTambahBerita from "../components/ModalTambahBerita";
import ModalDetailBerita from "../components/ModalDetailBerita";
import ModalEditBerita from "../components/ModalEditBerita";
import ModalHapusBerita from "../components/ModalHapusBerita";
import { apiUrl, uploadUrl } from "../../../../lib/api";
import {
  Menu,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  ImageIcon,
  Loader2,
  Eye // 🔥 Tambahan icon Eye untuk Detail
} from "lucide-react";

// 1. Tipe Data Berita
export interface BeritaItem {
  id_berita: string;
  judul: string;
  jenis_berita: string; 
  tanggal_publikasi: string;
  content: string;
  foto?: string | null; 
  admin?: {
    nama_admin: string;
  };
}

export default function DataBeritaContent({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  // State Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");

  // State Dropdown & Modals
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [detailBerita, setDetailBerita] = useState<BeritaItem | null>(null);
  const [isModalTambahOpen, setIsModalTambahOpen] = useState(false);
  const [editBerita, setEditBerita] = useState<BeritaItem | null>(null);
  const [hapusBerita, setHapusBerita] = useState<BeritaItem | null>(null);

  // State API Data
  const [dataBerita, setDataBerita] = useState<BeritaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Fungsi Tarik Data dari Backend
  const fetchBerita = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(apiUrl("/api/berita"), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await response.json();

      if (result.success) {
        setDataBerita(result.data);
      } else {
        setErrorMsg(result.message || "Gagal memuat berita.");
      }
    } catch (error) {
      console.error("Gagal menarik data:", error);
      setErrorMsg("Tidak dapat terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBerita();
  }, []);

  // Format Tanggal
  const formatTanggal = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Logika Filter Berlapis
  const filteredBerita = dataBerita.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    const matchSearch =
      item.judul.toLowerCase().includes(searchLower) ||
      item.content.toLowerCase().includes(searchLower);
    
    const matchKategori =
      filterKategori === "Semua" || item.jenis_berita === filterKategori;

    return matchSearch && matchKategori;
  });

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const openDetail = (item: BeritaItem) => {
    setDetailBerita(item);
    setActiveDropdown(null);
  };

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-gray-50 p-6 md:p-10 custom-scrollbar">
      {/* Header Content */}
      <div className="flex items-center gap-4 mb-8 lg:mb-10">
        <button
          className="lg:hidden p-2 bg-white rounded-lg shadow-sm cursor-pointer"
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">
            Manajemen Berita
          </h2>
        </div>
      </div>

      {/* Action Bar (Search & Filter/Tambah) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        {/* Kiri: Search Bar */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari judul atau isi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all shadow-sm"
          />
        </div>

        {/* Kanan: Dropdown Kategori & Tombol Tambah */}
        <div className="flex flex-row items-center gap-3 w-full md:w-auto">
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="w-full md:w-48 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black cursor-pointer shadow-sm"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Pengumuman">Pengumuman</option>
            <option value="Kegiatan_Prestasi">Kegiatan & Prestasi</option>
            <option value="Akademik">Akademik</option>
          </select>

          <button
            onClick={() => setIsModalTambahOpen(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
          >
            Tulis Baru <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tampilan Status Loading & Error */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-black mb-3" />
          <p className="text-gray-500 font-medium">Memuat portal berita...</p>
        </div>
      ) : errorMsg ? (
        <div className="flex flex-col items-center justify-center py-20 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-500 font-bold mb-1">Terjadi Kesalahan</p>
          <p className="text-sm text-red-400">{errorMsg}</p>
        </div>
      ) : (
        /* Kontainer Grid Card Berita */
        filteredBerita.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
            {filteredBerita.map((item) => (
              <div
                key={item.id_berita}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col relative group"
              >
                {/* Thumbnail Gambar */}
                <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center border-b border-gray-100">
                  {item.foto ? (
                    <img
                      src={uploadUrl(item.foto)}
                      onError={(e) => { e.currentTarget.src = "/general_profil.png"; }}
                      alt={item.judul}
                      onClick={() => openDetail(item)}
                      className="w-full h-full object-cover cursor-pointer"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-300">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-xs font-medium">Tanpa Sampul</span>
                    </div>
                  )}

                  {/* Tombol Titik Tiga (Absolute) */}
                  <button
                    onClick={() => toggleDropdown(item.id_berita)}
                    className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur-sm rounded-md shadow hover:bg-white text-gray-600 transition-colors cursor-pointer z-10"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {/* Dropdown Menu Popup di dalam card */}
                  {activeDropdown === item.id_berita && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setActiveDropdown(null)}
                      ></div>
                      <div className="absolute top-12 right-3 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 animate-fade-in">
                        
                        {/* 🔥 TOMBOL DETAIL DITAMBAHKAN DI SINI */}
                        <button
                          onClick={() => openDetail(item)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>

                        {/* TOMBOL EDIT */}
                        <button
                          onClick={() => {
                            setEditBerita(item);
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        
                        {/* TOMBOL HAPUS */}
                        <button
                          onClick={() => {
                            setHapusBerita(item);
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Konten Teks Bawah */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      {item.jenis_berita.replace('_', ' ')}
                    </p>
                    <p className="text-[11px] font-medium text-gray-400">
                      {formatTanggal(item.tanggal_publikasi)}
                    </p>
                  </div>

                  <h3
                    onClick={() => openDetail(item)}
                    className="text-lg font-bold text-gray-900 leading-snug mb-3 line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors"
                  >
                    {item.judul}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-3 mb-6">
                    {item.content}
                  </p>

                  {/* Footer Card */}
                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-xs text-gray-400 font-medium">Oleh: {item.admin?.nama_admin || "Admin"}</p>
                    <button
                      type="button"
                      onClick={() => openDetail(item)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* State Kosong */
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
            <Search className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-base font-medium text-gray-600">
              Belum ada berita dipublikasikan
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Buat berita baru atau sesuaikan filter pencarian Anda.
            </p>
          </div>
        )
      )}

      {/* Modals dengan kabel onRefresh terpasang */}
      <ModalHapusBerita 
        berita={hapusBerita as any} 
        onClose={() => setHapusBerita(null)} 
        onRefresh={fetchBerita} 
      />
      <ModalEditBerita 
        berita={editBerita as any} 
        onClose={() => setEditBerita(null)} 
        onRefresh={fetchBerita} 
      />
      <ModalTambahBerita 
        isOpen={isModalTambahOpen} 
        onClose={() => setIsModalTambahOpen(false)} 
        onRefresh={fetchBerita} 
      />
      
      {/* 🔥 Modal Detail siap menerima trigger */}
      <ModalDetailBerita 
        berita={detailBerita as any} 
        onClose={() => setDetailBerita(null)} 
      />
    </main>
  );
}
