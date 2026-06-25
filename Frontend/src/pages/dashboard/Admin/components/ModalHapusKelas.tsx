import React, { useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import Swal from "sweetalert2"; // 🔥 IMPORT SWEETALERT DI SINI

// Tipe Data Kelas disesuaikan dengan API Backend
interface KelasItem {
  id_kelas: string;
  nama_kelas: string;
  ruang_kelas: string;
}

interface ModalHapusKelasProps {
  kelas: KelasItem | null;
  onClose: () => void;
  onRefresh: () => void; // 🔥 AKTIFKAN KABEL REFRESH
}

export default function ModalHapusKelas({ kelas, onClose, onRefresh }: ModalHapusKelasProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Jika tidak ada data kelas yang dipilih, modal tidak akan muncul
  if (!kelas) return null;

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://187.127.121.139:3000/api/kelas/${kelas.id_kelas}`, {
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
          text: result.message || "Data kelas fisik berhasil dihapus.",
          icon: "success",
          confirmButtonColor: "#000000",
          confirmButtonText: "Selesai"
        }).then((res) => {
          if (res.isConfirmed) {
            onClose(); 
            onRefresh(); // 🔥 REFRESH HALAMAN OTOMATIS TANPA RELOAD
          }
        });
      } else {
        // 🔥 SweetAlert Error
        Swal.fire({
          title: "Gagal!",
          text: result.message || "Gagal menghapus data kelas.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
        setErrorMsg(result.message || "Gagal menghapus data kelas.");
      }
    } catch (error) {
      console.error("Error delete kelas:", error);
      Swal.fire({
        title: "Server Error",
        text: "Terjadi kesalahan server saat menghapus data.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      setErrorMsg("Terjadi kesalahan server saat menghapus data.");
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ikon Bahaya/Peringatan Merah */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-5 mt-2">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        {/* Teks Peringatan */}
        <h3 className="text-xl font-extrabold text-black mb-2">Hapus Ruang Kelas?</h3>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Apakah Anda yakin ingin menghapus kelas fisik <span className="font-bold text-gray-800">"{kelas.nama_kelas} - {kelas.ruang_kelas}"</span>? 
          <br />
          <span className="text-red-500 block mt-2 font-medium">Tindakan ini permanen. Semua data riwayat siswa yang pernah belajar di ruangan ini akan ikut terhapus!</span>
        </p>

        {/* Pesan Error */}
        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold text-left">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Tombol Konfirmasi Aksi */}
        <div className="flex gap-3 justify-center">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-5 py-2.5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-sm cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button 
            onClick={handleConfirmDelete}
            disabled={isLoading}
            className="flex-1 flex justify-center items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors text-sm cursor-pointer disabled:bg-gray-500"
          >
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menghapus...</> : "Ya, Hapus Kelas"}
          </button>
        </div>

      </div>
    </div>
  );
}