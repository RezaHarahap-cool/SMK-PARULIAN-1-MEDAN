import React, { useState, useEffect } from "react";
import { 
  Menu, Search, MoreVertical, Eye, Edit, Trash2, Loader2
} from "lucide-react";
import ModalDetailSiswa from "../components/ModalDetailSiswa";
import ModalEditSiswa from "../components/ModalEditSiswa";
import ModalHapusSiswa from "../components/ModalHapusSiswa";

// 1. Tipe Data Alumni (Sesuai dengan response Backend)
interface AlumniItem {
  id_siswa: string;
  nis: string;
  nama_siswa: string;
  gender: string;
  status_siswa: string;
  no_hp_wali: string;
  riwayat_kelas?: Array<{
    kelas?: {
      nama_kelas: string;
      jurusan?: { jurusan: string };
    };
    tahun_ajaran?: { tahun: string };
  }>;
}

export default function DataAlumniContent({ onMenuClick }: { onMenuClick: () => void }) {
  // State Pencarian
  const [searchQuery, setSearchQuery] = useState("");
  
  // State Data dari API
  const [dataAlumni, setDataAlumni] = useState<AlumniItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // State Dropdown Aksi (Titik Tiga)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [detailAlumni, setDetailAlumni] = useState<any | null>(null);
  const [editAlumni, setEditAlumni] = useState<any | null>(null);
  const [hapusAlumni, setHapusAlumni] = useState<any | null>(null);

  // 2. Tarik Data Alumni dari API saat halaman dimuat
  useEffect(() => {
    const fetchAlumni = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://187.127.121.139:3000/api/alumni", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();

        if (result.success) {
          setDataAlumni(result.data);
        } else {
          setDataAlumni([]);
        }
      } catch (error) {
        console.error("Gagal menarik data alumni:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlumni();
  }, []);

  // 3. Logika Filter Pencarian
  const filteredAlumni = dataAlumni.filter((item) => {
    const nama = item.nama_siswa || "";
    const nis = item.nis || "";
    return nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
           nis.includes(searchQuery);
  });

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const toSiswaModalItem = (item: AlumniItem) => {
    const riwayat = item.riwayat_kelas?.[0];
    return {
      id: item.id_siswa,
      nis: item.nis || "-",
      nama: item.nama_siswa || "N/A",
      jk: item.gender === "Laki_laki" || item.gender === "Pria" ? "L" : "P",
      kelas: riwayat?.kelas?.nama_kelas || "Alumni",
      jurusan: riwayat?.kelas?.jurusan?.jurusan || "-",
      namaAyah: "-",
      noHpWali: item.no_hp_wali || "-",
      foto: "",
    };
  };

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-gray-50 p-6 md:p-10">
      
      {/* Header Content */}
      <div className="flex items-center gap-4 mb-8">
        <button className="lg:hidden p-2 bg-white rounded-lg shadow-sm cursor-pointer" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">Alumni</h2>
        </div>
      </div>

      {/* Action Bar (Hanya Search) */}
      <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-center gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari alumni atau NIS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto pb-24 min-h-[300px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            
            {/* Header Tabel */}
            <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-6 py-4 w-16 text-center">No</th>
                <th className="px-6 py-4">NIS</th>
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4 text-center">L/P</th>
                <th className="px-6 py-4 text-center">Jurusan</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">No.Hp Wali</th>
                <th className="px-6 py-4 text-center w-24">Aksi</th>
              </tr>
            </thead>

            {/* Body Tabel */}
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-black mb-2" />
                    <p className="text-gray-500 font-medium">Memuat data alumni...</p>
                  </td>
                </tr>
              ) : filteredAlumni.length > 0 ? (
                filteredAlumni.map((item, index) => {
                  
                  // BONGKAR DATA JURUSAN DARI RIWAYAT TERAKHIR (Super Aman TypeScript)
                  const riwayatAktif = (item.riwayat_kelas && item.riwayat_kelas.length > 0) 
                    ? item.riwayat_kelas[0] 
                    : null;
                  
                  const namaJurusan = riwayatAktif?.kelas?.jurusan?.jurusan || "-";

                  return (
                    <tr key={item.id_siswa} className="hover:bg-gray-50 transition-colors group">
                      
                      <td className="px-6 py-4 text-center text-gray-900 font-bold">
                        {index + 1}
                      </td>
                      
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {item.nis}
                      </td>

                      <td className="px-6 py-4 text-black font-extrabold">
                        {item.nama_siswa || "N/A"}
                      </td>

                      <td className="px-6 py-4 text-center font-medium text-gray-700">
                        {item.gender === "Laki_laki" || item.gender === "Pria" ? "L" : "P"}
                      </td>

                      <td className="px-6 py-4 text-center font-semibold text-gray-700">
                        {namaJurusan}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full text-xs">
                          {item.status_siswa || "Alumni"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {item.no_hp_wali}
                      </td>
                      
                      {/* Kolom Aksi (Dropdown Titik Tiga) */}
                      <td className="px-6 py-4 text-center relative">
                        <button 
                          onClick={() => toggleDropdown(item.id_siswa)}
                          className="p-2 rounded-md hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Dropdown Menu Popup Sesuai Wireframe */}
                        {activeDropdown === item.id_siswa && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                            <div className="absolute right-8 top-10 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 animate-fade-in">
                              <button 
                                onClick={() => {
                                  setDetailAlumni(toSiswaModalItem(item));
                                  setActiveDropdown(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" /> Lihat Detail
                              </button>
                              <button 
                                onClick={() => {
                                  setEditAlumni(toSiswaModalItem(item));
                                  setActiveDropdown(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" /> Edit
                              </button>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button 
                                onClick={() => {
                                  setHapusAlumni(toSiswaModalItem(item));
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500 font-medium">
                    {searchQuery ? "Alumni tidak ditemukan." : "Belum ada data alumni."}
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

      <ModalDetailSiswa siswa={detailAlumni} onClose={() => setDetailAlumni(null)} />
      <ModalEditSiswa siswa={editAlumni} onClose={() => setEditAlumni(null)} />
      <ModalHapusSiswa siswa={hapusAlumni} onClose={() => setHapusAlumni(null)} />

    </main>
  );
}
