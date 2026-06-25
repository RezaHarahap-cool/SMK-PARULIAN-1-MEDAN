import React, { useState, useEffect } from "react";
import { Menu, ChevronDown, CalendarDays, Loader2 } from "lucide-react";

interface RosterItem {
  id: string;
  sesi: number;
  jamMulai: string;
  jamSelesai: string;
  mapel: string;
  guru: string;
  hari: string;
}

export default function RosterSiswaContent({ onMenuClick }: { onMenuClick: () => void }) {
  // Setup Hari Default
  const hariIni = new Date().toLocaleDateString('id-ID', { weekday: 'long' });
  const hariAwal = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].includes(hariIni) ? hariIni : "Senin";

  const [filterHari, setFilterHari] = useState(hariAwal);
  
  // State Data
  const [dataRoster, setDataRoster] = useState<RosterItem[]>([]);
  const [infoKelas, setInfoKelas] = useState({ nama_kelas: "-", nama_jurusan: "-" });
  
  // State UI
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchJadwal = async () => {
      setIsLoading(true);
      setErrorMsg("");
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("http://187.127.121.139:3000/api/siswa-area/jadwal-pelajaran", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success) {
          setInfoKelas(result.infoKelas);
          
          // Mapping Data
          const mappedData: RosterItem[] = result.dataJadwal.map((item: any) => ({
            id: item.id_jadwal,
            sesi: item.les,
            jamMulai: item.jam_mulai,
            jamSelesai: item.jam_berakhir,
            mapel: item.mapel?.mapel || "-",
            guru: item.les === 0 ? "-" : item.guru?.nama_guru || "-",
            hari: item.hari
          }));
          
          setDataRoster(mappedData);
        } else {
          setErrorMsg(result.message);
        }
      } catch (error) {
        console.error("Gagal ambil jadwal siswa:", error);
        setErrorMsg("Terjadi kesalahan koneksi server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJadwal();
  }, []);

  // Logika Filter (Abaikan Case-Sensitive)
  const jadwalTampil = dataRoster.filter(
    (item) => item.hari.toLowerCase() === filterHari.toLowerCase()
  );

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-[#f4f7fb] p-6 md:p-10 custom-scrollbar">
      
      {/* Header Mobile Toggle */}
      <div className="flex items-center gap-4 mb-8">
        <button className="lg:hidden p-2 bg-white rounded-lg shadow-sm cursor-pointer" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">Jadwal Pelajaran</h2>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-bold w-full max-w-3xl">
          {errorMsg}
        </div>
      )}

      {/* BOX 1: INFO KELAS & FILTER */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm mb-8 w-full max-w-3xl relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-2xl">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}
        
        <h3 className="text-xl font-extrabold text-black mb-6">Info Roster</h3>
        
        <div className="grid grid-cols-[80px_10px_1fr] md:grid-cols-[100px_10px_1fr] gap-y-4 items-center text-sm md:text-base">
          
          <span className="font-bold text-gray-800">Jurusan</span>
          <span className="font-bold text-gray-800">:</span>
          <span className="font-medium text-gray-700">{infoKelas.nama_jurusan}</span>
          
          <span className="font-bold text-gray-800">Kelas</span>
          <span className="font-bold text-gray-800">:</span>
          <span className="font-medium text-gray-700">{infoKelas.nama_kelas}</span>
          
          <span className="font-bold text-gray-800">Hari</span>
          <span className="font-bold text-gray-800">:</span>
          <div className="relative w-40">
            <select 
              value={filterHari}
              onChange={(e) => setFilterHari(e.target.value)}
              className="w-full appearance-none px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-sm font-semibold text-gray-800 focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="Senin">Senin</option>
              <option value="Selasa">Selasa</option>
              <option value="Rabu">Rabu</option>
              <option value="Kamis">Kamis</option>
              <option value="Jumat">Jumat</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

        </div>
      </div>

      {/* BOX 2: TABEL ROSTER */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm max-w-4xl relative min-h-[300px]">
        {isLoading ? (
           <div className="absolute inset-0 flex flex-col justify-center items-center z-10 bg-gray-50/50">
             <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-2" />
             <p className="font-semibold text-gray-500">Memuat Jadwal...</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center text-sm whitespace-nowrap">
              
              <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-800 font-bold">
                <tr>
                  <th className="px-6 py-4 w-24">Sesi</th>
                  <th className="px-6 py-4 w-32">Jam Mulai</th>
                  <th className="px-6 py-4 w-32">Jam Selesai</th>
                  <th className="px-6 py-4">Mapel</th>
                  <th className="px-6 py-4">Guru</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {jadwalTampil.length > 0 ? (
                  jadwalTampil.map((item) => {
                    const isKegiatan = item.sesi === 0;
                    return (
                      <tr key={item.id} className={isKegiatan ? "bg-orange-50/70" : "hover:bg-gray-50 transition-colors"}>
                        <td className="px-6 py-4 font-extrabold text-gray-900">{isKegiatan ? "-" : item.sesi}</td>
                        <td className="px-6 py-4 font-semibold text-gray-600">{item.jamMulai}</td>
                        <td className="px-6 py-4 font-semibold text-gray-600">{item.jamSelesai}</td>
                        <td className={isKegiatan ? "px-6 py-4 font-extrabold text-orange-700 uppercase tracking-wide" : "px-6 py-4 font-bold text-black"}>{item.mapel}</td>
                        <td className="px-6 py-4 font-semibold text-gray-700">{isKegiatan ? "-" : item.guru}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <CalendarDays className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-base font-bold text-gray-600">Libur / Kosong</p>
                        <p className="text-sm mt-1">Tidak ada jadwal pelajaran di hari {filterHari}.</p>
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
