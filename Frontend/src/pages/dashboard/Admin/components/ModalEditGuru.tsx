import React, { useState, useEffect } from "react";
import { X, Loader2, Save } from "lucide-react";
import Swal from "sweetalert2";

interface GuruItem {
  id: string;
  nama: string;
  jk: "L" | "P";
  ijazah: string;
  mapel: string;
  noHp: string;
  foto: string;
}

interface ModalEditGuruProps {
  guru: GuruItem | null;
  onClose: () => void;
  onRefresh: () => void;
}

export default function ModalEditGuru({ guru, onClose, onRefresh }: ModalEditGuruProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "", 
    is_active: "true", 
    nama_guru: "",
    tgl_lahir: "",
    gender: "Pria",
    agama: "Islam",
    pendidikan_tertinggi: "S1",
    no_hp: "",
    mapel_id: "",
  });

  const [foto, setFoto] = useState<File | null>(null);
  const [mapelList, setMapelList] = useState<{ id?: string; id_mapel?: string; mapel: string }[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (guru) {
      const fetchData = async () => {
        setIsLoading(true);
        setErrorMsg("");

        try {
          const token = localStorage.getItem("token");
          
          // A. Tarik Daftar Mapel untuk Dropdown
          const resMapel = await fetch("http://187.127.121.139:3000/api/mapel", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const mapelData = await resMapel.json();
          let listMapelTersedia: any[] = [];
          if (mapelData.success) {
            listMapelTersedia = mapelData.data;
            setMapelList(listMapelTersedia); 
          }

          // B. Tarik Data Profil Lengkap Guru
          const resGuru = await fetch(`http://187.127.121.139:3000/api/guru/${guru.id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const detailData = await resGuru.json();

          if (detailData.success) {
            const dataDb = detailData.data;
            const tglLahirMentah = dataDb.guru.tgl_lahir ? dataDb.guru.tgl_lahir.split('T')[0] : "";

            // 🔥 FIX 1: Pencocokan ID Mapel Otomatis (Anti Kosong)
            let matchedMapelId = dataDb.guru.mapel_id || "";
            if (!matchedMapelId && guru.mapel) {
              const cariMapel = listMapelTersedia.find((m) => m.mapel === guru.mapel);
              if (cariMapel) {
                matchedMapelId = cariMapel.id_mapel || cariMapel.id || "";
              }
            }

            setFormData({
              username: dataDb.username || "",
              email: dataDb.email || "",
              password: "", 
              // 🔥 FIX 2: Konversi status aktif menjadi string penanda select option
              is_active: dataDb.is_active === true ? "true" : "false",
              nama_guru: dataDb.guru.nama_guru || "",
              tgl_lahir: tglLahirMentah,
              gender: dataDb.guru.gender || "Pria",
              agama: dataDb.guru.agama || "Islam",
              pendidikan_tertinggi: dataDb.guru.pendidikan_tertinggi || "S1",
              no_hp: dataDb.guru.no_hp || "",
              mapel_id: matchedMapelId, 
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
  }, [guru]);

  if (!guru) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value = e.target.value;
    
    // Filter Nomor HP hanya angka
    if (e.target.name === "no_hp") {
      value = value.replace(/\D/g, ""); 
    }

    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");

    try {
      const dataToSend = new FormData();
      
      (Object.keys(formData) as (keyof typeof formData)[]).forEach((key) => {
        if (key === "password" && formData[key].trim() === "") {
          return; 
        }
        dataToSend.append(key, formData[key]);
      });

      if (foto) {
        dataToSend.append("foto", foto);
      }

      const token = localStorage.getItem("token");

      const response = await fetch(`http://187.127.121.139:3000/api/guru/${guru.id}`, {
        method: "PUT", 
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: dataToSend,
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          title: "Berhasil Update!",
          text: result.message || "Data profil guru berhasil diperbarui.",
          icon: "success",
          confirmButtonColor: "#2563eb", 
          confirmButtonText: "Selesai"
        }).then((res) => {
          if (res.isConfirmed) {
            onClose(); 
            onRefresh(); 
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
      console.error("Error update guru:", error);
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

      <div className="relative bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in z-10">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
          <h3 className="text-xl font-extrabold text-black">Edit Profil Guru</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center text-gray-500 flex-1">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-black" />
            <p>Menarik data guru...</p>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {errorMsg && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 border-l-4 border-red-500 text-sm font-medium">
                {errorMsg}
              </div>
            )}

            <form id="form-edit-guru" onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4 uppercase tracking-wider">Data Akun & Keamanan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
                    <input required name="username" value={formData.username} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                    <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm bg-gray-50" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Status Akun</label>
                    <select name="is_active" value={formData.is_active} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none text-sm bg-white">
                      <option value="true">Aktif (Bisa Login)</option>
                      <option value="false">Nonaktif (Diblokir)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-red-600 mb-1">Reset Password Baru</label>
                    <input name="password" minLength={6} value={formData.password} onChange={handleChange} type="text" placeholder="Kosongkan jika tidak ingin diubah" className="w-full px-4 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none text-sm placeholder-red-300" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4 uppercase tracking-wider">Biodata Lengkap</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap & Gelar</label>
                    <input required name="nama_guru" value={formData.nama_guru} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal Lahir</label>
                    <input required name="tgl_lahir" value={formData.tgl_lahir} onChange={handleChange} type="date" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Jenis Kelamin</label>
                    <select required name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm bg-white">
                      <option value="Pria">Laki-laki</option>
                      <option value="Wanita">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Agama</label>
                    <select required name="agama" value={formData.agama} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm bg-white">
                      <option value="Islam">Islam</option>
                      <option value="Kristen Protestan">Kristen Protestan</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Pendidikan Tertinggi</label>
                    <select required name="pendidikan_tertinggi" value={formData.pendidikan_tertinggi} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm bg-white">
                      <option value="D3">D3</option>
                      <option value="S1">S1 / D4</option>
                      <option value="S2">S2</option>
                      <option value="S3">S3</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nomor HP</label>
                    <input required name="no_hp" value={formData.no_hp} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Mata Pelajaran</label>
                    <select required name="mapel_id" value={formData.mapel_id || ""} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm bg-white">
                      <option value="" disabled>-- Pilih Mapel --</option>
                      {mapelList.map((m: any) => (
                        <option key={m.id || m.id_mapel} value={m.id || m.id_mapel}>
                          {m.mapel}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 mt-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Ganti Foto Profil (Biarkan kosong jika tidak diubah)</label>
                    <input onChange={handleFileChange} type="file" accept="image/png, image/jpeg, image/jpg, image/webp, image/jfif" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200" />
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="p-6 border-t border-gray-100 shrink-0 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button type="button" onClick={onClose} disabled={isSaving} className="px-5 py-2.5 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors text-sm disabled:opacity-50">
            Batal
          </button>
          
          <button type="submit" form="form-edit-guru" disabled={isSaving || isLoading} className="px-5 py-2.5 rounded-lg font-bold bg-black text-white hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2 text-sm disabled:bg-gray-500">
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