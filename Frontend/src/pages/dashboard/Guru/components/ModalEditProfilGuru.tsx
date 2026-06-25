import React, { useState, useEffect } from "react";
import { X, UploadCloud } from "lucide-react";

// Tipe Data Guru (Sesuai dengan tabel guru_profiles)
interface GuruProfile {
  id_guru: number;
  users_id: number;
  nama_guru: string;
  tgl_lahir: string;
  gender: "Wanita" | "Pria";
  agama: string;
  pendidikan_tertinggi: string;
  no_hp: string;
  foto: string | null;
  mapel_id: number;
  nama_mapel?: string; 
}

interface ModalEditProfilGuruProps {
  isOpen: boolean;
  guruData: GuruProfile | null;
  onClose: () => void;
}

export default function ModalEditProfilGuru({ isOpen, guruData, onClose }: ModalEditProfilGuruProps) {
  const [formData, setFormData] = useState<GuruProfile | null>(null);

  // Pre-fill form saat modal dibuka
  useEffect(() => {
    if (guruData && isOpen) {
      // Format tanggal ke YYYY-MM-DD agar cocok dengan input type="date"
      const formattedDate = new Date(guruData.tgl_lahir).toISOString().split('T')[0];
      setFormData({ ...guruData, tgl_lahir: formattedDate });
    }
  }, [guruData, isOpen]);

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Data Profil Guru yang di-update:", formData);
    // Logika API PUT/PATCH ke PostgreSQL di sini
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      
      {/* Overlay Gelap */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Kotak Form Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 animate-fade-in z-10 custom-scrollbar">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-extrabold text-black">Edit Profil Guru</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Baris 1: Nama Lengkap */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap & Gelar</label>
            <input 
              type="text" 
              name="nama_guru"
              value={formData.nama_guru}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-medium" 
              required
            />
          </div>

          {/* Baris 2: Tanggal Lahir & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal Lahir</label>
              <input 
                type="date" 
                name="tgl_lahir"
                value={formData.tgl_lahir}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm cursor-pointer font-medium" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Jenis Kelamin</label>
              <select 
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-white cursor-pointer font-medium"
              >
                <option value="Pria">Pria</option>
                <option value="Wanita">Wanita</option>
              </select>
            </div>
          </div>

          {/* Baris 3: Agama & Pendidikan Tertinggi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Agama</label>
              <select 
                name="agama"
                value={formData.agama}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-white cursor-pointer font-medium"
              >
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Pendidikan Tertinggi</label>
              <input 
                type="text" 
                name="pendidikan_tertinggi"
                value={formData.pendidikan_tertinggi}
                onChange={handleChange}
                placeholder="Cth: S1 Teknik Informatika"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-medium" 
                required
              />
            </div>
          </div>

          {/* Baris 4: No HP & Mapel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">No. WhatsApp / HP</label>
              <input 
                type="text" 
                name="no_hp"
                value={formData.no_hp}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-medium" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Guru Mapel Utama (ID)</label>
              <select 
                name="mapel_id"
                value={formData.mapel_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm bg-white cursor-pointer font-medium"
              >
                {/* Dummy FK mapel_id dari tabel mata pelajaran */}
                <option value={1}>Matematika (1)</option>
                <option value={2}>Bahasa Inggris (2)</option>
                <option value={3}>Pemrograman Web (3)</option>
                <option value={4}>Basis Data (4)</option>
              </select>
            </div>
          </div>

          {/* Baris 5: Area Ganti Foto Profil */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Ganti Foto Profil (Opsional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-blue-50 transition-colors cursor-pointer group">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-10 w-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label className="relative cursor-pointer rounded-md bg-transparent font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500">
                    <span>Upload foto baru</span>
                    <input type="file" className="sr-only" accept="image/png, image/jpeg, image/jpg" />
                  </label>
                  <p className="pl-1">atau drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">Rasio 1:1 (Kotak), PNG/JPG up to 2MB</p>
              </div>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer text-sm"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="px-5 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer text-sm shadow-sm"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}