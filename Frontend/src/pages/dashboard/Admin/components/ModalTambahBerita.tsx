import React, { useState } from "react";
import { X, UploadCloud, Loader2, Save } from "lucide-react";
import Swal from "sweetalert2"; // 🔥 IMPORT SWEETALERT DI SINI
import { apiUrl } from "../../../../lib/api";

interface ModalTambahBeritaProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void; // 🔥 AKTIFKAN KABEL REFRESH
}

export default function ModalTambahBerita({ isOpen, onClose, onRefresh }: ModalTambahBeritaProps) {
  // 1. State untuk inputan teks
  const [formData, setFormData] = useState({
    judul: "",
    jenis_berita: "",
    content: "",
  });

  // 2. State khusus untuk file gambar
  const [foto, setFoto] = useState<File | null>(null);
  
  // 3. State untuk status loading dan error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Reset form setiap kali modal ditutup
  const handleClose = () => {
    setFormData({ judul: "", jenis_berita: "", content: "" });
    setFoto(null);
    setErrorMsg("");
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFoto(e.target.files[0]);
    }
  };

  // 4. Proses Submit Data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("Sesi Anda telah habis. Silakan login kembali.");
        setIsLoading(false);
        return;
      }

      // --- LOGIKA OTOMATISASI ADMIN ID ---
      // Membongkar (Decode) token JWT secara manual untuk mengambil ID admin
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      
      // Ambil ID dari token (Bisa id_users, id_admin, atau id, tergantung struktur tokenmu)
      const adminIdOtomatis = decodedPayload.id_admin || decodedPayload.id_users || decodedPayload.id;

      // --- PERSIAPAN PENGIRIMAN DATA (Form Data untuk mendukung Gambar) ---
      const dataToSend = new FormData();
      dataToSend.append("judul", formData.judul);
      dataToSend.append("jenis_berita", formData.jenis_berita);
      dataToSend.append("content", formData.content);
      dataToSend.append("admin_id", adminIdOtomatis); // Sisipkan ID secara gaib!

      if (foto) {
        dataToSend.append("foto", foto); // Masukkan gambar jika admin memilih gambar
      }

      // --- TEMBAK KE API BACKEND ---
      const response = await fetch(apiUrl("/api/berita"), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
          // Catatan: Jangan set "Content-Type" manual menjadi application/json
          // karena kita mengirim file (FormData). Browser akan mengaturnya otomatis.
        },
        body: dataToSend,
      });

      const result = await response.json();

      if (result.success) {
        // 🔥 GANTI ALERT JADUL DENGAN SWEETALERT2
        Swal.fire({
          title: "Berhasil!",
          text: result.message || "Berita berhasil dipublikasikan.",
          icon: "success",
          confirmButtonColor: "#000000",
          confirmButtonText: "Selesai"
        }).then((res) => {
          if (res.isConfirmed) {
            handleClose();
            onRefresh(); // 🔥 OTOMATIS REFRESH HALAMAN TANPA RELOAD
          }
        });
      } else {
        // 🔥 SweetAlert Error
        Swal.fire({
          title: "Gagal!",
          text: result.message || "Gagal menyimpan berita.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
        setErrorMsg(result.message || "Gagal menyimpan berita.");
      }
    } catch (error) {
      console.error("Error submit berita:", error);
      Swal.fire({
        title: "Server Error",
        text: "Terjadi kesalahan pada server saat mengirim data.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      setErrorMsg("Terjadi kesalahan pada server.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay Gelap */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Kotak Form Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 animate-fade-in z-10 custom-scrollbar">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <h3 className="text-xl font-extrabold text-black">Tulis Berita Baru</h3>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Gambar Sampul (Opsional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group relative overflow-hidden">
              <input 
                type="file" 
                name="foto"
                accept="image/png, image/jpeg, image/jpg" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-10 w-10 text-gray-400 group-hover:text-black transition-colors" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <p className="font-semibold text-blue-600 hover:text-blue-500">
                    {foto ? foto.name : "Klik untuk upload file"}
                  </p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max 2MB)</p>
              </div>
            </div>
          </div>
          
          {/* Judul Berita */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Judul Berita <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="judul"
              value={formData.judul}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm" 
              placeholder="Masukkan judul berita yang menarik..." 
              required
            />
          </div>

          {/* Kategori (Disesuaikan dengan ENUM Prisma) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select 
              name="jenis_berita"
              value={formData.jenis_berita}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm bg-white cursor-pointer"
              required
            >
              <option value="" disabled>-- Pilih Kategori --</option>
              <option value="Pengumuman">Pengumuman</option>
              <option value="Kegiatan_Prestasi">Kegiatan & Prestasi</option>
              <option value="Akademik">Akademik</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">*Tanggal terbit akan tercatat secara otomatis saat berita disimpan.</p>
          </div>

          {/* Isi Berita (Textarea) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Isi Berita <span className="text-red-500">*</span>
            </label>
            <textarea 
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm resize-none custom-scrollbar" 
              placeholder="Tuliskan isi berita atau pengumuman secara lengkap di sini..." 
              required
            ></textarea>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button 
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-5 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors cursor-pointer text-sm"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg font-semibold bg-black text-white hover:bg-gray-800 transition-colors cursor-pointer text-sm shadow-sm flex items-center gap-2"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</> : <><Save className="w-4 h-4" /> Publikasikan</>}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
