import React, { useState, useEffect } from "react";
import ModalTambahRoster from "../components/ModalTambahRoster";
import ModalDetailRoster from "../components/ModalDetailRoster";
import ModalEditRoster from "../components/ModalEditRoster";
import ModalHapusRoster from "../components/ModalHapusRoster";
import {
  Menu,
  Plus,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  ChevronDown,
  CalendarDays,
  Loader2
} from "lucide-react";

interface RosterItem {
  id_jadwal: string;
  les: number;
  jam_mulai: string;
  jam_berakhir: string;
  mapel: { mapel: string };
  guru: { nama_guru: string } | null;
  hari: string;
}

export default function DataRosterContent({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const [filterHari, setFilterHari] = useState("Senin");
  const [filterKelas, setFilterKelas] = useState(""); 

  const [kelasOptions, setKelasOptions] = useState<any[]>([]);
  const [rosterData, setRosterData] = useState<RosterItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isModalTambahOpen, setIsModalTambahOpen] = useState(false);
  const [detailRoster, setDetailRoster] = useState<RosterItem | null>(null);
  const [editRoster, setEditRoster] = useState<RosterItem | null>(null);
  const [hapusRoster, setHapusRoster] = useState<RosterItem | null>(null);

  // ========================================================
  // 🔥 1. FUNGSI FETCH JADWAL DIKELUARKAN DARI USEEFFECT
  // ========================================================
  const fetchJadwal = async () => {
    if (!filterKelas) return; 
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://187.127.121.139:3000/api/jadwal?kelas_id=${filterKelas}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();

      if (result.success) {
        const filteredByHari = result.data.filter((item: RosterItem) => item.hari === filterHari);
        setRosterData(filteredByHari);
      }
    } catch (error) {
      console.error("Gagal menarik jadwal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://187.127.121.139:3000/api/kelas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        
        if (result.success && result.data.length > 0) {
          setKelasOptions(result.data);
          setFilterKelas(result.data[0].id_kelas); 
        }
      } catch (error) {
        console.error("Gagal menarik data kelas:", error);
      }
    };
    fetchKelas();
  }, []);

  // ========================================================
  // 🔥 2. USEEFFECT TINGGAL MEMANGGIL FUNGSINYA SAJA
  // ========================================================
  useEffect(() => {
    fetchJadwal();
  }, [filterKelas, filterHari]); 

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
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
            Data Roster
          </h2>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 rounded-xl ">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <CalendarDays className="w-5 h-5 text-gray-400 hidden sm:block" />

          <div className="relative w-full sm:w-36">
            <select
              value={filterHari}
              onChange={(e) => setFilterHari(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-bold focus:outline-none focus:border-black cursor-pointer text-gray-700"
            >
              {["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-48">
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-bold focus:outline-none focus:border-black cursor-pointer text-gray-700 truncate pr-8"
            >
              <option value="" disabled>-- Pilih Kelas --</option>
              {kelasOptions.map((k) => (
                <option key={k.id_kelas} value={k.id_kelas}>
                  {k.nama_kelas}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <button
          onClick={() => setIsModalTambahOpen(true)}
          className="w-full lg:w-auto flex items-center justify-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
        >
          Tambah <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto pb-24 min-h-[300px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-6 py-4 w-16 text-center">Les</th>
                <th className="px-6 py-4 text-center">Jam Mulai</th>
                <th className="px-6 py-4 text-center">Jam Selesai</th>
                <th className="px-6 py-4">Mapel</th>
                <th className="px-6 py-4">Guru</th>
                <th className="px-6 py-4 text-center w-24">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-black mb-2" />
                    <p className="text-gray-500 font-medium">Memuat Jadwal...</p>
                  </td>
                </tr>
              ) : rosterData.length > 0 ? (
                rosterData.map((item) => (
                  <tr
                    key={item.id_jadwal}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4 text-center text-gray-900 font-bold">
                      {item.les === 0 ? "-" : item.les}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 font-medium">
                      {item.jam_mulai}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 font-medium">
                      {item.jam_berakhir}
                    </td>
                    <td className={item.les === 0 ? "px-6 py-4 text-orange-700 font-extrabold uppercase tracking-wide" : "px-6 py-4 text-gray-900 font-semibold"}>
                      {item.mapel?.mapel || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.les === 0 ? "-" : item.guru?.nama_guru || "N/A"}
                    </td>

                    <td className="px-6 py-4 text-center relative">
                      <button
                        onClick={() => toggleDropdown(item.id_jadwal)}
                        className="p-2 rounded-md hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeDropdown === item.id_jadwal && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveDropdown(null)}
                          ></div>
                          <div className="absolute right-8 top-10 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 animate-fade-in">
                            <button
                              onClick={() => {
                                setDetailRoster(item);
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> Lihat Detail
                            </button>
                            <button
                              onClick={() => {
                                setEditRoster(item);
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                              onClick={() => {
                                setHapusRoster(item);
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
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <CalendarDays className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-base font-medium text-gray-600">
                        Jadwal belum tersedia
                      </p>
                      <p className="text-sm mt-1">
                        Silakan tambahkan jadwal untuk kelas dan hari ini.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalHapusRoster
        roster={hapusRoster}
        onClose={() => setHapusRoster(null)}
        onRefresh={fetchJadwal} 
      />
      <ModalEditRoster
        roster={editRoster}
        onClose={() => setEditRoster(null)}
        onRefresh={fetchJadwal} 
      />
      <ModalDetailRoster
        roster={detailRoster}
        onClose={() => setDetailRoster(null)}
      />
      <ModalTambahRoster
        isOpen={isModalTambahOpen}
        onClose={() => setIsModalTambahOpen(false)}
        onRefresh={fetchJadwal}
      />
    </main>
  );
}
