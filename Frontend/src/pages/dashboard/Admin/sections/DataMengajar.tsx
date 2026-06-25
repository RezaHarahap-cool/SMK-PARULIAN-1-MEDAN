import React, { useState, useEffect } from "react";
import { 
  Menu, AlertCircle, Loader2, BookOpen, Save, MoreVertical, Edit, Trash2, X, 
  ChevronLeft, ChevronRight // 🔥 Ditambahkan untuk ikon pagination
} from "lucide-react";
import Swal from "sweetalert2"; // 🔥 IMPORT SWEETALERT DI SINI

// ==========================================
// 1. DEFINISI TIPE DATA
// ==========================================
interface MengajarItem {
  id_mengajar: string;
  guru_id: string;
  mapel_id: string;
  kelas_id: string;
  total_pertemuan: number;
  guru: { nama_guru: string };
  mapel: { mapel: string };
  kelas: { nama_kelas: string };
  tahun_ajaran: { tahun: string; status: string };
  semester: { semester: string; status: string };
}

interface DropdownItem {
  id: string;
  nama: string;
}

export default function MengajarContent({ onMenuClick }: { onMenuClick: () => void }) {
  // State Data Master & Tabel
  const [dataMengajar, setDataMengajar] = useState<MengajarItem[]>([]);
  const [listGuru, setListGuru] = useState<DropdownItem[]>([]);
  const [listMapel, setListMapel] = useState<DropdownItem[]>([]);
  const [listKelas, setListKelas] = useState<DropdownItem[]>([]);

  // State UI
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // State Mode Edit
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    guru_id: "",
    mapel_id: "",
    kelas_id: "",
    total_pertemuan: 16,
  });

  // ==========================================
  // STATE BARU UNTUK PAGINATION
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 🔥 Menampilkan 5 baris per halaman

  // ==========================================
  // FUNGSI 1: AMBIL SEMUA DATA
  // ==========================================
  const fetchAllData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("Sesi telah habis. Silakan login kembali.");
        return;
      }

      const headers = { "Authorization": `Bearer ${token}` };

      const [resMengajar, resGuru, resMapel, resKelas] = await Promise.all([
        fetch("http://187.127.121.139:3000/api/mengajar", { headers }),
        fetch("http://187.127.121.139:3000/api/guru", { headers }),
        fetch("http://187.127.121.139:3000/api/mapel", { headers }),
        fetch("http://187.127.121.139:3000/api/kelas", { headers })
      ]);

      const [dataMengajarRes, guruRes, mapelRes, kelasRes] = await Promise.all([
        resMengajar.json(), resGuru.json(), resMapel.json(), resKelas.json()
      ]);

      if (dataMengajarRes.success) {
        setDataMengajar(dataMengajarRes.data);
      }
      
      if (guruRes.success && Array.isArray(guruRes.data)) {
        setListGuru(guruRes.data.map((g: any) => {
          const idTarget = g.guru ? g.guru.id_guru : g.id_guru;
          const namaTarget = g.guru ? g.guru.nama_guru : g.nama_guru;
          return { id: idTarget, nama: namaTarget || g.username || "Tanpa Nama" };
        }));
      }
      
      if (mapelRes.success && Array.isArray(mapelRes.data)) {
        setListMapel(mapelRes.data.map((m: any) => ({ id: m.id_mapel, nama: m.mapel })));
      }
      
      if (kelasRes.success && Array.isArray(kelasRes.data)) {
        setListKelas(kelasRes.data.map((k: any) => ({ id: k.id_kelas, nama: k.nama_kelas })));
      }
    } catch (error) {
      console.error("Gagal menarik data:", error);
      setErrorMsg("Kesalahan koneksi ke server database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ==========================================
  // LOGIKA MATEMATIKA PAGINATION
  // ==========================================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dataMengajar.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(dataMengajar.length / itemsPerPage);

  // ==========================================
  // FUNGSI 2: HANDLE FORM
  // ==========================================
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "total_pertemuan" ? parseInt(value) || 0 : value,
    }));
  };

  const resetForm = () => {
    setFormData({ guru_id: "", mapel_id: "", kelas_id: "", total_pertemuan: 16 });
    setEditId(null);
  };

  // ==========================================
  // FUNGSI 3: SIMPAN / UPDATE (POST & PUT)
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.guru_id || !formData.mapel_id || !formData.kelas_id) {
      Swal.fire("Perhatian!", "Mohon lengkapi pilihan Guru, Mata Pelajaran, dan Kelas!", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      
      const url = editId 
        ? `http://187.127.121.139:3000/api/mengajar/${editId}` 
        : "http://187.127.121.139:3000/api/mengajar";
        
      const method = editId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // 🔥 SWEETALERT SUKSES SIMPAN
        Swal.fire({
          title: "Berhasil!",
          text: `Tugas mengajar berhasil ${editId ? "diperbarui" : "ditambahkan"}.`,
          icon: "success",
          confirmButtonColor: "#000000"
        });
        resetForm();
        fetchAllData(); 
      } else {
        Swal.fire("Gagal!", result.message || "Gagal menyimpan data.", "error");
      }
    } catch (error) {
      console.error("Gagal submit:", error);
      Swal.fire("Error!", "Terjadi kesalahan jaringan.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // FUNGSI 4: HAPUS DATA (DELETE)
  // ==========================================
  const handleDelete = async (id: string) => {
    // 🔥 SWEETALERT KONFIRMASI HAPUS
    const resultAlert = await Swal.fire({
      title: "Hapus Data?",
      text: "Apakah Anda yakin ingin menghapus data tugas ini secara permanen?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#e5e7eb",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "<span style='color: black'>Batal</span>"
    });

    if (!resultAlert.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://187.127.121.139:3000/api/mengajar/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          title: "Terhapus!",
          text: "Data berhasil dihapus.",
          icon: "success",
          confirmButtonColor: "#000000"
        });
        fetchAllData(); // Refresh tabel
        
        // Jika data yang sedang diedit ternyata dihapus, reset formnya
        if (editId === id) resetForm();
      } else {
        Swal.fire("Gagal!", result.message || "Gagal menghapus data.", "error");
      }
    } catch (error) {
      console.error("Error delete:", error);
      Swal.fire("Error!", "Terjadi kesalahan jaringan saat menghapus data.", "error");
    }
  };

  // ==========================================
  // FUNGSI 5: SETEL KE MODE EDIT
  // ==========================================
  const handleEditClick = (item: MengajarItem) => {
    setEditId(item.id_mengajar);
    setFormData({
      guru_id: item.guru_id || "",
      mapel_id: item.mapel_id || "",
      kelas_id: item.kelas_id || "",
      total_pertemuan: item.total_pertemuan || 16,
    });
    setActiveDropdown(null);
  };

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-gray-50 p-6 md:p-10">
      
      {/* HEADER SECTION */}
      <div className="flex items-center gap-4 mb-6">
        <button className="lg:hidden p-2 bg-white rounded-lg shadow-sm" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">
            Pembagian Jadwal & Tugas Guru per Kelas
          </h2>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 font-bold text-sm">
          {errorMsg}
        </div>
      )}

      {/* Tampilan Split View (Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* BAGIAN KIRI: FORM INPUT TUGAS */}
        <div className="lg:col-span-1">
          <div className={`bg-white p-6 rounded-2xl border shadow-sm sticky top-6 transition-colors ${editId ? "border-blue-400 shadow-blue-100" : "border-gray-200"}`}>
            <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-4">
              <div className={`p-2 rounded-lg ${editId ? "bg-blue-600" : "bg-blue-100"}`}>
                {editId ? <Edit className="w-5 h-5 text-white" /> : <BookOpen className="w-5 h-5 text-blue-600" />}
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                {editId ? "Edit Tugas Mengajar" : "Form Tugas Baru"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Guru Pengajar</label>
                <select name="guru_id" value={formData.guru_id} onChange={handleInputChange} className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none">
                  <option value="">-- Pilih Guru --</option>
                  {listGuru.map((g, idx) => (<option key={g.id || `guru-${idx}`} value={g.id}>{g.nama}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mata Pelajaran</label>
                <select name="mapel_id" value={formData.mapel_id} onChange={handleInputChange} className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none">
                  <option value="">-- Pilih Mapel --</option>
                  {listMapel.map((m, idx) => (<option key={m.id || `mapel-${idx}`} value={m.id}>{m.nama}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Kelas Tujuan</label>
                <select name="kelas_id" value={formData.kelas_id} onChange={handleInputChange} className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none">
                  <option value="">-- Pilih Kelas --</option>
                  {listKelas.map((k, idx) => (<option key={k.id || `kelas-${idx}`} value={k.id}>{k.nama}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Target Pertemuan (1 Semester)</label>
                <input type="number" name="total_pertemuan" value={formData.total_pertemuan} onChange={handleInputChange} min="1" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none bg-gray-50"/>
              </div>

              <div className="pt-2 flex gap-2">
                {/* Tombol Batal Muncul Jika Mode Edit */}
                {editId && (
                  <button type="button" onClick={resetForm} className="w-1/3 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-1 hover:bg-gray-200 transition-all">
                    <X className="w-4 h-4" /> Batal
                  </button>
                )}
                
                <button type="submit" disabled={isSubmitting || isLoading} className={`flex-1 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:bg-gray-400 ${editId ? "bg-blue-600 hover:bg-blue-700" : "bg-black hover:bg-gray-800"}`}>
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {isSubmitting ? "Menyimpan..." : (editId ? "Update Tugas" : "Simpan Tugas")}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* BAGIAN KANAN: TABEL DAFTAR MENGAJAR */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-5">Daftar Plotting Aktif</h3>

            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                <span className="text-gray-500 font-medium">Memuat data plotting...</span>
              </div>
            ) : (
              <>
                <div className="border border-gray-200 rounded-xl overflow-x-auto bg-white flex-1"> 
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-bold">
                      <tr>
                        <th className="px-5 py-4 w-12 text-center">No</th>
                        <th className="px-5 py-4">Nama Guru</th>
                        <th className="px-5 py-4">Mata Pelajaran</th>
                        <th className="px-5 py-4">Kelas</th>
                        <th className="px-5 py-4">Tahun Ajaran</th>
                        <th className="px-5 py-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dataMengajar.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">
                            Belum ada tugas mengajar yang diplot.
                          </td>
                        </tr>
                      ) : (
                        // 🔥 MAP MENGGUNAKAN currentItems BUKAN dataMengajar
                        currentItems.map((item, index) => (
                          <tr key={item.id_mengajar || index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-4 text-center font-bold text-gray-900">
                              {indexOfFirstItem + index + 1}
                            </td>
                            <td className="px-5 py-4 font-bold text-blue-700">{item.guru?.nama_guru || "N/A"}</td>
                            
                            <td className="px-5 py-4 font-medium text-gray-800 max-w-[200px] truncate" title={item.mapel?.mapel}>
                              {item.mapel?.mapel || "N/A"}
                            </td>
                            
                            <td className="px-5 py-4 font-bold text-gray-900">{item.kelas?.nama_kelas || "N/A"}</td>
                            
                            <td className="px-5 py-4">
                              <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-bold">
                                {item.tahun_ajaran?.tahun || "N/A"}
                              </span>
                            </td>
                            
                            {/* KOLOM AKSI */}
                            <td className="px-5 py-4 text-center relative">
                              <button
                                onClick={() => setActiveDropdown(activeDropdown === item.id_mengajar ? null : item.id_mengajar)}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors inline-flex justify-center items-center"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {/* Menu Dropdown Floating */}
                              {activeDropdown === item.id_mengajar && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                                  <div className="absolute right-12 top-10 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-20 animate-fade-in">
                                    <button
                                      onClick={() => handleEditClick(item)}
                                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                                    >
                                      <Edit className="w-4 h-4" /> Edit Tugas
                                    </button>
                                    
                                    <div className="border-t border-gray-100 my-1"></div>
                                    
                                    <button
                                      onClick={() => {
                                        setActiveDropdown(null);
                                        handleDelete(item.id_mengajar);
                                      }}
                                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" /> Hapus
                                    </button>
                                  </div>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ==========================================
                    UI PAGINATION
                    ========================================== */}
                {dataMengajar.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500 font-medium">
                      Menampilkan <span className="text-gray-900 font-bold">{indexOfFirstItem + 1}</span> - <span className="text-gray-900 font-bold">{Math.min(indexOfLastItem, dataMengajar.length)}</span> dari <span className="text-gray-900 font-bold">{dataMengajar.length}</span> plot
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-700 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-bold text-gray-800 px-2">
                        Hal {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-700 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}