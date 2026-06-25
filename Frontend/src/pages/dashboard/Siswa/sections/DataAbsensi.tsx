import React, { useState, useEffect } from "react";
import { Menu, ChevronDown, ArrowUpRight, SearchX, Loader2 } from "lucide-react";
import ModalDetailAbsensi from "../components/ModalDetailAbsensi"; 

// 1. Tipe Data
interface DataAbsensi {
  id: string;
  mengajar_id: string; 
  mapel: string;
  kelas: string;
  semester: string;
  guruPengajar: string;
  pertemuan: number;
  tanggal: string;
  topik: string;
  keterangan: "Hadir" | "Izin" | "Sakit" | "Alpha";
  catatan_sikap: string;
}

type RekapKehadiran = Record<"Hadir" | "Izin" | "Sakit" | "Alpha", number>;

interface RekapAbsensiMapel extends DataAbsensi {
  rekap: RekapKehadiran;
  totalPertemuan: number;
}

export default function AbsensiContent({ onMenuClick }: { onMenuClick: () => void }) {
  // State Filter Card
  const [filterKelas, setFilterKelas] = useState("Semua");
  const [filterSemester, setFilterSemester] = useState("Semua");
  
  // State Data
  const [dataAbsensi, setDataAbsensi] = useState<DataAbsensi[]>([]);
  const [dataTampil, setDataTampil] = useState<DataAbsensi[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // STATE UNTUK MODAL DETAIL
  const [detailAbsensi, setDetailAbsensi] = useState<DataAbsensi | null>(null);

  // FUNGSI TARIK DATA
  const fetchAbsensi = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://187.127.121.139:3000/api/siswa-area/riwayat-absensi", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await response.json();

      if (result.success) {
        const mappedData: DataAbsensi[] = result.data.map((item: any) => ({
          ...item,
          mengajar_id: item.mengajar_id || "unknown" 
        }));

        setDataAbsensi(mappedData);
        setDataTampil(mappedData); // Awalnya tampilkan semua
      }
    } catch (error) {
      console.error("Gagal mengambil absensi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsensi();
  }, []);

  // FUNGSI FILTER
  const handleTampilkan = () => {
    const filtered = dataAbsensi.filter((item) => {
      const tingkatKelas = item.kelas.trim().split(/\s+/)[0]?.toUpperCase() || "";
      const matchKelas = filterKelas === "Semua" || tingkatKelas === filterKelas.toUpperCase();
      const matchSemester = filterSemester === "Semua" || item.semester.toUpperCase() === filterSemester.toUpperCase();
      
      return matchKelas && matchSemester;
    });
    setDataTampil(filtered);
  };

  // Rekap satu card per mata pelajaran. Detail per pertemuan tetap dibuka dari modal.
  const rekapPerMapel = Object.values(dataTampil.reduce((acc, curr) => {
    const key = curr.mengajar_id || `${curr.mapel}-${curr.kelas}-${curr.semester}`;
    if (!acc[key]) {
      acc[key] = {
        ...curr,
        rekap: { Hadir: 0, Izin: 0, Sakit: 0, Alpha: 0 },
        totalPertemuan: 0,
      };
    }

    acc[key].rekap[curr.keterangan] += 1;
    acc[key].totalPertemuan += 1;
    return acc;
  }, {} as Record<string, RekapAbsensiMapel>));

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-[#f4f7fb] p-6 md:p-10 custom-scrollbar">
      
      {/* Header Content */}
      <div className="flex items-center gap-4 mb-8">
        <button className="lg:hidden p-2 bg-white rounded-lg shadow-sm cursor-pointer" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">Riwayat Kehadiran</h2>
        </div>
      </div>

      {/* Action Bar (Filter Dropdowns) */}
      <div className="flex justify-start md:justify-end mb-8">
        <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm w-full md:w-auto">
          <div className="relative w-full sm:w-32">
            <select 
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full appearance-none px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="Semua">Semua Kelas</option>
              <option value="X">Kelas X</option>
              <option value="XI">Kelas XI</option>
              <option value="XII">Kelas XII</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-36">
            <select 
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="w-full appearance-none px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="Semua">Semua Semester</option>
              <option value="Ganjil">Ganjil</option>
              <option value="Genap">Genap</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <button 
            onClick={handleTampilkan}
            className="w-full sm:w-auto bg-black text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Tampilkan
          </button>
        </div>
      </div>

      {/* Grid Cards Container */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 font-bold">Memuat Riwayat Absensi...</p>
        </div>
      ) : rekapPerMapel.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {rekapPerMapel.map((item) => {
            return (
              <div 
                key={item.mengajar_id || item.id} 
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col group overflow-hidden"
              >
                {/* Bagian Atas Card */}
                <div className="p-6 flex-1 relative">
                  <h3 className="text-lg font-extrabold text-gray-900 mb-5 leading-tight line-clamp-2 pr-16">
                    {item.mapel}
                  </h3>
                  
                  <div className="grid grid-cols-[100px_10px_1fr] text-sm gap-y-3 mb-2">
                    <span className="text-gray-500 font-medium">Kelas</span>
                    <span className="text-gray-400">:</span>
                    <span className="font-bold text-gray-900">{item.kelas}</span>
                    
                    <span className="text-gray-500 font-medium">Semester</span>
                    <span className="text-gray-400">:</span>
                    <span className="font-bold text-gray-900">{item.semester}</span>
                    
                    <span className="text-gray-500 font-medium">Guru Pengajar</span>
                    <span className="text-gray-400">:</span>
                    <span className="font-bold text-gray-900 truncate" title={item.guruPengajar}>
                      {item.guruPengajar}
                    </span>

                    <span className="text-gray-500 font-medium">Pertemuan</span>
                    <span className="text-gray-400">:</span>
                    <span className="font-bold text-gray-900">{item.totalPertemuan} kali</span>
                  </div>

                  {/* 🔥 DETAIL HADIR / IZIN / SAKIT / ALPHA DIMASUKKAN KE SINI */}
                  <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-2 text-[11px] font-bold">
                    <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-md">
                      Hadir: {item.rekap.Hadir}
                    </span>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-md">
                      Izin: {item.rekap.Izin}
                    </span>
                    <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-1 rounded-md">
                      Sakit: {item.rekap.Sakit}
                    </span>
                    <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded-md">
                      Alpha: {item.rekap.Alpha}
                    </span>
                  </div>
                </div>

                {/* Bagian Bawah Card */}
                <div className="bg-gray-50/80 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                  <button 
                    onClick={() => setDetailAbsensi(item)} 
                    className="flex items-center gap-1.5 text-xs font-bold bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer shadow-sm"
                  >
                    Lihat Detail <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <SearchX className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-base font-bold text-gray-800">Riwayat Kosong</p>
          <p className="text-sm text-gray-500 mt-1 text-center px-4">
            Sistem belum merekam data kehadiran untuk filter yang Anda pilih.
          </p>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL DETAIL ABSENSI                      */}
      {/* ========================================= */}
      {detailAbsensi && (
        <ModalDetailAbsensi 
          data={detailAbsensi} 
          onClose={() => setDetailAbsensi(null)} 
        />
      )}

    </main>
  );
}
