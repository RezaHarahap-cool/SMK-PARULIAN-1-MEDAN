import React, { useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import Swal from "sweetalert2"; // 🔥 IMPORT SWEETALERT DI SINI

// Tipe data guru
interface GuruItem {
  id: string;
  nama: string;
  jk: "L" | "P";
  ijazah: string;
  mapel: string;
  noHp: string;
  foto: string;
}

interface ModalHapusGuruProps {
  guru: GuruItem | null;
  onClose: () => void;
  onRefresh: () => void; // 🔥 AKTIFKAN KABEL REFRESH
}

export default function ModalHapusGuru({ guru, onClose, onRefresh }: ModalHapusGuruProps) {
  // State untuk melacak proses loading dan error
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Jika tidak ada data yang dipilih, jangan render apa-apa
  if (!guru) return null;

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://187.127.121.139:3000/api/guru/${guru.id}`, {
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
          text: result.message || "Data guru berhasil dihapus permanen.",
          icon: "success",
          confirmButtonColor: "#000000", // Warna hitam senada
          confirmButtonText: "Selesai"
        }).then((result) => {
          if (result.isConfirmed) {
            onClose(); // Tutup modal konfirmasi
            onRefresh(); // 🔥 REFRESH TABEL OTOMATIS
          }
        });
      } else {
        // Tampilkan popup error jika gagal dari backend
        Swal.fire({
          title: "Gagal!",
          text: result.message || "Gagal menghapus data guru.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
        setErrorMsg(result.message || "Gagal menghapus data guru.");
      }
    } catch (error) {
      console.error("Error saat menghapus:", error);
      Swal.fire({
        title: "Server Error",
        text: "Terjadi kesalahan pada server saat menghapus data.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      setErrorMsg("Terjadi kesalahan pada server saat menghapus data.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      
      {/* Overlay Gelap */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        // Cegah klik di luar modal saat sedang loading hapus
        onClick={!isDeleting ? onClose : undefined} 
      ></div>

      {/* Kotak Modal Konfirmasi */}
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 md:p-8 animate-fade-in z-10 text-center">
        
        {/* Tombol Close (X) di pojok kanan atas */}
        <button 
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ikon Peringatan (Warning) */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-5 mt-2">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        {/* Teks Konfirmasi */}
        <h3 className="text-xl font-extrabold text-black mb-2">Hapus Data Guru?</h3>
        <p className="text-gray-500 text-sm mb-4 leading-relaxed">
          Apakah Anda yakin ingin menghapus data <span className="font-bold text-gray-800">"{guru.nama}"</span>? Tindakan ini tidak dapat dibatalkan dan data akan hilang secara permanen.
        </p>

        {/* Tampilkan pesan error di dalam modal jika API gagal */}
        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Tombol Aksi */}
        <div className="flex gap-3 justify-center mt-6">
          <button 
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-5 py-2.5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
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
              "Ya, Hapus Data"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}