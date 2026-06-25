import React, { useState, useEffect } from "react";
import { X, Loader2, Save } from "lucide-react";
import Swal from "sweetalert2";

// Tipe Data disesuaikan dengan API Backend terbaru
interface KelasItem {
  id_kelas: string;
  nama_kelas: string;
  ruang_kelas: string;
  jurusan_id: string;
  tahun_ajaran_id: string; // 🔥 TAMBAHAN BARU
  status: string;          // 🔥 TAMBAHAN BARU
  guru_id: string | null;
}

interface ModalEditKelasProps {
  kelas: KelasItem | null;
  onClose: () => void;
  onRefresh: () => void; 
}

export default function ModalEditKelas({ kelas, onClose, onRefresh }: ModalEditKelasProps) {
  // State Form
  const [formData, setFormData] = useState({
    nama_kelas: "",
    ruang_kelas: "",
    jurusan_id: "",
    tahun_ajaran_id: "", // 🔥 TAMBAHAN BARU
    status: "AKTIF",     // 🔥 TAMBAHAN BARU
    guru_id: "",
  });

  // State untuk Dropdown
  const [listJurusan, setListJurusan] = useState<any[]>([]);
  const [listGuru, setListGuru] = useState<any[]>([]);
  const [listTahunAjaran, setListTahunAjaran] = useState<any[]>([]); // 🔥 TAMBAHAN BARU

  // State Status
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Jalankan saat modal terbuka dan ada data kelas yang dilempar
  useEffect(() => {
    if (kelas) {
      // 1. Isi form dengan data lama
      setFormData({
        nama_kelas: kelas.nama_kelas || "",
        ruang_kelas: kelas.ruang_kelas || "",
        jurusan_id: kelas.jurusan_id || "",
        tahun_ajaran_id: kelas.tahun_ajaran_id || "", // 🔥 ISI DATA LAMA
        status: kelas.status || "AKTIF",              // 🔥 ISI DATA LAMA
        guru_id: kelas.guru_id || "",
      });
      setErrorMsg("");

      // 2. Tarik daftar Jurusan, Guru, dan Tahun Ajaran dari server
      const fetchDataPendukung = async () => {
        setIsFetching(true);
        try {
          const token = localStorage.getItem("token");
          const headers = { "Authorization": `Bearer ${token}` };

          // 🔥 Tarik 3 API sekaligus
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
    }
  }, [kelas]);

  // Jika tidak ada data yang dipilih, jangan tampilkan modal
  if (!kelas) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://187.127.121.139:3000/api/kelas/${kelas.id_kelas}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          title: "Berhasil Update!",
          text: result.message || "Data kelas berhasil diperbarui.",
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
          title: "Gagal Update!",
          text: result.message || "Gagal memperbarui data kelas.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
        setErrorMsg(result.message || "Gagal memperbarui data kelas.");
      }
    } catch (error) {
      console.error("Error update kelas:", error);
      Swal.fire({
        title: "Server Error",
        text: "Terjadi kesalahan server saat menyimpan perubahan.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      setErrorMsg("Terjadi kesalahan server saat menyimpan perubahan.");
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
      <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 md:p-8 animate-fade-in z-10 custom-scrollbar">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h3 className="text-xl font-extrabold text-black">Edit Ruang Kelas Fisik</h3>
            <p className="text-xs text-gray-500 mt-1">Perbarui data ruangan, tahun ajaran, atau wali kelas.</p>
          </div>
          <button 
            onClick={onClose}
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

        {isFetching ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-black" />
            <p className="text-sm text-gray-500 font-medium">Menyiapkan data form...</p>
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm bg-white" 
                    required
                  />
                </div>

                {/* Jurusan */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Jurusan <span className="text-red-500">*</span></label>
                  <select 
                    name="jurusan_id"
                    value={formData.jurusan_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm bg-white cursor-pointer"
                    required
                  >
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
                  <select 
                    name="tahun_ajaran_id" 
                    value={formData.tahun_ajaran_id} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:border-black outline-none text-sm bg-white cursor-pointer" 
                    required
                  >
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
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:border-black outline-none text-sm bg-white cursor-pointer" 
                    required
                  >
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm bg-white" 
                    required
                  />
                </div>

                {/* Wali Kelas */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Wali Kelas (Opsional)</label>
                  <select 
                    name="guru_id"
                    value={formData.guru_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm bg-white cursor-pointer"
                  >
                    <option value="">-- Kosongkan / Belum Ditentukan --</option>
                    {listGuru
                      .filter(g => g.guru && g.guru.id_guru)
                      .map(g => (
                        <option key={g.guru.id_guru} value={g.guru.id_guru}>
                          {g.guru.nama_guru}
                        </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors cursor-pointer text-sm"
              >
                Batal
              </button>
              <button 
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-lg font-bold bg-black text-white hover:bg-gray-800 transition-colors cursor-pointer text-sm shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Save className="w-4 h-4" /> Simpan Perubahan</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}