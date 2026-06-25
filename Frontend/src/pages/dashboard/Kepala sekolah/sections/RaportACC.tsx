import React, { useState, useEffect } from "react";
import { 
  Menu, CheckCircle, Clock, Eye, 
  SearchX, FileSignature, Loader2, ChevronDown
} from "lucide-react";
import Swal from "sweetalert2"; // 🔥 IMPORT SWEETALERT DI SINI

// 1. Tipe Data (Disesuaikan dengan response API Backend)
interface DataRaportKelas {
  mengajar_id: string;
  nama_kelas: string;
  nama_mapel: string;
  nama_guru: string;
  total_siswa_pending: number;
  rapor_pendukung_lengkap?: boolean;
  rapor_pendukung_belum_lengkap?: number;
  status_acc: "Menunggu" | "Disetujui"; // Status lokal untuk manipulasi UI
}

export default function AccRaportContent({ onMenuClick }: { onMenuClick: () => void }) {
  // State
  const [dataKelas, setDataKelas] = useState<DataRaportKelas[]>([]);
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // ==========================================
  // FUNGSI 1: TARIK DATA DARI BACKEND
  // ==========================================
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token"); // Sesuaikan jika namamu 'accessToken'
      const res = await fetch("http://187.127.121.139:3000/api/kepsek-area/pending-list", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();

      if (result.success) {
        // Tambahkan properti status_acc lokal ke setiap data yang masuk
        const mappedData = result.data.map((item: any) => ({
          ...item,
          status_acc: "Menunggu"
        }));
        setDataKelas(mappedData);
      } else {
        console.error("Gagal menarik data:", result.message);
      }
    } catch (error) {
      console.error("Kesalahan jaringan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Data berdasarkan status UI
  const dataTampil = dataKelas.filter(item => 
    filterStatus === "Semua" ? true : item.status_acc === filterStatus
  );

  // ==========================================
  // FUNGSI 2: HANDLER ACC RAPORT KE BACKEND
  // ==========================================
  const handleAcc = async (mengajar_id: string, nama_kelas: string, nama_mapel: string) => {
    // 🔥 SWEETALERT KONFIRMASI
    const confirmResult = await Swal.fire({
      title: "Konfirmasi ACC",
      text: `Apakah Anda yakin ingin menyetujui (ACC) raport kelas ${nama_kelas} untuk ${nama_mapel}? Tindakan ini akan mengunci nilai secara permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Setujui!",
      cancelButtonText: "Batal"
    });
    
    if (!confirmResult.isConfirmed) return;

    setIsProcessing(mengajar_id);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://187.127.121.139:3000/api/kepsek-area/approve-kelas", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ mengajar_id })
      });

      const result = await res.json();

      if (result.success) {
        // Update state lokal agar UI langsung berubah menjadi "Disetujui" berwarna hijau
        setDataKelas(prevData => 
          prevData.map(item => 
            item.mengajar_id === mengajar_id ? { ...item, status_acc: "Disetujui" } : item
          )
        );
        // 🔥 SWEETALERT SUKSES
        Swal.fire({
          title: "Berhasil!",
          text: `Raport kelas ${nama_kelas} berhasil disetujui!`,
          icon: "success",
          confirmButtonColor: "#000000"
        });
      } else {
        // Format HTML untuk list siswa yang belum lengkap nilainya
        const detailHtml = Array.isArray(result.data_tidak_lengkap)
          ? `<br><br><div style="text-align: left; font-size: 14px;"><b>Data belum lengkap:</b><ul style="margin-top: 5px; padding-left: 20px;">` + 
            result.data_tidak_lengkap
              .slice(0, 10)
              .map((item: any) => `<li><b>${item.nama_siswa}</b> (${item.nisn}): <span style="color: red">${item.kurang.join(", ")}</span></li>`)
              .join("") + `</ul>${result.data_tidak_lengkap.length > 10 ? '<p style="font-size: 12px; color: gray;">...dan lainnya</p>' : ''}</div>`
          : "";

        // 🔥 SWEETALERT GAGAL DENGAN HTML LIST
        Swal.fire({
          title: "Gagal Disetujui!",
          html: `${result.message}${detailHtml}`,
          icon: "error",
          confirmButtonColor: "#d33"
        });
      }
    } catch (error) {
      console.error("Gagal ACC:", error);
      Swal.fire("Error!", "Terjadi kesalahan jaringan saat memproses data.", "error");
    } finally {
      setIsProcessing(null);
    }
  };

  // ==========================================
  // FUNGSI 3: LIHAT DETAIL (PRATINJAU)
  // ==========================================
  const escapeHtml = (value: unknown) =>
    String(value ?? "-")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const lihatDetail = async (mengajar_id: string, nama_kelas: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://187.127.121.139:3000/api/kepsek-area/pending-detail/${mengajar_id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();

      if (result.success) {
        const mapelList = Array.from(new Set(result.data.map((item: any) => item.mapel))) as string[];
        const siswaMap = new Map<string, { nama_siswa: string; nisn: string; nilai: Record<string, string | number> }>();

        result.data.forEach((item: any) => {
          const siswaKey = item.nisn || item.nama_siswa;
          if (!siswaMap.has(siswaKey)) {
            siswaMap.set(siswaKey, {
              nama_siswa: item.nama_siswa,
              nisn: item.nisn,
              nilai: {},
            });
          }
          siswaMap.get(siswaKey)!.nilai[item.mapel] = item.nilai_akhir;
        });

        const headerMapel = mapelList
          .map((mapel) => `<th style="border:1px solid #e5e7eb;padding:10px;min-width:120px;text-align:center;">${escapeHtml(mapel)}</th>`)
          .join("");

        const rows = Array.from(siswaMap.values()).map((siswa, index) => {
          const nilaiCells = mapelList
            .map((mapel) => `<td style="border:1px solid #e5e7eb;padding:10px;text-align:center;font-weight:700;color:#111827;">${escapeHtml(siswa.nilai[mapel] ?? "-")}</td>`)
            .join("");

          return `<tr>
            <td style="border:1px solid #e5e7eb;padding:10px;text-align:center;font-weight:700;">${index + 1}</td>
            <td style="border:1px solid #e5e7eb;padding:10px;text-align:left;font-weight:700;min-width:180px;">${escapeHtml(siswa.nama_siswa)}<br><small style="color:#6b7280;font-weight:600;">${escapeHtml(siswa.nisn)}</small></td>
            ${nilaiCells}
          </tr>`;
        }).join("");

        const tableHtml = `
          <div style="max-height:420px;overflow:auto;border:1px solid #e5e7eb;border-radius:10px;">
            <table style="border-collapse:collapse;width:100%;font-size:13px;">
              <thead style="background:#f8f9fa;position:sticky;top:0;z-index:1;">
                <tr>
                  <th style="border:1px solid #e5e7eb;padding:10px;width:52px;text-align:center;">No</th>
                  <th style="border:1px solid #e5e7eb;padding:10px;text-align:left;min-width:180px;">Nama Siswa</th>
                  ${headerMapel}
                </tr>
              </thead>
              <tbody>${rows || `<tr><td colspan="${mapelList.length + 2}" style="padding:24px;text-align:center;color:#6b7280;">Belum ada detail nilai.</td></tr>`}</tbody>
            </table>
          </div>`;

        Swal.fire({
          title: `Pratinjau Nilai Kelas ${nama_kelas}`,
          html: tableHtml,
          icon: "info",
          confirmButtonColor: "#000000",
          confirmButtonText: "Tutup",
          width: "min(1100px, 96vw)"
        });
      } else {
        Swal.fire("Peringatan!", result.message || "Gagal memuat detail.", "warning");
      }
    } catch (error) {
      Swal.fire("Error!", "Gagal menarik detail nilai karena masalah jaringan.", "error");
    }
  };

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-[#f4f7fb] p-6 md:p-10 custom-scrollbar">
      
      {/* Header Content */}
      <div className="flex items-center gap-4 mb-8">
        <button className="lg:hidden p-2 bg-white rounded-lg shadow-sm cursor-pointer" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">Persetujuan Raport</h2>
        </div>
      </div>

      {/* Action Bar (Filter) */}
      <div className="flex justify-end mb-6">
        <div className="relative w-full sm:w-48">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black cursor-pointer shadow-sm"
          >
            <option value="Semua">Semua Status</option>
            <option value="Menunggu">Menunggu ACC</option>
            <option value="Disetujui">Sudah Disetujui</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Frame Utama Tabel */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm min-h-[400px] relative">
        
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-white/80 z-10">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            <p className="font-bold text-gray-500">Memuat data kelas...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              
              {/* Header Tabel */}
              <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-800 font-bold">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">No</th>
                  <th className="px-6 py-4 w-32">Kelas</th>
                  <th className="px-6 py-4 w-64">Wali Kelas & Paket Rapor</th>
                  <th className="px-6 py-4 w-32 text-center">Data Masuk</th>
                  <th className="px-6 py-4 w-40 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>

              {/* Body Tabel */}
              <tbody className="divide-y divide-gray-100">
                {dataTampil.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <SearchX className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-base font-bold text-gray-600">Tidak ada data</p>
                        <p className="text-sm mt-1">Belum ada rapor yang menunggu persetujuan Anda.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  dataTampil.map((item, index) => (
                    <tr key={item.mengajar_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-center font-bold text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 font-extrabold text-black">{item.nama_kelas}</td>
                      
                      {/* Kolom Gabungan Guru dan Mapel */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">{item.nama_guru}</p>
                        <p className="text-xs text-gray-500 font-medium">{item.nama_mapel}</p>
                        {item.rapor_pendukung_lengkap === false && (
                          <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-[11px] font-bold text-orange-700">
                            <Clock className="h-3 w-3" />
                            Pramuka/catatan belum lengkap: {item.rapor_pendukung_belum_lengkap || 0} siswa
                          </p>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 text-center font-bold text-gray-600">{item.total_siswa_pending} Siswa</td>
                      
                      {/* Badge Status */}
                      <td className="px-6 py-4 text-center">
                        {item.status_acc === "Disetujui" ? (
                          <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold">
                            <CheckCircle className="w-3.5 h-3.5" /> Disetujui
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold">
                            <Clock className="w-3.5 h-3.5" /> Menunggu
                          </span>
                        )}
                      </td>

                      {/* Tombol Aksi */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => lihatDetail(item.mengajar_id, item.nama_kelas)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail Nilai"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          
                          {item.status_acc === "Menunggu" ? (
                            <button 
                              onClick={() => handleAcc(item.mengajar_id, item.nama_kelas, item.nama_mapel)}
                              disabled={isProcessing === item.mengajar_id}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs text-white transition-all shadow-sm ${
                                isProcessing === item.mengajar_id 
                                  ? "bg-gray-400 cursor-not-allowed" 
                                  : "bg-black hover:bg-gray-800 cursor-pointer"
                              }`}
                            >
                              {isProcessing === item.mengajar_id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <FileSignature className="w-4 h-4" /> ACC Raport
                                </>
                              )}
                            </button>
                          ) : (
                            <button 
                              disabled
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs text-gray-400 bg-gray-100 cursor-not-allowed border border-gray-200"
                            >
                              <CheckCircle className="w-4 h-4" /> Selesai
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>
        )}
      </div>

    </main>
  );
}
