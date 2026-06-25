import React, { useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import Swal from "sweetalert2";

interface ModalTambahGuruProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void; 
}

// Gunakan VITE_API_BASE_URL untuk mengganti target API saat deploy.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://187.127.121.139:3000";

export default function ModalTambahGuru({ isOpen, onClose, onRefresh }: ModalTambahGuruProps) {
  const [mapelList, setMapelList] = useState<{ id_mapel: number; mapel: string }[]>([]);
  
  React.useEffect(() => {
    if (isOpen) {
      const fetchMapel = async () => {
        try {
          const token = localStorage.getItem("token");
          // 🔥 Sudah diubah menggunakan API_BASE_URL
          const res = await fetch(`${API_BASE_URL}/api/mapel`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const result = await res.json();
          
          if (result.success) {
            setMapelList(result.data);
          }
        } catch (error) {
          console.error("Gagal menarik data mapel untuk dropdown:", error);
        }
      };

      fetchMapel();
    }
  }, [isOpen]);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    nama_guru: "",
    tgl_lahir: "",
    gender: "Pria", 
    agama: "Islam",
    pendidikan_tertinggi: "S1",
    no_hp: "",
    mapel_id: "", 
  });
  
  const [foto, setFoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value = e.target.value;
    
    // Hanya izinkan angka untuk nomor HP
    if (e.target.name === "no_hp") {
      value = value.replace(/\D/g, ""); 
    }

    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  // 🔥 PERBAIKAN: Satpam Gambar (Format & Ukuran)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // 1. Cek Ekstensi/Tipe File
      const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validImageTypes.includes(selectedFile.type)) {
        Swal.fire({
          title: "Format Tidak Sesuai",
          text: "Foto profil pastikan bertipe gambar seperti PNG atau JPG.",
          icon: "warning", // Ini akan memunculkan ikon tanda seru warna kuning (bukan error merah)
          confirmButtonColor: "#000000",
        });
        e.target.value = ""; // Kosongkan kembali input-nya
        setFoto(null);
        return;
      }

      // 2. Cek Ukuran File (Batas maksimal 2MB)
      if (selectedFile.size > 2 * 1024 * 1024) {
        Swal.fire({
          title: "Ukuran Terlalu Besar",
          text: "Ukuran maksimal foto profil adalah 2MB.",
          icon: "warning",
          confirmButtonColor: "#000000",
        });
        e.target.value = "";
        setFoto(null);
        return;
      }
      
      setFoto(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi Password Minimal 6 Karakter
    if (formData.password.length < 6) {
      Swal.fire({
        title: "Password Kurang Aman",
        text: "Password harus terdiri dari minimal 6 karakter!",
        icon: "warning",
        confirmButtonColor: "#000000",
      });
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const dataToSend = new FormData();
      
      (Object.keys(formData) as (keyof typeof formData)[]).forEach((key) => {
        dataToSend.append(key, formData[key]);
      });

      if (foto) {
        dataToSend.append("foto", foto);
      }

      const token = localStorage.getItem("token");

      // 🔥 Sudah diubah menggunakan API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/api/guru`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: dataToSend,
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          title: "Berhasil!",
          text: result.message || "Data guru berhasil ditambahkan.",
          icon: "success",
          confirmButtonColor: "#000000", 
          confirmButtonText: "Selesai"
        }).then((res) => {
          if (res.isConfirmed) {
            setFormData({
              username: "", email: "", password: "", nama_guru: "", tgl_lahir: "",
              gender: "Pria", agama: "Islam", pendidikan_tertinggi: "S1", no_hp: "", mapel_id: "",
            });
            setFoto(null);
            onClose(); 
            onRefresh(); 
          }
        });
        
      } else {
        Swal.fire({
          title: "Gagal!",
          text: result.message || "Gagal menyimpan data guru.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
        setErrorMsg(result.message || "Gagal menyimpan data guru.");
      }
    } catch (error) {
      console.error("Error submit guru:", error);
      Swal.fire({
        title: "Server Error",
        text: "Terjadi kesalahan pada koneksi server. Coba lagi nanti.",
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-0 py-10">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in z-10">
        
        {/* Header Modal - Fixed */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
          <h3 className="text-xl font-extrabold text-black">Tambah Data Guru Baru</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body Form - Scrollable */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 border-l-4 border-red-500 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form id="form-tambah-guru" onSubmit={handleSubmit} className="space-y-8">
            
            {/* BAGIAN 1: AKUN LOGIN */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4 uppercase tracking-wider">Data Akun Login</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
                  <input required name="username" value={formData.username} onChange={handleChange} type="text" placeholder="budi_guru" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                  <input required name="email" value={formData.email} onChange={handleChange} type="email" placeholder="budi@sekolah.com" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Password Sementara</label>
                  <input 
                    required 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    type="password" 
                    minLength={6} 
                    placeholder="Minimal 6 karakter" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm" 
                  />
                </div>
              </div>
            </div>

            {/* BAGIAN 2: PROFIL GURU */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4 uppercase tracking-wider">Biodata Lengkap</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap & Gelar</label>
                  <input required name="nama_guru" value={formData.nama_guru} onChange={handleChange} type="text" placeholder="Cth: Budi Santoso, S.Kom., M.T." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal Lahir</label>
                  <input required name="tgl_lahir" value={formData.tgl_lahir} onChange={handleChange} type="date" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Jenis Kelamin</label>
                  <select required name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm bg-white">
                    <option value="Pria">Pria</option>
                    <option value="Wanita">Wanita</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Agama</label>
                  <select required name="agama" value={formData.agama} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm bg-white">
                    <option value="Islam">Islam</option>
                    <option value="Kristen Protestan">Kristen Protestan</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Pendidikan Tertinggi</label>
                  <select required name="pendidikan_tertinggi" value={formData.pendidikan_tertinggi} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm bg-white">
                    <option value="D3">D3</option>
                    <option value="S1">S1 / D4</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nomor HP</label>
                  <input 
                    required 
                    name="no_hp" 
                    value={formData.no_hp} 
                    onChange={handleChange} 
                    type="tel" 
                    placeholder="Cth: 08123456789" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Mata Pelajaran</label>
                  <select 
                    required 
                    name="mapel_id" 
                    value={formData.mapel_id} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm bg-white"
                  >
                    <option value="" disabled>-- Pilih Mata Pelajaran --</option>
                    {mapelList.map((m) => (
                      <option key={m.id_mapel} value={m.id_mapel}>
                        {m.mapel}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Foto Profil (Opsional)</label>
                  <input 
                    onChange={handleFileChange} 
                    type="file" 
                    accept="image/*" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200" 
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Modal (Tombol Submit) - Fixed di bawah */}
        <div className="p-6 border-t border-gray-100 shrink-0 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors text-sm disabled:opacity-50">
            Batal
          </button>
          
          <button type="submit" form="form-tambah-guru" disabled={isLoading} className="px-5 py-2.5 rounded-lg font-bold bg-black text-white hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2 text-sm disabled:bg-gray-500">
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
            ) : (
              <><Save className="w-4 h-4" /> Simpan Data Guru</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
