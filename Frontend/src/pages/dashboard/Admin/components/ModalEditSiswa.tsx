import React, { useState, useEffect } from "react";
import { X, UploadCloud, Loader2, Save } from "lucide-react";
import Swal from "sweetalert2"; 

// Tipe Data Dasar dari Tabel
interface SiswaItem {
  id: string; // Ini adalah id_siswa
  nis: string;
  nama: string;
  jk: "L" | "P";
  kelas: string;
  jurusan: string;
  namaAyah: string;
  noHpWali: string;
  foto: string;
}

interface ModalEditSiswaProps {
  siswa: SiswaItem | null;
  onClose: () => void;
}

export default function ModalEditSiswa({ siswa, onClose }: ModalEditSiswaProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "", 
    is_active: "true", 
    nis: "",
    nisn: "",
    npsn: "",
    nama_siswa: "",
    gender: "Pria", 
    tempat_tgl_lahir: "",
    nama_ayah: "",
    pekerjaan_ayah: "",
    nama_ibu: "",
    pekerjaan_ibu: "",
    no_hp_wali: "",
    alamat: "",
    desa_kelurahan: "",
    kecamatan: "",
    kabupaten_kota: "",
    provinsi: "",
  });

  const [foto, setFoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (siswa) {
      const fetchData = async () => {
        setIsLoading(true);
        setErrorMsg("");

        try {
          const token = localStorage.getItem("token");
          const resSiswa = await fetch(`http://187.127.121.139:3000/api/siswa/${siswa.id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const detailData = await resSiswa.json();

          if (detailData.success) {
            const dataDb = detailData.data;

            setFormData({
              username: dataDb.user?.username || "",
              email: dataDb.user?.email || "",
              password: "", 
              is_active: dataDb.user?.is_active ? "true" : "false",
              nis: dataDb.nis || "",
              nisn: dataDb.nisn || "",
              npsn: dataDb.npsn || "",
              nama_siswa: dataDb.nama_siswa || "",
              gender: dataDb.gender || "Pria",
              tempat_tgl_lahir: dataDb.tempat_tgl_lahir || "",
              nama_ayah: dataDb.nama_ayah || "",
              pekerjaan_ayah: dataDb.pekerjaan_ayah || "",
              nama_ibu: dataDb.nama_ibu || "",
              pekerjaan_ibu: dataDb.pekerjaan_ibu || "",
              no_hp_wali: dataDb.no_hp_wali || "",
              alamat: dataDb.alamat || "",
              desa_kelurahan: dataDb.desa_kelurahan || "",
              kecamatan: dataDb.kecamatan || "",
              kabupaten_kota: dataDb.kabupaten_kota || "",
              provinsi: dataDb.provinsi || "",
            });
          } else {
            setErrorMsg(detailData.message);
          }
        } catch (error) {
          console.error("Gagal menarik data:", error);
          setErrorMsg("Gagal terhubung ke server.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    } else {
      setFoto(null);
    }
  }, [siswa]);

  if (!siswa) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let value = e.target.value;
    
    // 🔥 FIX 1: PENGAMAN INPUT HANYA ANGKA
    if (["nis", "nisn", "npsn", "no_hp_wali"].includes(e.target.name)) {
      value = value.replace(/\D/g, ""); 
    }

    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  // 🔥 FIX 2: SATPAM GAMBAR VERSI UPDATE
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

    // 🔥 FIX 3: PENGAMAN PASSWORD MINIMAL 6 KARAKTER (Jika admin mengetik password baru)
    if (formData.password.trim() !== "" && formData.password.length < 6) {
      Swal.fire({
        title: "Password Terlalu Pendek",
        text: "Password baru harus terdiri dari minimal 6 karakter!",
        icon: "warning",
        confirmButtonColor: "#000000",
      });
      return; 
    }

    setIsSaving(true);
    setErrorMsg("");

    try {
      const dataToSend = new FormData();
      
      (Object.keys(formData) as (keyof typeof formData)[]).forEach((key) => {
        if (key === "password" && formData[key].trim() === "") return;
        dataToSend.append(key, formData[key as keyof typeof formData]);
      });

      if (foto) dataToSend.append("foto", foto);

      const token = localStorage.getItem("token");

      const response = await fetch(`http://187.127.121.139:3000/api/siswa/${siswa.id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }, 
        body: dataToSend,
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          title: "Berhasil Update!",
          text: result.message || "Data profil siswa berhasil diperbarui.",
          icon: "success",
          confirmButtonColor: "#000000", 
          confirmButtonText: "Selesai"
        }).then((result) => {
          if (result.isConfirmed) {
            onClose(); 
          }
        });
      } else {
        Swal.fire({
          title: "Gagal Update!",
          text: result.message || "Gagal menyimpan perubahan.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
        setErrorMsg(result.message || "Gagal menyimpan perubahan.");
      }
    } catch (error) {
      console.error("Error update siswa:", error);
      Swal.fire({
        title: "Server Error",
        text: "Terjadi kesalahan pada server saat menyimpan data.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      setErrorMsg("Terjadi kesalahan pada server saat menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-0 py-10">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in z-10">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0 bg-gray-50 rounded-t-2xl">
          <h3 className="text-xl font-extrabold text-black">Edit Biodata Siswa</h3>
          <button onClick={onClose} disabled={isLoading || isSaving} className="text-gray-400 hover:text-red-500 transition-colors bg-white p-1 rounded-md shadow-sm cursor-pointer disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center text-gray-500 flex-1">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-black" />
            <p>Menarik data lengkap siswa...</p>
          </div>
        ) : (
          <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold flex items-center gap-2">
                ⚠️ {errorMsg}
              </div>
            )}

            <form id="form-edit-siswa" onSubmit={handleSubmit} className="space-y-10">
              
              {/* BAGIAN 1: AKUN LOGIN */}
              <div className="bg-white p-6 border border-gray-100 rounded-xl shadow-sm">
                <h4 className="text-sm font-bold text-gray-900 border-b pb-3 mb-5 uppercase tracking-wider flex items-center gap-2">
                  <span className="bg-black text-white w-6 h-6 rounded flex items-center justify-center text-xs">1</span> 
                  Akun & Keamanan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
                    <input required type="text" name="username" value={formData.username} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none text-sm bg-gray-100 cursor-not-allowed" readOnly title="Username tidak dapat diubah" />
                    <p className="text-[10px] text-gray-500 mt-1">*Username bersifat permanen untuk login.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm bg-white" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Status Akun</label>
                    <select name="is_active" value={formData.is_active} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none text-sm bg-white cursor-pointer">
                      <option value="true">Aktif (Bisa Login)</option>
                      <option value="false">Nonaktif (Diblokir)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-red-600 mb-1">Reset Password Baru</label>
                    <input type="text" minLength={6} name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none text-sm placeholder-red-300" placeholder="Kosongkan jika tidak ingin diubah" />
                  </div>
                </div>
              </div>

              {/* BAGIAN 2: BIODATA & SEKOLAH */}
              <div className="bg-white p-6 border border-gray-100 rounded-xl shadow-sm">
                <h4 className="text-sm font-bold text-gray-900 border-b pb-3 mb-5 uppercase tracking-wider flex items-center gap-2">
                  <span className="bg-black text-white w-6 h-6 rounded flex items-center justify-center text-xs">2</span> 
                  Biodata Diri
                </h4>
                
                <div className="mb-5 flex flex-col md:flex-row gap-4 items-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shrink-0 shadow-sm relative">
                    {siswa.foto ? (
                      <img src={siswa.foto} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-medium">No Photo</div>
                    )}
                  </div>
                  <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer relative overflow-hidden transition-colors">
                     {/* 🔥 UPDATE: Accept ditambah jfif */}
                     <input onChange={handleFileChange} type="file" accept="image/png, image/jpeg, image/jpg, image/webp, image/jfif" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                     <UploadCloud className="w-6 h-6 mb-2 text-gray-400" />
                     <p className="text-xs font-medium text-center">{foto ? foto.name : "Ganti Foto Profil (Opsional, Max 2MB)"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                    <input required type="text" name="nama_siswa" value={formData.nama_siswa} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">NPSN</label>
                    <input type="text" name="npsn" value={formData.npsn} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">NIS <span className="text-red-500">*</span></label>
                    <input required type="text" name="nis" value={formData.nis} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">NISN <span className="text-red-500">*</span></label>
                    <input required type="text" name="nisn" value={formData.nisn} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Jenis Kelamin <span className="text-red-500">*</span></label>
                    <select required name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm bg-white cursor-pointer">
                      <option value="Pria">Laki-laki</option>
                      <option value="Wanita">Perempuan</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tempat & Tanggal Lahir</label>
                    <input type="text" name="tempat_tgl_lahir" value={formData.tempat_tgl_lahir} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" placeholder="Cth: Medan, 12 Agustus 2005" />
                  </div>
                </div>
              </div>

              {/* BAGIAN 3: DATA ORANG TUA / WALI */}
              <div className="bg-white p-6 border border-gray-100 rounded-xl shadow-sm">
                <h4 className="text-sm font-bold text-gray-900 border-b pb-3 mb-5 uppercase tracking-wider flex items-center gap-2">
                  <span className="bg-black text-white w-6 h-6 rounded flex items-center justify-center text-xs">3</span> 
                  Data Orang Tua & Wali
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nama Ayah</label>
                    <input type="text" name="nama_ayah" value={formData.nama_ayah} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Pekerjaan Ayah</label>
                    <input type="text" name="pekerjaan_ayah" value={formData.pekerjaan_ayah} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nama Ibu</label>
                    <input type="text" name="nama_ibu" value={formData.nama_ibu} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Pekerjaan Ibu</label>
                    <input type="text" name="pekerjaan_ibu" value={formData.pekerjaan_ibu} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nomor Handphone (Wali) <span className="text-red-500">*</span></label>
                    <input required type="text" name="no_hp_wali" value={formData.no_hp_wali} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" />
                  </div>
                </div>
              </div>

              {/* BAGIAN 4: ALAMAT LENGKAP */}
              <div className="bg-white p-6 border border-gray-100 rounded-xl shadow-sm">
                <h4 className="text-sm font-bold text-gray-900 border-b pb-3 mb-5 uppercase tracking-wider flex items-center gap-2">
                  <span className="bg-black text-white w-6 h-6 rounded flex items-center justify-center text-xs">4</span> 
                  Alamat Domisili
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Jalan / Detail Alamat</label>
                    <textarea name="alamat" value={formData.alamat} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm resize-none custom-scrollbar"></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Desa / Kelurahan</label>
                    <input type="text" name="desa_kelurahan" value={formData.desa_kelurahan} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Kecamatan</label>
                    <input type="text" name="kecamatan" value={formData.kecamatan} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Kabupaten / Kota</label>
                    <input type="text" name="kabupaten_kota" value={formData.kabupaten_kota} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Provinsi</label>
                    <input type="text" name="provinsi" value={formData.provinsi} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" />
                  </div>
                </div>
              </div>

            </form>
          </div>
        )}

        <div className="p-5 border-t border-gray-100 shrink-0 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button type="button" onClick={onClose} disabled={isSaving || isLoading} className="px-6 py-2.5 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors text-sm disabled:opacity-50 cursor-pointer">
            Batal
          </button>
          
          <button type="submit" form="form-edit-siswa" disabled={isSaving || isLoading} className="px-6 py-2.5 rounded-lg font-bold bg-black text-white hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2 text-sm disabled:bg-gray-500 cursor-pointer">
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
            ) : (
              <><Save className="w-4 h-4" /> Simpan Perubahan</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}