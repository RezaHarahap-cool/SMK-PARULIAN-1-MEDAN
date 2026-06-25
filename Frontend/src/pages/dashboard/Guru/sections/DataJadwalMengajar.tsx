import React, { useState, useEffect } from "react";
import { Menu, ChevronDown, CalendarDays, Loader2 } from "lucide-react";

// 1. Tipe Data Jadwal
interface JadwalItem {
  id: string;
  sesi: number;
  jamMulai: string;
  jamSelesai: string;
  mapel: string;
  hari: string;
  kelas: string;
  jurusan: string;
}

export default function JadwalMengajarContent({ onMenuClick }: { onMenuClick: () => void }) {
  // State Hari Saat Ini (Agar default filter sesuai dengan hari ini secara real-time)
  const hariIni = new Date().toLocaleDateString('id-ID', { weekday: 'long' });
  const hariAwal = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].includes(hariIni) ? hariIni : "Senin";

  // State
  const [filterHari, setFilterHari] = useState(hariAwal);
  const [dataJadwal, setDataJadwal] = useState<JadwalItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Ambil Data dari API Backend
  const fetchJadwal = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://187.127.121.139:3000/api/jadwal-mengajar", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await response.json();

      if (result.success) {
        // Mapping format Database ke format UI Table
        const mappedData: JadwalItem[] = result.data.map((item: any) => ({
          id: item.id_jadwal,
          sesi: item.les,
          jamMulai: item.jam_mulai,
          jamSelesai: item.jam_berakhir,
          mapel: item.mapel?.mapel || "-",
          hari: item.hari, // Pastikan isi ENUM-nya (Senin, Selasa, dll) huruf depannya kapital
          kelas: item.kelas?.nama_kelas || "-",
          jurusan: item.kelas?.jurusan?.jurusan || "-"
        }));
        setDataJadwal(mappedData);
      } else {
        setErrorMsg(result.message);
      }
    } catch (error) {
      console.error("Gagal ambil jadwal:", error);
      setErrorMsg("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJadwal();
  }, []);

  // Logika Filter Data
  const filteredJadwal = dataJadwal.filter(
    (item) => filterHari === "Semua" || item.hari === filterHari
  );

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-gray-50 p-6 md:p-10">
      
      {/* Header Content */}
      <div className="flex items-center gap-4 mb-8">
        <button className="lg:hidden p-2 bg-white rounded-lg shadow-sm cursor-pointer" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">Jadwal Mengajar</h2>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-bold">{errorMsg}</div>
      )}

      {/* Action Bar (Filter Hari) */}
      <div className="flex justify-end mb-4">
        <div className="relative w-full sm:w-48">
          <select 
            value={filterHari}
            onChange={(e) => setFilterHari(e.target.value)}
            className="w-full appearance-none px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black cursor-pointer shadow-sm"
          >
            <option value="Semua">Semua Hari</option>
            <option value="Senin">Senin</option>
            <option value="Selasa">Selasa</option>
            <option value="Rabu">Rabu</option>
            <option value="Kamis">Kamis</option>
            <option value="Jumat">Jumat</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm min-h-[400px] relative">
        
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-white/80 z-10">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-bold">Memuat Jadwal...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              
              {/* Header Tabel */}
              <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-bold">
                <tr>
                  <th className="px-6 py-4 text-center w-20">Sesi</th>
                  <th className="px-6 py-4 text-center w-28">Jam Mulai</th>
                  <th className="px-6 py-4 text-center w-28">Jam Selesai</th>
                  <th className="px-6 py-4">Mapel</th>
                  <th className="px-6 py-4 text-center">Hari</th>
                  <th className="px-6 py-4 text-center">Kelas</th>
                  <th className="px-6 py-4 text-center">Jurusan</th>
                </tr>
              </thead>

              {/* Body Tabel */}
              <tbody className="divide-y divide-gray-100">
                {filteredJadwal.length > 0 ? (
                  filteredJadwal.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-center font-bold text-gray-900">{item.sesi === 0 ? "-" : item.sesi}</td>
                      <td className="px-6 py-4 text-center text-gray-600 font-medium">{item.jamMulai}</td>
                      <td className="px-6 py-4 text-center text-gray-600 font-medium">{item.jamSelesai}</td>
                      <td className={item.sesi === 0 ? "px-6 py-4 font-extrabold text-orange-700 uppercase tracking-wide" : "px-6 py-4 font-bold text-black"}>{item.mapel}</td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-700">{item.hari}</td>
                      <td className="px-6 py-4 text-center font-bold text-blue-700">{item.kelas}</td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-700">{item.jurusan}</td>
                    </tr>
                  ))
                ) : (
                  /* State Kosong jika hari yang dipilih tidak ada jadwal */
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <CalendarDays className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-base font-bold text-gray-600">Libur / Tidak ada jam mengajar</p>
                        <p className="text-sm mt-1">Anda tidak memiliki jadwal kelas pada hari {filterHari}.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        )}
      </div>

    </main>
  );
}
