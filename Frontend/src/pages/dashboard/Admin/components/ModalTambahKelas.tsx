import React, { useState, useEffect } from "react";
import { X, Loader2, Save } from "lucide-react";
import Swal from "sweetalert2"; 

interface ModalTambahKelasProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function ModalTambahKelas({ isOpen, onClose, onRefresh }: ModalTambahKelasProps) {
  // State Form disesuaikan dengan schema Prisma yang baru (Kelas Fisik)
  const [formData, setFormData] = useState({
    nama_kelas: "", 
    ruang_kelas: "",
    jurusan_id: "",
    tahun_ajaran_id: "", // 🔥 TAMBAHAN
    status: "AKTIF",     // 🔥 TAMBAHAN
    guru_id: "",         // Opsional untuk Wali Kelas
  });

  // State untuk Dropdown
  const [listJurusan, setListJurusan] = useState<any[]>([]);
  const [listGuru, setListGuru] = useState<any[]>([]);
  const [listTahunAjaran, setListTahunAjaran] = useState<any[]>([]); // 🔥 TAMBAHAN

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      const fetchDataPendukung = async () => {
        setIsFetching(true);
        try {
          const token = localStorage.getItem("token");
          const headers = { "Authorization": `Bearer ${token}` };

          // 🔥 Tarik data jurusan, guru, dan tahun ajaran sekaligus
          const [resJurusan, resGuru, resTahunAjaran] = await Promise.all([
            fetch("http://187.127.121.139:3000/api/jurusan", { headers }).catch(() => null),
            fetch("http://187.127.121.139:3000/api/guru", { headers }).catch(() => null),
            fetch("http://187.127.121.139:3000/api/tahun-ajaran", { headers }).catch(() => null) 
          ]);

          const dataJur = resJurusan ? await resJurusan.json() : { success: false };
          const dataGuru = resGuru ? await resGuru.json() : { success: false };
          const dataTA = resTahunAjaran ? await resTahunAjaran.json() : { success: false };

          if (dataJur.success) setListJurusan(dataJur.data);
          if (dataGuru.success) setListGuru(dataGuru.data);
          if (dataTA.success) setListTahunAjaran(dataTA.data);

        } catch (error) {
          console.error("Gagal menarik data pendukung:", error);
          setErrorMsg("Gagal memuat pilihan data dari server.");
        } finally {
          setIsFetching(false);
        }
      };
      
      fetchDataPendukung();
    } else {
      // Reset form saat modal ditutup
      setFormData({
        nama_kelas: "", ruang_kelas: "", jurusan_id: "", tahun_ajaran_id: "", status: "AKTIF", guru_id: ""
      });
      setErrorMsg("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch("http://187.127.121.139:3000/api/kelas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          title: "Berhasil!",
          text: result.message || "Data ruang kelas baru berhasil didaftarkan.",
          icon: "success",
          confirmButtonColor: "#000000",
          confirmButtonText: "Selesai"
        }).then((res) => {
          if (res.isConfirmed) {
            onClose(); 
            onRefresh(); 
          }
        });
      } else {
        Swal.fire({
          title: "Gagal!",
          text: result.message || "Gagal mendaftarkan kelas baru.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
        setErrorMsg(result.message || "Gagal mendaftarkan kelas baru.");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Server Error",
        text: "Terjadi kesalahan server saat menyimpan data.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      setErrorMsg("Terjadi kesalahan server saat menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 md:p-8 animate-fade-in z-10 custom-scrollbar">
        
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h3 className="text-xl font-extrabold text-black">Tambah Ruang Kelas Fisik</h3>
            <p className="text-xs text-gray-500 mt-1">Buat master ruangan kelas baru untuk sekolah.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {isFetching ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-black" />
            <p className="text-sm text-gray-500 font-medium">Menarik data pendukung...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Kelas */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nama Kelas <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="nama_kelas" 
                    value={formData.nama_kelas} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-black text-sm" 
                    placeholder="Cth: X AKL 1" 
                    required 
                  />
                </div>

                {/* Jurusan */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Jurusan <span className="text-red-500">*</span></label>
                  <select name="jurusan_id" value={formData.jurusan_id} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-black text-sm bg-white cursor-pointer" required>
                    <option value="" disabled>-- Pilih Jurusan --</option>
                    {listJurusan.map(j => (
                      <option key={j.id_jurusan || j.id} value={j.id_jurusan || j.id || ""}>{j.jurusan}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 🔥 BARIS BARU: TAHUN AJARAN & STATUS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tahun Ajaran */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tahun Ajaran <span className="text-red-500">*</span></label>
                  <select name="tahun_ajaran_id" value={formData.tahun_ajaran_id} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-black text-sm bg-white cursor-pointer" required>
                    <option value="" disabled>-- Pilih Tahun Ajaran --</option>
                    {listTahunAjaran.map(ta => (
                      <option key={ta.id_tahun_ajaran} value={ta.id_tahun_ajaran}>
                        {ta.tahun} {ta.status === "AKTIF" ? "(Aktif)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Kelas */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Status Kelas <span className="text-red-500">*</span></label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-black text-sm bg-white cursor-pointer" required>
                    <option value="AKTIF">Aktif</option>
                    <option value="NON_AKTIF">Non-Aktif</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ruangan Fisik */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nama Ruangan Fisik <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="ruang_kelas" 
                    value={formData.ruang_kelas} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-black text-sm" 
                    placeholder="Cth: Gedung B-01" 
                    required 
                  />
                </div>

                {/* Wali Kelas */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Wali Kelas (Opsional)</label>
                  <select name="guru_id" value={formData.guru_id} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-black text-sm bg-white cursor-pointer">
                    <option value="">-- Belum Ditentukan --</option>
                    {listGuru
                      .filter(g => g.guru && g.guru.id_guru)
                      .map(g => (
                        <option key={g.guru.id_guru} value={g.guru.id_guru}>
                          {g.guru.nama_guru}
                        </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-500 mt-1.5">*Bisa ditentukan nanti.</p>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} disabled={isLoading} className="px-6 py-2.5 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors text-sm cursor-pointer">
                Batal
              </button>
              <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-lg font-bold bg-black text-white hover:bg-gray-800 text-sm flex items-center gap-2 disabled:bg-gray-500 cursor-pointer">
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Save className="w-4 h-4" /> Simpan Ruangan</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}