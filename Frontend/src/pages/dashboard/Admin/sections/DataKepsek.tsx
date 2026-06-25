import React, { useState, useEffect } from "react";
import ModalTambahKepsek from "../components/ModalTambahKepsek";
import ModalDetailKepsek from "../components/ModalDetailKepsek";
import ModalEditKepsek from "../components/ModalEditKepsek";
import ModalHapusKepsek from "../components/ModalHapusKepsek";
import {
  Menu,
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Loader2,
  ChevronLeft, // 🔥 Icon baru untuk pagination
  ChevronRight, // 🔥 Icon baru untuk pagination
} from "lucide-react";

// 1. Tipe Data Pimpinan
interface KepsekItem {
  id: string;
  nama: string;
  jk: "L" | "P";
  ijazah: string;
  tugas: string;
  noHp: string;
  foto: string;
  status: "Aktif" | "Non-Aktif";
  mulaiMenjabat: string | null;
  selesaiMenjabat: string | null;
  statusJabatan: "AKTIF" | "NON_AKTIF";
}

export default function DataKepsekContent({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [isModalTambahOpen, setIsModalTambahOpen] = useState(false);
  const [detailKepsek, setDetailKepsek] = useState<KepsekItem | null>(null);
  const [editKepsek, setEditKepsek] = useState<KepsekItem | null>(null);
  const [hapusKepsek, setHapusKepsek] = useState<KepsekItem | null>(null);

  // ==========================================
  // STATE UNTUK FETCH DATA API
  // ==========================================
  const [dataKepsek, setDataKepsek] = useState<KepsekItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // STATE BARU UNTUK PAGINATION
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 🔥 Atur jumlah baris per halaman di sini

  const formatTanggal = (tanggal?: string | null) => {
    if (!tanggal) return "-";
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatMasaJabatan = (item: KepsekItem) => {
    if (!item.mulaiMenjabat) return "-";
    const akhirJabatan =
      item.selesaiMenjabat || item.statusJabatan !== "AKTIF"
        ? formatTanggal(item.selesaiMenjabat)
        : "Sekarang";

    return `${formatTanggal(item.mulaiMenjabat)} - ${akhirJabatan}`;
  };

  const fetchKepsek = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://187.127.121.139:3000/api/kepsek", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        const mappedData: KepsekItem[] = result.data.map((user: any) => ({
          id: user.id_users,
          nama: user.kepala_sekolah?.nama_ks || user.username,
          jk:
            user.kepala_sekolah?.gender === "Wanita" ||
            user.kepala_sekolah?.gender === "P"
              ? "P"
              : "L",
          ijazah: user.kepala_sekolah?.pendidikan_tertinggi || "-",
          tugas: "Kepala Sekolah",
          noHp: user.kepala_sekolah?.no_hp || "-",
          foto: user.kepala_sekolah?.foto
            ? `http://187.127.121.139:3000/uploads/${user.kepala_sekolah.foto}`
            : "",
          status: user.is_active ? "Aktif" : "Non-Aktif",
          mulaiMenjabat: user.kepala_sekolah?.mulai_menjabat || null,
          selesaiMenjabat: user.kepala_sekolah?.selesai_menjabat || null,
          statusJabatan: user.kepala_sekolah?.status_jabatan || "AKTIF",
        }));

        setDataKepsek(mappedData);
      }
    } catch (error) {
      console.error("Gagal menarik data kepsek:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKepsek();
  }, []);

  // Kembalikan ke halaman 1 setiap kali admin mengetik di kotak pencarian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Fungsi Filter Pencarian (Terhubung ke State dataKepsek)
  const filteredKepsek = dataKepsek.filter(
    (item) =>
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tugas.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ==========================================
  // LOGIKA MATEMATIKA PAGINATION
  // ==========================================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // 🔥 Tabel HANYA akan me-render data yang sudah dipotong ini
  const currentItems = filteredKepsek.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredKepsek.length / itemsPerPage);

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-white p-6 md:p-10">
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
            Data Kepala Sekolah
          </h2>
        </div>
      </div>

      {/* Action Bar: Search & Tambah */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="cari nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
          />
        </div>

        {/* Tombol Tambah */}
        <button
          onClick={() => setIsModalTambahOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
        >
          Tambah <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-6 py-4 w-16 text-center">No</th>
                <th className="px-6 py-4 w-16 text-center">Foto</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4 text-center">Jenis Kelamin</th>
                <th className="px-6 py-4">Ijazah Tertinggi</th>
                <th className="px-6 py-4">Tugas yang Diampu</th>
                <th className="px-6 py-4">Masa Jabatan</th>
                <th className="px-6 py-4 text-center">Status Jabatan</th>
                <th className="px-6 py-4">No. HP</th>
                <th className="px-6 py-4 text-center">Status Akun</th>
                <th className="px-6 py-4 text-center w-24">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-black" />
                      <p>Memuat data kepala sekolah...</p>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                // 🔥 Looping sekarang menggunakan currentItems, bukan filteredKepsek
                currentItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4 text-center text-gray-500 font-medium">
                      {/* 🔥 Rumus agar nomor urut berlanjut di halaman berikutnya */}
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white overflow-hidden relative bg-gray-100 border border-gray-200 shadow-sm">
                        {item.foto ? (
                          <img
                            src={item.foto}
                            alt={item.nama}
                            className="w-full h-full object-cover"
                            // 🔥 Tips: Kalau gambar error/tidak ketemu, sembunyikan atau ganti ikon
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-extrabold text-gray-900">
                      {item.nama}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 font-medium">
                      {item.jk}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {item.ijazah}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {item.tugas}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {formatMasaJabatan(item)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                          item.statusJabatan === "AKTIF"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {item.statusJabatan === "AKTIF" ? "Aktif" : "Non-Aktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-blue-600">
                      {item.noHp}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                          item.status === "Aktif"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {item.status === "Aktif" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {item.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center relative">
                      <button
                        onClick={() => toggleDropdown(item.id)}
                        className="p-2 rounded-md hover:bg-gray-200 text-gray-500 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeDropdown === item.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveDropdown(null)}
                          ></div>
                          <div className="absolute right-8 top-10 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 animate-fade-in">
                            <button
                              onClick={() => {
                                setDetailKepsek(item);
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> Lihat Detail
                            </button>
                            <button
                              onClick={() => {
                                setEditKepsek(item);
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                              onClick={() => {
                                setHapusKepsek(item);
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
                    colSpan={11}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Data kepala sekolah belum tersedia di sistem.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ==========================================
            UI PAGINATION (KONTROL HALAMAN)
            ========================================== */}
        {!isLoading && filteredKepsek.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
            <p className="text-sm text-gray-600 font-medium">
              Menampilkan{" "}
              <span className="font-bold text-gray-900">
                {indexOfFirstItem + 1}
              </span>{" "}
              hingga{" "}
              <span className="font-bold text-gray-900">
                {Math.min(indexOfLastItem, filteredKepsek.length)}
              </span>{" "}
              dari{" "}
              <span className="font-bold text-gray-900">
                {filteredKepsek.length}
              </span>{" "}
              data
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white text-gray-700"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Render Semua Modal */}
      <ModalHapusKepsek
        kepsek={hapusKepsek}
        onRefresh={fetchKepsek}
        onClose={() => {
          setHapusKepsek(null);
          fetchKepsek();
        }}
      />
      <ModalEditKepsek
        kepsek={editKepsek}
        onRefresh={fetchKepsek}
        onClose={() => {
          setEditKepsek(null);
          fetchKepsek();
        }}
      />
      <ModalDetailKepsek
        kepsek={detailKepsek}
        onClose={() => setDetailKepsek(null)}
      />
      <ModalTambahKepsek
        isOpen={isModalTambahOpen}
        onRefresh={fetchKepsek}
        onClose={() => {
          setIsModalTambahOpen(false);
          fetchKepsek();
        }}
      />
    </main>
  );
}
