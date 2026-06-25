import React, { useState, useEffect } from "react";
import { X, UploadCloud, Loader2, Save } from "lucide-react";
import Swal from "sweetalert2"; 

interface ModalTambahKepsekProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void; 
}

export default function ModalTambahKepsek({ isOpen, onClose, onRefresh }: ModalTambahKepsekProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    nama_ks: "",
    tgl_lahir: "",
    gender: "Pria",
    agama: "",
    no_hp: "",
    pendidikan_tertinggi: "",
    mulai_menjabat: "",
    selesai_menjabat: "",
    status_jabatan: "AKTIF",
  });

  const [foto, setFoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setFoto(null);
      setErrorMsg("");
      setFormData({
        username: "", email: "", password: "", nama_ks: "",
        tgl_lahir: "", gender: "Pria", agama: "", no_hp: "", pendidikan_tertinggi: "",
        mulai_menjabat: "", selesai_menjabat: "", status_jabatan: "AKTIF",
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 🔥 PENGAMAN 1: SATPAM ANGKA UNTUK NOMOR HP
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value = e.target.value;
    
    if (e.target.name === "no_hp") {
      value = value.replace(/\D/g, ""); 
    }

    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  // 🔥 PENGAMAN 2: SATPAM GAMBAR & UKURAN FILE
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      const validImageTypes = [
        "image/jpeg", 
        "image/png", 
        "image/jpg", 
        "image/webp",
        "image/jfif",
        "image/pjpeg"
      ];
      
      if (!validImageTypes.includes(selectedFile.type)) {
        Swal.fire({
          title: "Format Tidak Sesuai",
          text: "Pas foto harus bertipe gambar (PNG, JPG, JPEG, JFIF).",
          icon: "warning", 
          confirmButtonColor: "#000000",
        });
        e.target.value = ""; 
        setFoto(null);
        return; 
      }

      if (selectedFile.size > 2 * 1024 * 1024) {
        Swal.fire({
          title: "Ukuran Terlalu Besar",
          text: "Ukuran maksimal pas foto adalah 2MB.",
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

    // 🔥 PENGAMAN 3: PASSWORD MINIMAL 6 KARAKTER
    if (formData.password.length < 6) {
      Swal.fire({
        title: "Password Terlalu Pendek",
        text: "Password sementara harus terdiri dari minimal 6 karakter!",
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
        dataToSend.append(key, formData[key as keyof typeof formData]);
      });

      if (foto) {
        dataToSend.append("foto", foto);
      }

      const token = localStorage.getItem("token");
      
      const response = await fetch("http://187.127.121.139:3000/api/kepsek", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: dataToSend,
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          title: "Berhasil!",
          text: result.message || "Data kepala sekolah berhasil ditambahkan.",
          icon: "success",
          confirmButtonColor: "#000000", 
          confirmButtonText: "Selesai"
        }).then((result) => {
          if (result.isConfirmed) {
            onClose(); 
            onRefresh(); 
          }
        });
      } else {
        Swal.fire({
          title: "Gagal!",
          text: result.message || "Gagal menyimpan data.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
        setErrorMsg(result.message || "Gagal menyimpan data.");
      }
    } catch (error) {
      console.error("Error submit kepsek:", error);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-0 py-10">
      
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in z-10">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0 bg-gray-50 rounded-t-2xl">
          <h3 className="text-xl font-extrabold text-black">Tambah Data Kepala Sekolah</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors bg-white p-1 rounded-md shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold flex items-center gap-2">
              ⚠️ {errorMsg}
            </div>
          )}

          <form id="form-tambah-kepsek" onSubmit={handleSubmit} className="space-y-8">
            
            <div className="bg-white p-6 border border-gray-100 rounded-xl shadow-sm">
              <h4 className="text-sm font-bold text-gray-900 border-b pb-3 mb-5 uppercase tracking-wider flex items-center gap-2">
                <span className="bg-black text-white w-6 h-6 rounded flex items-center justify-center text-xs">1</span> 
                Akun Login Sistem
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
                  <input required type="text" name="username" value={formData.username} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" placeholder="cth: ahmad_fauzi" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" placeholder="kepsek@sekolah.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Password Sementara <span className="text-red-500">*</span></label>
                  <input required minLength={6} type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" placeholder="Minimal 6 karakter" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 border border-gray-100 rounded-xl shadow-sm">
              <h4 className="text-sm font-bold text-gray-900 border-b pb-3 mb-5 uppercase tracking-wider flex items-center gap-2">
                <span className="bg-black text-white w-6 h-6 rounded flex items-center justify-center text-xs">2</span> 
                Biodata & Profil Pimpinan
              </h4>
              
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-700 mb-2">Foto Profil (Opsional)</label>
                <div className="w-full md:w-1/2 border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-black transition-colors cursor-pointer relative overflow-hidden">
                   {/* 🔥 UPDATE ACCEPT IMAGE */}
                   <input onChange={handleFileChange} type="file" accept="image/png, image/jpeg, image/jpg, image/webp, image/jfif" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                   <UploadCloud className="w-6 h-6 mb-2 text-gray-400" />
                   <p className="text-xs font-medium">{foto ? foto.name : "Klik untuk unggah foto (Max 2MB)"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap & Gelar <span className="text-red-500">*</span></label>
                  <input required type="text" name="nama_ks" value={formData.nama_ks} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" placeholder="Cth: Drs. H. Ahmad Fauzi, M.Pd." />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Lahir <span className="text-red-500">*</span></label>
                  <input required type="date" name="tgl_lahir" value={formData.tgl_lahir} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Jenis Kelamin <span className="text-red-500">*</span></label>
                  <select required name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm bg-white cursor-pointer">
                    <option value="Pria">Laki-laki</option>
                    <option value="Wanita">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Agama <span className="text-red-500">*</span></label>
                  <select required name="agama" value={formData.agama} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm bg-white cursor-pointer">
                    <option value="">Pilih Agama</option>
                    <option value="Islam">Islam</option>
                    <option value="Kristen Protestan">Kristen Protestan</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">No. HP <span className="text-red-500">*</span></label>
                  <input required type="text" name="no_hp" value={formData.no_hp} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" placeholder="Hanya Angka, Cth: 081234567890" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Ijazah / Pendidikan Tertinggi <span className="text-red-500">*</span></label>
                  <select required name="pendidikan_tertinggi" value={formData.pendidikan_tertinggi} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm bg-white cursor-pointer">
                    <option value="">Pilih Pendidikan Terakhir</option>
                    <option value="SMA/SMK">SMA / SMK Sederajat</option>
                    <option value="D3">Diploma 3 (D3)</option>
                    <option value="S1">Strata 1 (S1) / D4</option>
                    <option value="S2">Strata 2 (S2)</option>
                    <option value="S3">Strata 3 (S3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mulai Menjabat <span className="text-red-500">*</span></label>
                  <input required type="date" name="mulai_menjabat" value={formData.mulai_menjabat} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Selesai Menjabat</label>
                  <input required={formData.status_jabatan === "NON_AKTIF"} type="date" name="selesai_menjabat" value={formData.selesai_menjabat} onChange={handleChange} min={formData.mulai_menjabat || undefined} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status Jabatan <span className="text-red-500">*</span></label>
                  <select required name="status_jabatan" value={formData.status_jabatan} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm bg-white cursor-pointer">
                    <option value="AKTIF">Aktif Menjabat</option>
                    <option value="NON_AKTIF">Non-Aktif Menjabat</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-gray-100 shrink-0 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button type="button" onClick={onClose} disabled={isLoading} className="px-6 py-2.5 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors text-sm disabled:opacity-50 cursor-pointer">
            Batal
          </button>
          
          <button type="submit" form="form-tambah-kepsek" disabled={isLoading} className="px-6 py-2.5 rounded-lg font-bold bg-black text-white hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2 text-sm disabled:bg-gray-500 cursor-pointer">
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
            ) : (
              <><Save className="w-4 h-4" /> Simpan Data</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}