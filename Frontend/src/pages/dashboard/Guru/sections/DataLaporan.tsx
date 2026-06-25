import React, { useCallback, useEffect, useState } from "react";
import { Menu, Send, Info, Loader2, MessageSquare, SmartphoneNfc, CheckCircle2, Power, PowerOff } from "lucide-react";
import QRCode from "react-qr-code"; 
import Swal from "sweetalert2"; // 🔥 IMPORT SWEETALERT DI SINI

// 1. Tipe Data Laporan
interface DraftLaporan {
  id_siswa: string;
  nama_siswa: string;
  no_hp_wali: string;
  pesan_whatsapp: string;
  jumlah_absen_terekam: number;
}

export default function LaporanWaliMuridContent({ onMenuClick }: { onMenuClick: () => void }) {
  const [dataLaporan, setDataLaporan] = useState<DraftLaporan[]>([]);
  const [infoKelas, setInfoKelas] = useState({ kelas: "-", tanggal: "-" });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // STATE BARU KHUSUS STATUS WHATSAPP
  const [waStatus, setWaStatus] = useState("MEMUAT");
  const [qrCodeData, setQrCodeData] = useState("");
  const [isWaActionLoading, setIsWaActionLoading] = useState(false);

  // ==========================================
  // FUNGSI 1: TARIK DATA LAPORAN 
  // ==========================================
  const fetchLaporan = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://187.127.121.139:3000/api/wali-kelas/laporan-harian", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await response.json();

      if (result.success) {
        setInfoKelas({ kelas: result.kelas, tanggal: result.tanggal });
        setDataLaporan(result.data);
      } else {
        setErrorMsg(result.message);
      }
    } catch (error) {
      setErrorMsg("Terjadi kesalahan koneksi jaringan ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkWhatsApp = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://187.127.121.139:3000/api/wali-kelas/status-wa", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      
      if (result.success) {
        setWaStatus(result.status);
        setQrCodeData(result.qr);
      }
    } catch (e) {
      console.error("Gagal mengecek status WA");
    }
  }, []);

  const handleAktifkanWA = async () => {
    setIsWaActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://187.127.121.139:3000/api/wali-kelas/aktifkan-wa", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      setWaStatus(result.status || "MEMUAT");
      setQrCodeData(result.qr || "");
      if (!result.success) {
        Swal.fire("Gagal!", result.message || "Gagal mengaktifkan WhatsApp.", "error");
      }
    } catch (error) {
      Swal.fire("Error!", "Gagal mengaktifkan WhatsApp gateway.", "error");
    } finally {
      setIsWaActionLoading(false);
    }
  };

  const handleNonaktifkanWA = async () => {
    setIsWaActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://187.127.121.139:3000/api/wali-kelas/nonaktifkan-wa", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      setWaStatus(result.status || "NONAKTIF");
      setQrCodeData("");
    } catch (error) {
      Swal.fire("Error!", "Gagal menonaktifkan WhatsApp gateway.", "error");
    } finally {
      setIsWaActionLoading(false);
    }
  };

  // ==========================================
  // FUNGSI 2: PULLING STATUS WHATSAPP
  // ==========================================
  useEffect(() => {
    fetchLaporan();
    checkWhatsApp();
  }, [checkWhatsApp]);

  useEffect(() => {
    if (!["MEMUAT", "MINTA_SCAN", "ERROR"].includes(waStatus)) return;

    const interval = setInterval(() => {
      checkWhatsApp();
    }, 5000);

    return () => clearInterval(interval);
  }, [waStatus, checkWhatsApp]);

  // ==========================================
  // FUNGSI 3: KIRIM PESAN KE WA
  // ==========================================
  const handleKirim = async () => {
    if (waStatus !== "TERKONEKSI") {
      Swal.fire({
        title: "Perhatian!",
        text: "WhatsApp Anda belum terhubung. Silakan scan barcode terlebih dahulu!",
        icon: "warning",
        confirmButtonColor: "#000000"
      });
      return;
    }

    if (dataLaporan.length === 0) {
      Swal.fire("Data Kosong!", "Tidak ada data murid untuk dikirim.", "info");
      return;
    }

    const konfirmasi = await Swal.fire({
      title: "Konfirmasi Pengiriman",
      text: `Kirim ${dataLaporan.length} laporan WhatsApp ke wali murid sekarang?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Kirim Sekarang!",
      cancelButtonText: "Batal"
    });

    if (!konfirmasi.isConfirmed) return;

    setIsSending(true);
    const token = localStorage.getItem("token");
    
    for (let i = 0; i < dataLaporan.length; i++) {
      const target = dataLaporan[i];
      try {
        await fetch("http://187.127.121.139:3000/api/wali-kelas/kirim-wa", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ no_hp_wali: target.no_hp_wali, pesan_whatsapp: target.pesan_whatsapp })
        });
      } catch (err) {
        console.error("Gagal mengirim", err);
      }
      await new Promise(resolve => setTimeout(resolve, 2000)); 
    }

    setIsSending(false);
    Swal.fire({
      title: "Berhasil!",
      text: "Laporan harian selesai dikirim ke semua wali murid!",
      icon: "success",
      confirmButtonColor: "#000000"
    });
  };

  // 🔥 FUNGSI PRATINJAU PESAN (Bersih, Elegan, Fokus pada Format Pesan)
  const lihatPreviewPesan = (namaSiswa: string, pesan: string) => {
    const pesanFormatted = pesan.replace(/\n/g, '<br/>');

    Swal.fire({
      title: `Draf Pesan: ${namaSiswa}`,
      html: `
        <div style="text-align: left; font-size: 14px; background: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; line-height: 1.6; color: #1f2937;">
          ${pesanFormatted}
        </div>
      `,
      icon: "info",
      confirmButtonText: "Tutup",
      confirmButtonColor: "#000000",
      width: "600px" // Diperlebar agar daftar mapel/laporannya muat dengan rapi
    });
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
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">Laporan Harian ke Wali Murid</h2>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 mb-8 w-full max-w-5xl">
        
        {/* INFO PENGINGAT (KIRI) */}
        <div className="flex-1 bg-blue-50 border border-blue-100 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-blue-900">Sistem Laporan Otomatis</h4>
            <p className="text-sm text-blue-800 mt-1 leading-relaxed font-medium">
              Data di bawah ditarik dari input absensi guru mapel. Aktifkan WhatsApp hanya saat akan mengirim rekap, lalu nonaktifkan kembali setelah selesai.
            </p>
          </div>
        </div>

        {/* KOTAK STATUS WHATSAPP (KANAN) */}
        <div className="w-full xl:w-80 bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          
          {waStatus === "NONAKTIF" && (
            <div className="flex flex-col items-center animate-fade-in">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <Power className="w-8 h-8 text-gray-500" />
              </div>
              <h4 className="text-base font-extrabold text-gray-800">WhatsApp Nonaktif</h4>
              <p className="text-xs text-gray-500 font-medium mb-4">Gateway WA belum dijalankan di server.</p>
              <button
                onClick={handleAktifkanWA}
                disabled={isWaActionLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white hover:bg-gray-800 disabled:bg-gray-400 cursor-pointer"
              >
                {isWaActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                Aktifkan WhatsApp
              </button>
            </div>
          )}

          {(waStatus === "MEMUAT" || waStatus === "ERROR") && (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-2" />
              <p className="text-sm font-bold text-gray-600">
                {waStatus === "ERROR" ? "WhatsApp gagal aktif" : "Menyiapkan Mesin WhatsApp..."}
              </p>
              {waStatus === "ERROR" && (
                <button
                  onClick={handleAktifkanWA}
                  disabled={isWaActionLoading}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white hover:bg-gray-800 disabled:bg-gray-400 cursor-pointer"
                >
                  Coba Lagi
                </button>
              )}
            </div>
          )}

          {waStatus === "MINTA_SCAN" && qrCodeData && (
            <div className="flex flex-col items-center animate-fade-in">
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <SmartphoneNfc className="w-4 h-4" /> Belum Terhubung
              </p>
              <div className="bg-white p-2 rounded-xl border-2 border-gray-100 shadow-sm">
                <QRCode value={qrCodeData} size={120} />
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">Buka WA di HP ➔ Tautkan Perangkat ➔ Scan Barcode ini</p>
              <button
                onClick={handleNonaktifkanWA}
                disabled={isWaActionLoading}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-60 cursor-pointer"
              >
                <PowerOff className="w-4 h-4" /> Batalkan
              </button>
            </div>
          )}

          {waStatus === "TERKONEKSI" && (
            <div className="flex flex-col items-center animate-fade-in">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="text-base font-extrabold text-green-700">WhatsApp Aktif</h4>
              <p className="text-xs text-green-600 font-medium">Sistem siap mengirimkan pesan ke wali murid.</p>
              <button
                onClick={handleNonaktifkanWA}
                disabled={isWaActionLoading || isSending}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-60 cursor-pointer"
              >
                {isWaActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PowerOff className="w-4 h-4" />}
                Nonaktifkan
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Frame Utama Tabel */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm relative w-full max-w-5xl min-h-[400px]">
        
        {isLoading ? (
            <div className="absolute inset-0 flex flex-col justify-center items-center z-10 bg-white/80 rounded-2xl">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
              <p className="font-bold text-gray-500">Merekap absensi hari ini...</p>
            </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h3 className="text-xl font-extrabold text-black">Draf Laporan {infoKelas.kelas}</h3>
              <p className="text-sm font-semibold text-gray-600 mt-1">Periode: {infoKelas.tanggal}</p>
            </div>

            {/* Tabel Draf Laporan */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  
                  <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-800 font-bold">
                    <tr>
                      <th className="px-6 py-4 w-16 text-center">No</th>
                      <th className="px-6 py-4 w-48">Nama Siswa</th>
                      <th className="px-6 py-4 w-40 text-center">No. WA Wali</th>
                      <th className="px-6 py-4 text-center">Status Rekap</th>
                      <th className="px-6 py-4 text-center">Pratinjau</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {dataLaporan.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                          Tidak ada data siswa ditemukan di kelas ini.
                        </td>
                      </tr>
                    ) : (
                      dataLaporan.map((siswa, index) => (
                        <tr key={`${siswa.id_siswa}-${index}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-center font-bold text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4 font-semibold text-black">{siswa.nama_siswa}</td>
                          <td className="px-6 py-4 text-center font-mono text-gray-600 font-medium">{siswa.no_hp_wali || "-"}</td>
                          
                          <td className="px-6 py-4 text-center">
                            {siswa.jumlah_absen_terekam > 0 ? (
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                {siswa.jumlah_absen_terekam} Mapel Masuk
                              </span>
                            ) : (
                              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                                Belum Ada Input
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => lihatPreviewPesan(siswa.nama_siswa, siswa.pesan_whatsapp)}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" /> Lihat Pesan
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>

                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => fetchLaporan()}
                disabled={isSending}
                className="px-6 py-2.5 rounded-lg font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                Refresh Data
              </button>
              <button 
                onClick={handleKirim}
                disabled={isSending || dataLaporan.length === 0 || waStatus !== "TERKONEKSI"}
                className={`flex items-center gap-2 px-8 py-2.5 rounded-lg font-bold text-white transition-colors shadow-sm 
                  ${(isSending || dataLaporan.length === 0 || waStatus !== "TERKONEKSI") 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-black hover:bg-gray-800 cursor-pointer"}`}
              >
                {isSending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
                ) : (
                  <><Send className="w-4 h-4" /> Kirim Rekap ke WA</>
                )}
              </button>
            </div>

          </>
        )}
      </div>

    </main>
  );
}