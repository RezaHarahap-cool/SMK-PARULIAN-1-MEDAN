import React, { useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import Swal from "sweetalert2"; // 🔥 IMPORT SWEETALERT DI SINI

// Tipe Data Siswa (Sesuai dengan tabel utama)
interface SiswaItem {
  id: string; // id_siswa
  nis: string;
  nama: string;
  jk: "L" | "P";
  kelas: string;
  jurusan: string;
  namaAyah: string;
  noHpWali: string;
  foto: string;
}

interface ModalHapusSiswaProps {
  siswa: SiswaItem | null;
  onClose: () => void;
}

export default function ModalHapusSiswa({ siswa, onClose }: ModalHapusSiswaProps) {
  // State untuk melacak proses loading dan error
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Jika tidak ada data siswa yang dipilih, modal tidak akan muncul
  if (!siswa) return null;

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");

      // Mengarah langsung ke endpoint DELETE Siswa yang baru dibuat
      const response = await fetch(`http://187.127.121.139:3000/api/siswa/${siswa.id}`, {
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
          text: result.message || "Data siswa berhasil dihapus permanen.",
          icon: "success",
          confirmButtonColor: "#000000", // Warna hitam elegan
          confirmButtonText: "Selesai"
        }).then((result) => {
          if (result.isConfirmed) {
            onClose(); // Menutup modal sekaligus me-refresh tabel otomatis dari parent
          }
        });
      } else {
        // 🔥 SweetAlert untuk Error dari API
        Swal.fire({
          title: "Gagal!",
          text: result.message || "Gagal menghapus data siswa.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
        setErrorMsg(result.message || "Gagal menghapus data siswa.");
      }
    } catch (error) {
      console.error("Error saat menghapus siswa:", error);
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
      
      {/* Overlay Gelap (Backdrop) */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        // Cegah tutup modal dengan klik di luar jika sedang dalam proses menghapus
        onClick={!isDeleting ? onClose : undefined} 
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
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-5 mt-2 shadow-sm">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        {/* Teks Peringatan */}
        <h3 className="text-xl font-extrabold text-black mb-2">Hapus Permanen?</h3>
        <p className="text-gray-500 text-sm mb-4 leading-relaxed">
          Anda yakin ingin menghapus siswa bernama <span className="font-bold text-gray-800">"{siswa.nama}"</span> dengan NIS <span className="font-semibold text-gray-700">{siswa.nis}</span>? 
          <br />
          <span className="text-red-500 block mt-2 font-medium">Tindakan ini tidak bisa dibatalkan. Semua data riwayat kelas, nilai, absensi, akun login, dan foto siswa ini akan ikut terhapus.</span>
        </p>

        {/* Kotak Pesan Error (Muncul jika API gagal) */}
        {errorMsg && (
          <div className="mb-5 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Tombol Konfirmasi Aksi */}
        <div className="flex gap-3 justify-center mt-4">
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
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-extrabold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors text-sm cursor-pointer disabled:bg-red-400"
          >
            {isDeleting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Menghapus...</>
            ) : (
              "Ya, Hapus Siswa"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}