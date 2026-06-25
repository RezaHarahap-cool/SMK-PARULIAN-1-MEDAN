import React, { useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import Swal from "sweetalert2"; // 🔥 IMPORT SWEETALERT DI SINI
import { apiUrl } from "../../../../lib/api";

// 1. Tipe Data Berita (Disesuaikan persis dengan halaman DataBeritaContent)
export interface BeritaItem {
  id_berita: string;
  judul: string;
  jenis_berita: string; 
  tanggal_publikasi: string;
  content: string;
  foto?: string | null; 
}

interface ModalHapusBeritaProps {
  berita: BeritaItem | null;
  onClose: () => void;
  onRefresh: () => void; // 🔥 AKTIFKAN KABEL REFRESH
}

export default function ModalHapusBerita({ berita, onClose, onRefresh }: ModalHapusBeritaProps) {
  // State untuk loading dan error handling
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Jika tidak ada data berita yang dipilih, modal tidak akan muncul
  if (!berita) return null;

  // Fungsi Eksekusi Hapus ke Backend API
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      
      // Tembak API dengan method DELETE
      const response = await fetch(apiUrl(`/api/berita/${berita.id_berita}`), {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        // 🔥 GANTI ALERT JADUL DENGAN SWEETALERT2
        Swal.fire({
          title: "Terhapus!",
          text: result.message || "Berita berhasil dihapus secara permanen.",
          icon: "success",
          confirmButtonColor: "#000000",
          confirmButtonText: "Selesai"
        }).then((res) => {
          if (res.isConfirmed) {
            onClose(); // Tutup modal
            onRefresh(); // 🔥 REFRESH TABEL OTOMATIS
          }
        });
      } else {
        // 🔥 SweetAlert Error
        Swal.fire({
          title: "Gagal!",
          text: result.message || "Gagal menghapus berita.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
        setErrorMsg(result.message || "Gagal menghapus berita.");
      }
    } catch (error) {
      console.error("Gagal menghapus berita:", error);
      Swal.fire({
        title: "Server Error",
        text: "Terjadi kesalahan pada server.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      setErrorMsg("Terjadi kesalahan pada server. Pastikan backend menyala.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      
      {/* Overlay Gelap (Backdrop) */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Kotak Modal Konfirmasi */}
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 md:p-8 animate-fade-in z-10 text-center">
        
        {/* Tombol Silang (X) */}
        <button 
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ikon Bahaya/Peringatan Merah */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-5 mt-2">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        {/* Teks Peringatan */}
        <h3 className="text-xl font-extrabold text-black mb-2">Hapus Berita?</h3>
        <p className="text-gray-500 text-sm mb-4 leading-relaxed">
          Apakah Anda yakin ingin menghapus berita <span className="font-bold text-gray-800">"{berita.judul}"</span>? 
          <br />
          <span className="text-red-500 block mt-2 font-medium">Tindakan ini permanen dan artikel yang dihapus tidak dapat dikembalikan.</span>
        </p>

        {/* Area Pesan Error */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-semibold text-left">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Tombol Konfirmasi Aksi */}
        <div className="flex gap-3 justify-center mt-2">
          <button 
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-5 py-2.5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-sm cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button 
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors text-sm cursor-pointer disabled:bg-red-400"
          >
            {isDeleting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Menghapus...</>
            ) : (
              "Ya, Hapus Berita"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
