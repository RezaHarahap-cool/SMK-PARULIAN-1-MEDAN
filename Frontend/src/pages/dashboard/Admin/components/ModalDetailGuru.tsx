import React, { useState, useEffect } from "react";
import { 
  X, UserCircle, BookOpen, GraduationCap, 
  Phone, User, Image as ImageIcon,
  Mail, Calendar, Heart, ShieldCheck, Loader2
} from "lucide-react";

// Tipe Data Dasar dari Tabel
interface GuruItem {
  id: string;
  nama: string;
  jk: "L" | "P";
  ijazah: string;
  mapel: string;
  noHp: string;
  foto: string;
}

// Tipe Data Lengkap Hasil Fetch API
interface GuruDetailLengkap {
  username: string;
  email: string;
  is_active: boolean;
  tgl_lahir: string;
  agama: string;
}

interface ModalDetailGuruProps {
  guru: GuruItem | null;
  onClose: () => void;
}

export default function ModalDetailGuru({ guru, onClose }: ModalDetailGuruProps) {
  const [detailLengkap, setDetailLengkap] = useState<GuruDetailLengkap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Efek ini jalan setiap kali modal dibuka (guru tidak null)
  useEffect(() => {
    if (guru) {
      const fetchDetailGuru = async () => {
        setIsLoading(true);
        setErrorMsg("");
        
        try {
          const token = localStorage.getItem("token");
          // Sesuaikan URL rute ini dengan rute backend-mu
          const res = await fetch(`http://187.127.121.139:3000/api/guru/${guru.id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          
          const result = await res.json();
          
          if (result.success) {
            // Ubah format tanggal ISO ke tanggal lokal Indonesia
            const tglLahirMentah = new Date(result.data.guru.tgl_lahir);
            const tglLahirFormatted = tglLahirMentah.toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric'
            });

            setDetailLengkap({
              username: result.data.username,
              email: result.data.email,
              is_active: result.data.is_active,
              tgl_lahir: tglLahirFormatted,
              agama: result.data.guru.agama
            });
          } else {
            setErrorMsg(result.message);
          }
        } catch (error) {
          console.error("Gagal menarik detail:", error);
          setErrorMsg("Gagal terhubung ke server.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchDetailGuru();
    } else {
      // Bersihkan state jika modal ditutup
      setDetailLengkap(null);
    }
  }, [guru]);

  if (!guru) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in z-10 flex flex-col">
        
        {/* Header Modal */}
        <div className="bg-[#f8f9fa] border-b border-gray-100 px-6 py-4 flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold text-black flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-gray-500" /> Profil Lengkap Guru
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 bg-white rounded-full shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State Area */}
        {isLoading && (
          <div className="p-10 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-black" />
            <p className="text-sm font-medium">Menarik data dari database...</p>
          </div>
        )}

        {/* Error State Area */}
        {!isLoading && errorMsg && (
          <div className="p-6">
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center font-medium">
              {errorMsg}
            </div>
          </div>
        )}

        {/* Body Content Area - Tampil jika loading selesai dan tidak error */}
        {!isLoading && !errorMsg && detailLengkap && (
          <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-center lg:items-start overflow-y-auto custom-scrollbar">
            
            {/* Bagian Kiri: Foto & Status Akun */}
            <div className="flex flex-col gap-4 shrink-0">
              <div className="w-48 h-64 bg-gray-100 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm relative flex items-center justify-center">
                {guru.foto ? (
                  <img 
                    src={guru.foto} 
                    alt={`Foto ${guru.nama}`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                    <span className="text-xs font-semibold">Tidak ada foto</span>
                  </div>
                )}
              </div>

              {/* Lencana Status Akun */}
              <div className={`py-2 px-3 rounded-lg text-center font-bold text-sm flex items-center justify-center gap-2 ${detailLengkap.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <ShieldCheck className="w-4 h-4" /> 
                {detailLengkap.is_active ? "Akun Aktif" : "Akun Nonaktif"}
              </div>
            </div>

            {/* Bagian Kanan: Informasi Data Grid */}
            <div className="flex-1 w-full space-y-6">
              
              {/* Header Nama & Mapel (Aksen Utama) */}
              <div className="border-b border-gray-100 pb-4">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Lengkap</p>
                <h4 className="text-2xl lg:text-3xl font-extrabold text-black leading-tight mb-2">
                  {guru.nama}
                </h4>
                <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1.5 rounded-md text-sm font-semibold">
                  <BookOpen className="w-4 h-4" /> {guru.mapel}
                </div>
              </div>

              {/* Grid 2 Kolom untuk Biodata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Kolom Kiri */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-0.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Username Login
                    </p>
                    <p className="font-bold text-black bg-gray-50 p-2 rounded-lg border border-gray-100">
                      @{detailLengkap.username}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-0.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Email
                    </p>
                    <p className="font-bold text-black break-all">{detailLengkap.email}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-0.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> No. Handphone
                    </p>
                    <p className="font-bold text-black">{guru.noHp}</p>
                  </div>
                </div>

                {/* Kolom Kanan */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-0.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Tanggal Lahir
                    </p>
                    <p className="font-bold text-black">{detailLengkap.tgl_lahir}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-0.5 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5" /> Agama
                    </p>
                    <p className="font-bold text-black">{detailLengkap.agama || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-0.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Jenis Kelamin
                    </p>
                    <p className="font-bold text-black">
                      {guru.jk === "L" ? "Laki-laki" : "Perempuan"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-0.5 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" /> Ijazah Tertinggi
                    </p>
                    <p className="font-bold text-black">{guru.ijazah}</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
