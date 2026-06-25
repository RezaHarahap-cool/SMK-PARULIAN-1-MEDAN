import React, { useState, useEffect } from "react";
import { X, UploadCloud, Loader2, Save } from "lucide-react";
import Swal from "sweetalert2"; // 🔥 IMPORT SWEETALERT DI SINI
import { apiUrl } from "../../../../lib/api";

// Tipe Data Berita
interface BeritaItem {
  id_berita: string;
  judul: string;
  jenis_berita: string;
  tanggal_publikasi: string;
  content: string;
  foto?: string | null;
}

interface ModalEditBeritaProps {
  berita: BeritaItem | null;
  onClose: () => void;
  onRefresh: () => void; // 🔥 AKTIFKAN KABEL REFRESH
}

export default function ModalEditBerita({ berita, onClose, onRefresh }: ModalEditBeritaProps) {
  // State Input Teks
  const [formData, setFormData] = useState({
    judul: "",
    jenis_berita: "",
    content: "",
  });

  // State Khusus File Gambar
  const [fotoBaru, setFotoBaru] = useState<File | null>(null);

  // State Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Otomatis isi form dengan data berita saat modal terbuka
  useEffect(() => {
    if (berita) {
      setFormData({
        judul: berita.judul || "",
        jenis_berita: berita.jenis_berita || "",
        content: berita.content || "",
      });
      setFotoBaru(null); // Reset pilihan gambar
      setErrorMsg("");
    }
  }, [berita]);

  if (!berita) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFotoBaru(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      
      // Gunakan FormData karena berpotensi membawa file gambar
      const dataToSend = new FormData();
      dataToSend.append("judul", formData.judul);
      dataToSend.append("jenis_berita", formData.jenis_berita);
      dataToSend.append("content", formData.content);
      
      if (fotoBaru) {
        dataToSend.append("foto", fotoBaru);
      }

      const response = await fetch(apiUrl(`/api/berita/${berita.id_berita}`), {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: dataToSend,
      });

      const result = await response.json();

      if (result.success) {
        // 🔥 GANTI ALERT JADUL DENGAN SWEETALERT2
        Swal.fire({
          title: "Berhasil Update!",
          text: result.message || "Berita berhasil diperbarui.",
          icon: "success",
          confirmButtonColor: "#000000",
          confirmButtonText: "Selesai"
        }).then((res) => {
          if (res.isConfirmed) {
            onClose(); 
            onRefresh(); // 🔥 REFRESH TABEL OTOMATIS TANPA RELOAD
          }
        });
      } else {
        // 🔥 SweetAlert Error
        Swal.fire({
          title: "Gagal Update!",
          text: result.message || "Gagal memperbarui berita.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
        setErrorMsg(result.message || "Gagal memperbarui berita.");
      }
    } catch (error) {
      console.error("Error update berita:", error);
      Swal.fire({
        title: "Server Error",
        text: "Terjadi kesalahan pada server saat memperbarui data.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      setErrorMsg("Terjadi kesalahan pada server saat memperbarui data.");
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
      <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 animate-fade-in z-10 custom-scrollbar">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <h3 className="text-xl font-extrabold text-black">Edit Berita</h3>
          <button 
            onClick={onClose}
            disabled={isLoading}
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
          
          <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium border border-blue-100">
            ℹ️ Kosongkan bagian gambar jika tidak ingin mengubah sampul saat ini.
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Ganti Gambar / Thumbnail (Opsional)
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
                    {fotoBaru ? fotoBaru.name : "Klik untuk pilih gambar baru"}
                  </p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 2MB</p>
              </div>
            </div>
          </div>
          
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
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <option value="Pengumuman">Pengumuman</option>
                <option value="Kegiatan_Prestasi">Kegiatan & Prestasi</option>
                <option value="Akademik">Akademik</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal Terbit</label>
              <input 
                type="text" 
                value={new Date(berita.tanggal_publikasi).toLocaleDateString('id-ID')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 outline-none text-sm cursor-not-allowed" 
                disabled
              />
            </div>
          </div>

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
              required
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button 
              type="button"
              onClick={onClose}
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
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Save className="w-4 h-4" /> Simpan Perubahan</>}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
