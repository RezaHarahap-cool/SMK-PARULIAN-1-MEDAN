import React, { useState, useEffect } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import Swal from "sweetalert2"; // 🔥 IMPORT SWEETALERT DI SINI

// TULIS ULANG INTERFACE DI SINI
interface RosterItem {
  id_jadwal: string;
  tahun_ajaran_id?: string;
  kelas_id?: string;
  mapel_id?: string;
  guru_id?: string;
  les: number;
  jam_mulai: string;
  jam_berakhir: string;
  mapel?: { mapel: string };
  guru?: { nama_guru: string } | null;
  hari: string;
}

interface ModalEditRosterProps {
  roster: RosterItem | null;
  onClose: () => void;
  onRefresh: () => void; // 🔥 AKTIFKAN KABEL REFRESH
}

export default function ModalEditRoster({ roster, onClose, onRefresh }: ModalEditRosterProps) {
  // State untuk form data
  const [formData, setFormData] = useState({
    tahun_ajaran_id: "",
    kelas_id: "",
    hari: "",
    les: "",
    jam_mulai: "",
    jam_berakhir: "",
    mapel_id: "",
    guru_id: ""
  });

  // State untuk menyimpan opsi dropdown dari database
  const [options, setOptions] = useState({
    tahunAjaran: [],
    kelas: [],
    mapel: [],
    guru: []
  });

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const isActivity = formData.les === "0";

  // 1. Ambil semua data master saat modal dibuka
  useEffect(() => {
    if (!roster) return;

    const fetchAllData = async () => {
      setIsLoadingData(true);
      setErrorMsg("");
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [resTahun, resKelas, resMapel, resGuru] = await Promise.all([
          fetch("http://187.127.121.139:3000/api/tahun-ajaran", { headers }).catch(() => null),
          fetch("http://187.127.121.139:3000/api/kelas", { headers }).catch(() => null),
          fetch("http://187.127.121.139:3000/api/mapel", { headers }).catch(() => null),
          fetch("http://187.127.121.139:3000/api/guru", { headers }).catch(() => null)
        ]);

        const [dataTahun, dataKelas, dataMapel, dataGuru] = await Promise.all([
          resTahun ? resTahun.json() : { success: false },
          resKelas ? resKelas.json() : { success: false },
          resMapel ? resMapel.json() : { success: false },
          resGuru ? resGuru.json() : { success: false }
        ]);

        setOptions({
          tahunAjaran: dataTahun.success ? dataTahun.data : [],
          kelas: dataKelas.success ? dataKelas.data : [],
          mapel: dataMapel.success ? dataMapel.data : [],
          guru: dataGuru.success ? dataGuru.data : []
        });

      } catch (error) {
        console.error("Gagal menarik data master:", error);
        setErrorMsg("Gagal memuat data opsi. Pastikan server menyala.");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchAllData();
  }, [roster]);

  // 2. Auto-fill form dengan data dari baris yang diklik
  useEffect(() => {
    if (roster) {
      setFormData({
        tahun_ajaran_id: roster.tahun_ajaran_id || "",
        kelas_id: roster.kelas_id || "",
        hari: roster.hari || "",
        les: roster.les?.toString() || "",
        jam_mulai: roster.jam_mulai || "",
        jam_berakhir: roster.jam_berakhir || "",
        mapel_id: roster.mapel_id || "",
        guru_id: roster.guru_id || ""
      });
    }
  }, [roster]);

  // Handler untuk mendeteksi ketikan di input/select
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Handler Submit ke Backend (UPDATE / PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.tahun_ajaran_id || !formData.kelas_id || !formData.mapel_id || (!isActivity && !formData.guru_id)) {
      setErrorMsg(isActivity
        ? "Mohon pastikan Tahun Ajaran, Kelas, dan Kegiatan sudah dipilih dengan benar!"
        : "Mohon pastikan Tahun Ajaran, Kelas, Mapel, dan Guru sudah dipilih dengan benar!");
      return;
    }

    if (!formData.hari || !formData.les || !formData.jam_mulai || !formData.jam_berakhir) {
      setErrorMsg("Mohon lengkapi waktu pelaksanaan!");
      return;
    }

    if (formData.jam_mulai >= formData.jam_berakhir) {
      setErrorMsg("Jam mulai harus lebih awal dari jam selesai!");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        guru_id: isActivity ? "" : formData.guru_id,
        les: parseInt(formData.les)
      };

      // Tembak API PUT beserta ID Jadwal-nya
      const response = await fetch(`http://187.127.121.139:3000/api/jadwal/${roster?.id_jadwal}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        // 🔥 GANTI ALERT JADUL DENGAN SWEETALERT2
        Swal.fire({
          title: "Berhasil Update!",
          text: "Jadwal roster berhasil diperbarui.",
          icon: "success",
          confirmButtonColor: "#000000",
          confirmButtonText: "Selesai"
        }).then((result) => {
          if (result.isConfirmed) {
            onClose(); 
            onRefresh(); // 🔥 AUTO REFRESH TABEL
          }
        });
      } else {
        // 🔥 SweetAlert Error
        Swal.fire({
          title: "Gagal Update!",
          text: result.message || "Gagal memperbarui jadwal.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
        setErrorMsg(result.message);
      }
    } catch (error) {
      console.error("Gagal memperbarui jadwal:", error);
      Swal.fire({
        title: "Server Error",
        text: "Terjadi kesalahan pada server saat memperbarui jadwal.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      setErrorMsg("Terjadi kesalahan pada server saat memperbarui jadwal.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!roster) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 animate-fade-in z-10 custom-scrollbar">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-extrabold text-black">Edit Data Roster</h3>
          <button onClick={onClose} disabled={isSaving} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50">
            <X className="w-6 h-6" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin mb-3 text-black" />
            <p className="font-medium">Memuat data jadwal...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* TARGET PENEMPATAN */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Target Penempatan</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tahun Ajaran</label>
                  <select name="tahun_ajaran_id" value={formData.tahun_ajaran_id} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm bg-white cursor-pointer">
                    <option value="" disabled>-- Pilih Tahun Ajaran --</option>
                    {options.tahunAjaran.map((ta: any, idx: number) => (
                      <option key={ta?.id_tahun_ajaran || ta?.id || `ta-${idx}`} value={ta?.id_tahun_ajaran || ta?.id || ""}>
                        {ta?.tahun || "Tahun tidak terbaca"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Kelas</label>
                  <select name="kelas_id" value={formData.kelas_id} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm bg-white cursor-pointer">
                    <option value="" disabled>-- Pilih Kelas --</option>
                    {options.kelas.map((k: any, idx: number) => (
                      <option key={k?.id_kelas || k?.id || `kelas-${idx}`} value={k?.id_kelas || k?.id || ""}>
                        {k?.nama_kelas || "Nama Kelas tidak terbaca"} {k?.ruang_kelas ? `- ${k.ruang_kelas}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* WAKTU PELAKSANAAN */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Waktu Pelaksanaan</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Hari</label>
                  <select name="hari" value={formData.hari} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm bg-white cursor-pointer">
                    <option value="" disabled>-- Pilih Hari --</option>
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Les Ke-</label>
                  <input type="number" name="les" value={formData.les} onChange={handleChange} min="0" max="9" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Jam Mulai</label>
                  <input type="time" name="jam_mulai" value={formData.jam_mulai} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm cursor-pointer" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Jam Selesai</label>
                  <input type="time" name="jam_berakhir" value={formData.jam_berakhir} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm cursor-pointer" />
                </div>
              </div>
            </div>

            {/* SUBJEK & PENGAJAR */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Subjek & Pengajar</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Mata Pelajaran</label>
                  <select name="mapel_id" value={formData.mapel_id} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm bg-white cursor-pointer truncate pr-8">
                    <option value="" disabled>-- Pilih Mapel --</option>
                    {options.mapel.map((m: any, idx: number) => (
                      <option key={m?.id_mapel || m?.id || `mapel-${idx}`} value={m?.id_mapel || m?.id || ""}>
                        {m?.mapel || m?.nama || "Mapel tidak terbaca"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Guru Pengampu</label>
                  <select name="guru_id" value={isActivity ? "" : formData.guru_id} onChange={handleChange} disabled={isActivity} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-none text-sm bg-white cursor-pointer truncate pr-8 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed">
                    {isActivity ? <option value="">Tidak ditampilkan untuk Les 0</option> : null}
                    <option value="" disabled>-- Pilih Guru --</option>
                    {options.guru.map((u: any) => {
                      const guruId = u.guru?.id_guru || "";
                      const namaGuru = u.guru?.nama_guru || u.username;
                      return (
                        <option key={u.id_users} value={guruId}>
                          {namaGuru}
                        </option>
                      );
                    })}
                  </select>
                </div>

              </div>
            </div>

            {/* TOMBOL AKSI */}
            <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-gray-100">
              <button type="button" onClick={onClose} disabled={isSaving} className="px-5 py-2.5 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors cursor-pointer text-sm disabled:opacity-50">
                Batal
              </button>
              <button type="submit" disabled={isSaving} className="px-5 py-2.5 flex items-center justify-center gap-2 rounded-lg font-bold bg-black text-white hover:bg-gray-800 transition-colors cursor-pointer text-sm shadow-sm disabled:opacity-50">
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
