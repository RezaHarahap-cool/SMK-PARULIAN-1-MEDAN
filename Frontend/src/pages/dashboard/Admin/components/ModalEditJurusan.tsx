import React, { useState, useEffect } from "react";
import { X, Loader2, Save } from "lucide-react";
import Swal from "sweetalert2"; // 🔥 IMPORT SWEETALERT DI SINI

// Tipe Data Dasar dari Tabel (Untuk Props)
interface JurusanItem {
  id: string;
  nama: string;
  status: "Aktif" | "Non-Aktif"; // Format dari tabel UI
}

interface ModalEditJurusanProps {
  jurusan: JurusanItem | null;
  onClose: () => void;
  onRefresh: () => void; // 🔥 AKTIFKAN KABEL REFRESH
}

export default function ModalEditJurusan({ jurusan, onClose, onRefresh }: ModalEditJurusanProps) {
  // 1. State Penampung Data form
  const [formData, setFormData] = useState({
    id: "",
    nama: "",
    status: "AKTIF" 
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Otomatis isi form dengan data jurusan yang diklik
  useEffect(() => {
    if (jurusan) {
      setFormData({
        id: jurusan.id,
        nama: jurusan.nama,
        status: jurusan.status === "Aktif" ? "AKTIF" : "NON_AKTIF"
      });
      setErrorMsg(""); 
    }
  }, [jurusan]);

  if (!jurusan) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Eksekusi Update ke API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://187.127.121.139:3000/api/jurusan/${formData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          jurusan: formData.nama,
          status: formData.status
        })
      });

      const result = await response.json();

      if (result.success) {
        // 🔥 GANTI ALERT JADUL DENGAN SWEETALERT2
        Swal.fire({
          title: "Berhasil Update!",
          text: result.message || "Data jurusan berhasil diperbarui.",
          icon: "success",
          confirmButtonColor: "#2563eb", // Warna biru (sesuai tombol Simpan Perubahan)
          confirmButtonText: "Selesai"
        }).then((result) => {
          if (result.isConfirmed) {
            onClose(); 
            onRefresh(); // 🔥 REFRESH TABEL OTOMATIS
          }
        });
      } else {
        // 🔥 SweetAlert Error
        Swal.fire({
          title: "Gagal Update!",
          text: result.message || "Gagal memperbarui data jurusan.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
        setErrorMsg(result.message || "Gagal memperbarui data jurusan.");
      }
    } catch (error) {
      console.error("Error update jurusan:", error);
      Swal.fire({
        title: "Server Error",
        text: "Terjadi kesalahan pada server.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      setErrorMsg("Terjadi kesalahan pada server saat memperbarui data.");
    } finally {
      setIsSaving(false);
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
      <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 animate-fade-in z-10 custom-scrollbar">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-extrabold text-black">Edit Data Jurusan</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold flex items-center gap-2">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nama Jurusan Lengkap <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm" 
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Status Jurusan <span className="text-red-500">*</span>
            </label>
            <select 
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-white cursor-pointer font-semibold"
            >
              <option value="AKTIF">Aktif</option>
              <option value="NON_AKTIF">Non-Aktif</option>
            </select>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button 
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors cursor-pointer text-sm disabled:opacity-50"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-lg font-semibold bg-black text-white hover:bg-gray-800 transition-colors shadow-lg cursor-pointer text-sm shadow-sm flex items-center gap-2 disabled:bg-black"
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
              ) : (
                <><Save className="w-4 h-4" /> Simpan Perubahan</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}