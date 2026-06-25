import React, { useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import Swal from "sweetalert2"; 

interface ModalTambahMapelProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void; 
}

export default function ModalTambahMapel({ isOpen, onClose, onRefresh }: ModalTambahMapelProps) {
  // 1. State Penampung Data Input
  const [mapel, setMapel] = useState("");
  // 🔥 TAMBAHAN: State untuk menangkap nilai kelompok (default: UMUM)
  const [kelompok, setKelompok] = useState("UMUM"); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  // 2. Fungsi Eksekusi Simpan ke Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch("http://187.127.121.139:3000/api/mapel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          mapel: mapel, 
          kelompok: kelompok // 🔥 TAMBAHAN: Kirim data kelompok ke backend
        })
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          title: "Berhasil!",
          text: result.message || "Data mata pelajaran berhasil ditambahkan.",
          icon: "success",
          confirmButtonColor: "#000000",
          confirmButtonText: "Selesai"
        }).then((result) => {
          if (result.isConfirmed) {
            // Reset form setelah sukses
            setMapel("");
            setKelompok("UMUM"); // 🔥 Reset kelompok ke default
            onClose(); 
            onRefresh(); 
          }
        });
      } else {
        Swal.fire({
          title: "Gagal!",
          text: result.message || "Gagal menyimpan mata pelajaran.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
        setErrorMsg(result.message || "Gagal menyimpan mata pelajaran.");
      }
    } catch (error) {
      console.error("Error tambah mapel:", error);
      Swal.fire({
        title: "Server Error",
        text: "Terjadi kesalahan pada server.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      setErrorMsg("Terjadi kesalahan pada server saat menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      
      {/* Overlay Gelap */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Kotak Form Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 md:p-8 animate-fade-in z-10">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-extrabold text-black">Tambah Mata Pelajaran</h3>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Area Pesan Error */}
        {errorMsg && (
          <div className="mb-5 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold flex items-center gap-2">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nama Mata Pelajaran <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={mapel}
              onChange={(e) => setMapel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm" 
              placeholder="Cth: Pendidikan Pancasila dan Kewarganegaraan" 
              required
            />
          </div>

          {/* 🔥 TAMBAHAN: Dropdown untuk Kelompok */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Kelompok <span className="text-red-500">*</span>
            </label>
            <select 
              value={kelompok}
              onChange={(e) => setKelompok(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm bg-white cursor-pointer" 
              required
            >
              <option value="UMUM">Umum</option>
              <option value="MULOK">Muatan Lokal</option>
              <option value="KEJURUAN">Kejuruan</option>
            </select>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button 
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors cursor-pointer text-sm disabled:opacity-50"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg font-semibold bg-black text-white hover:bg-gray-800 transition-colors cursor-pointer text-sm shadow-sm flex items-center gap-2 disabled:bg-gray-500"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
              ) : (
                <><Save className="w-4 h-4" /> Simpan Data</>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
