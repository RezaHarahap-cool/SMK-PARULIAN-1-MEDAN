import React, { useState, useEffect } from "react";
import { 
  X, UserCircle, GraduationCap, Mail, 
  User, CheckCircle2, XCircle, Phone,
  Image as ImageIcon, CalendarDays, Book, Loader2, Fingerprint
} from "lucide-react";

// Tipe Data Dasar dari Tabel (Hanya untuk Prop ID)
interface KepsekItem {
  id: string;
  nama: string;
  jk: "L" | "P";
  ijazah: string;
  tugas: string;
  noHp: string;
  foto: string;
  status: "Aktif" | "Non-Aktif";
}

interface ModalDetailKepsekProps {
  kepsek: KepsekItem | null;
  onClose: () => void;
}

export default function ModalDetailKepsek({ kepsek, onClose }: ModalDetailKepsekProps) {
  const [detailData, setDetailData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Ambil detail lengkap dari backend saat modal dibuka
  useEffect(() => {
    if (kepsek) {
      const fetchDetail = async () => {
        setIsLoading(true);
        setErrorMsg("");
        try {
          const token = localStorage.getItem("token");
          // Pastikan URL ini sesuai dengan rute backend-mu
          const response = await fetch(`http://187.127.121.139:3000/api/kepsek/${kepsek.id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const result = await response.json();

          if (result.success) {
            setDetailData(result.data);
          } else {
            setErrorMsg(result.message || "Gagal mengambil detail data.");
          }
        } catch (error) {
          console.error("Error fetching detail:", error);
          setErrorMsg("Terjadi kesalahan koneksi ke server.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchDetail();
    } else {
      setDetailData(null);
    }
  }, [kepsek]);

  // Jika tidak ada data yang dipilih, jangan tampilkan modal
  if (!kepsek) return null;

  // Fungsi untuk memformat tanggal ke format Indonesia
  const formatTanggal = (tanggal: string) => {
    if (!tanggal) return "-";
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      
      {/* Overlay Gelap */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Kotak Modal Detail */}
      <div className="relative bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in z-10 custom-scrollbar flex flex-col">
        
        {/* Header Modal */}
        <div className="bg-[#f8f9fa] border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shrink-0 rounded-t-3xl">
          <h3 className="text-lg font-bold text-black flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-gray-500" /> Profil Detail Pimpinan / Staf
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 bg-white rounded-full shadow-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-black" />
            <p className="text-sm font-medium">Menarik data dari server...</p>
          </div>
        ) : errorMsg ? (
          <div className="p-10 text-center">
            <div className="inline-block p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
              {errorMsg}
            </div>
          </div>
        ) : detailData ? (
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
            
            {/* Bagian Kiri: Foto Profil */}
            <div className="w-40 h-48 md:w-56 md:h-72 flex-shrink-0 bg-gray-100 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm relative flex items-center justify-center">
              {detailData.kepala_sekolah?.foto ? (
                <img 
                  src={`http://187.127.121.139:3000/uploads/${detailData.kepala_sekolah.foto}`} 
                  alt={`Foto ${detailData.kepala_sekolah.nama_ks}`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                  <span className="text-xs font-semibold">Tidak ada foto</span>
                </div>
              )}
            </div>

            {/* Bagian Kanan: Informasi Data */}
            <div className="flex-1 w-full space-y-6">
              
              {/* Nama Lengkap & Badge Status */}
              <div className="space-y-3 text-center md:text-left">
                <h4 className="text-2xl md:text-3xl font-extrabold text-black leading-tight">
                  {detailData.kepala_sekolah?.nama_ks || detailData.username}
                </h4>
                <div className="flex justify-center md:justify-start gap-2">
                  <span 
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                      detailData.is_active 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {detailData.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {detailData.is_active ? "Status Akun Aktif" : "Akun Non-Aktif"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                    {detailData.role.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Grid Informasi Detail (Disesuaikan dengan Database) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5" /> Username Akun
                  </p>
                  <p className="font-bold text-gray-900">{detailData.username}</p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </p>
                  <p className="font-bold text-gray-900">{detailData.email}</p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" /> Tanggal Lahir
                  </p>
                  <p className="font-bold text-gray-900">
                    {formatTanggal(detailData.kepala_sekolah?.tgl_lahir)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Jenis Kelamin
                  </p>
                  <p className="font-bold text-gray-900">
                    {detailData.kepala_sekolah?.gender}
                  </p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                    <Book className="w-3.5 h-3.5" /> Agama
                  </p>
                  <p className="font-bold text-gray-900">
                    {detailData.kepala_sekolah?.agama || "-"}
                  </p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> No. HP
                  </p>
                  <p className="font-bold text-gray-900">
                    {detailData.kepala_sekolah?.no_hp || "-"}
                  </p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" /> Pendidikan Tertinggi
                  </p>
                  <p className="font-bold text-gray-900">
                    {detailData.kepala_sekolah?.pendidikan_tertinggi || "-"}
                  </p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" /> Mulai Menjabat
                  </p>
                  <p className="font-bold text-gray-900">
                    {formatTanggal(detailData.kepala_sekolah?.mulai_menjabat)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" /> Selesai Menjabat
                  </p>
                  <p className="font-bold text-gray-900">
                    {formatTanggal(detailData.kepala_sekolah?.selesai_menjabat)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Status Jabatan
                  </p>
                  <p className="font-bold text-gray-900">
                    {detailData.kepala_sekolah?.status_jabatan === "NON_AKTIF" ? "Non-Aktif Menjabat" : "Aktif Menjabat"}
                  </p>
                </div>

              </div>

            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
}
