import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

// Sesuaikan tipe data dengan yang dikirim dari halaman induk
export interface DataAbsensi {
  id: string;
  mengajar_id: string; // Wajib ada untuk menarik data dari API
  mapel: string;
  kelas: string;
  semester: string;
  guruPengajar: string;
}

interface ModalDetailAbsensiProps {
  data: DataAbsensi | null;
  onClose: () => void;
}

// Tipe data untuk tabel history
interface HistoryAbsensi {
  id: string;
  mapel: string;
  pertemuan: string | number;
  tanggal: string;
  absen: string;
  catatan: string;
}

export default function ModalDetailAbsensi({ data, onClose }: ModalDetailAbsensiProps) {
  const [historyAbsensi, setHistoryAbsensi] = useState<HistoryAbsensi[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    // Jika modal terbuka dan ada data, langsung tembak API
    if (data && data.mengajar_id) {
      const fetchDetail = async () => {
        setIsLoading(true);
        setErrorMsg("");
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`http://187.127.121.139:3000/api/siswa-area/riwayat-absensi/${data.mengajar_id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const result = await response.json();

          if (result.success) {
            setHistoryAbsensi(result.data);
          } else {
            setErrorMsg(result.message || "Gagal mengambil data.");
          }
        } catch (error) {
          console.error("Gagal menarik detail absensi:", error);
          setErrorMsg("Terjadi kesalahan jaringan.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchDetail();
    }
  }, [data]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      
      {/* Overlay Gelap */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Kotak Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in z-10 overflow-hidden">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white z-10">
          <div>
            <h3 className="text-xl font-extrabold text-black">Detail Absensi: {data.mapel}</h3>
            <p className="text-sm font-semibold text-gray-500 mt-1">
              Kelas {data.kelas} • Semester {data.semester} • {data.guruPengajar}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Konten Detail - TABEL */}
        <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50/50 min-h-[300px] relative">
          
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col justify-center items-center bg-gray-50/50 z-10">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-sm font-bold text-gray-500">Memuat riwayat pertemuan...</p>
            </div>
          ) : errorMsg ? (
            <div className="text-center py-10 text-red-500 font-bold">{errorMsg}</div>
          ) : historyAbsensi.length === 0 ? (
            <div className="text-center py-10 text-gray-500 font-bold">Belum ada riwayat pertemuan untuk mapel ini.</div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-center text-sm whitespace-nowrap">
                  
                  {/* Header Tabel */}
                  <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-800 font-bold">
                    <tr>
                      <th className="px-6 py-4">Mapel</th>
                      <th className="px-6 py-4">Pertemuan</th>
                      <th className="px-6 py-4">Hari, Tanggal</th>
                      <th className="px-6 py-4">Absen</th>
                      <th className="px-6 py-4 text-left">Catatan</th>
                    </tr>
                  </thead>
                  
                  {/* Body Tabel */}
                  <tbody className="divide-y divide-gray-100">
                    {historyAbsensi.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">{item.mapel}</td>
                        <td className="px-6 py-4 font-extrabold text-black">{item.pertemuan}</td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{item.tanggal}</td>
                        <td className={`px-6 py-4 font-bold ${
                          item.absen === "Hadir" ? "text-green-600" :
                          item.absen === "Izin" ? "text-blue-600" :
                          item.absen === "Sakit" ? "text-yellow-600" : "text-red-600"
                        }`}>
                          {item.absen}
                        </td>
                        <td className="px-6 py-4 text-left text-gray-600">{item.catatan}</td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}