import React, { useState, useEffect } from "react";
import { Menu, AlertCircle, CheckCircle2, XCircle, Lock, Unlock, Filter, Loader2, Info } from "lucide-react";
import Swal from "sweetalert2";

// ==========================================
// 1. TIPE DATA (Menyesuaikan Response API)
// ==========================================
interface Mengajar {
  id_mengajar: string;
  kelas: { nama_kelas: string };
  mapel: { mapel: string };
}

interface SiswaRekap {
  id_siswa: string;
  riwayat_id: string;
  nama_siswa: string;
  rata_tugas: number | null;
  rata_ph: number | null;
  nilai_pts: number | null;
  nilai_pas: number | null;
}

export default function FinalisasiNilaiContent({ onMenuClick }: { onMenuClick: () => void }) {
  // State untuk API
  const [listMengajar, setListMengajar] = useState<Mengajar[]>([]);
  const [selectedMengajarId, setSelectedMengajarId] = useState("");
  const [dataTampil, setDataTampil] = useState<SiswaRekap[]>([]);
  
  // State UX (Loading & Error)
  const [isLoadingDropdown, setIsLoadingDropdown] = useState(true);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ==========================================
  // FUNGSI 1: TARIK DAFTAR KELAS (Saat pertama kali buka halaman)
  // ==========================================
  const fetchListMengajar = async () => {
    setIsLoadingDropdown(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://187.127.121.139:3000/api/guru-area/mengajar-list", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();

      if (result.success && result.data.length > 0) {
        setListMengajar(result.data);
        setSelectedMengajarId(result.data[0].id_mengajar); // Otomatis pilih kelas pertama
      }
    } catch (err) {
      console.error("Gagal menarik daftar kelas", err);
      setErrorMsg("Gagal terhubung ke server.");
    } finally {
      setIsLoadingDropdown(false);
    }
  };

  useEffect(() => {
    fetchListMengajar();
  }, []);

  // ==========================================
  // FUNGSI 2: TARIK REKAP NILAI KELAS (Berubah saat dropdown diganti)
  // ==========================================
  const fetchRekapSiswa = async (mengajarId: string) => {
    if (!mengajarId) return;
    setIsLoadingTable(true);
    setErrorMsg("");
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://187.127.121.139:3000/api/guru-area/rekap-nilai/${mengajarId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();

      if (result.success) {
        setDataTampil(result.data);
      } else {
        setErrorMsg(result.message);
      }
    } catch (err) {
      console.error("Gagal menarik data rekap siswa", err);
      setErrorMsg("Gagal menarik data nilai siswa.");
    } finally {
      setIsLoadingTable(false);
    }
  };

  // Pantau perubahan dropdown, kalau ganti kelas, loading data baru
  useEffect(() => {
    if (selectedMengajarId) {
      fetchRekapSiswa(selectedMengajarId);
    }
  }, [selectedMengajarId]);

  // ==========================================
  // LOGIKA UX: PENGECEKAN KELENGKAPAN NILAI
  // ==========================================
  const isAllComplete = dataTampil.length > 0 && dataTampil.every(
    (siswa) => siswa.rata_tugas !== null && siswa.rata_ph !== null && siswa.nilai_pts !== null && siswa.nilai_pas !== null
  );

  const jumlahBelumLengkap = dataTampil.filter(
    (siswa) => siswa.rata_tugas === null || siswa.rata_ph === null || siswa.nilai_pts === null || siswa.nilai_pas === null
  ).length;

  // ==========================================
  // FUNGSI 3: EKSEKUSI FINALISASI KE DATABASE
  // ==========================================
  const handleFinalisasi = async () => {
    if (!isAllComplete) return;

    const { value: kktpTarget } = await Swal.fire({
      title: "Masukkan KKTP",
      text: "Nilai standar Kriteria Ketercapaian untuk mapel ini.",
      input: "number",
      inputValue: 75,
      inputAttributes: {
        min: "0",
        max: "100",
        step: "1",
      },
      showCancelButton: true,
      confirmButtonText: "Lanjutkan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#000000",
      cancelButtonColor: "#d33",
      inputValidator: (value) => {
        const numericValue = Number(value);
        if (value === "" || Number.isNaN(numericValue)) {
          return "KKTP wajib diisi dengan angka.";
        }
        if (numericValue < 0 || numericValue > 100) {
          return "KKTP harus berada di rentang 0 sampai 100.";
        }
        return null;
      },
    });

    if (!kktpTarget) return;

    const confirm = await Swal.fire({
      title: "Finalisasi nilai?",
      text: `Data akan dihitung dan dikirim permanen ke rapor dengan KKTP ${kktpTarget}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, finalisasi",
      cancelButtonText: "Batal",
      confirmButtonColor: "#000000",
      cancelButtonColor: "#d33",
    });
    if (!confirm.isConfirmed) return;

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://187.127.121.139:3000/api/guru-area/finalisasi-massal", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          mengajar_id: selectedMengajarId,
          data_rekap: dataTampil,
          kktp_mapel: kktpTarget
        })
      });

      const result = await res.json();

      if (result.success) {
        await Swal.fire({
          title: "Berhasil",
          text: result.message || "Nilai berhasil difinalisasi.",
          icon: "success",
          confirmButtonColor: "#000000",
        });
      } else {
        await Swal.fire({
          title: "Gagal",
          text: result.message || "Finalisasi nilai gagal.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    } catch (err) {
      console.error("Gagal submit finalisasi", err);
      await Swal.fire({
        title: "Koneksi bermasalah",
        text: "Terjadi kesalahan jaringan saat menyimpan data.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-[#f4f7fb] p-6 md:p-10 custom-scrollbar">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <button className="lg:hidden p-2 bg-white rounded-lg shadow-sm cursor-pointer" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">Rekap & Finalisasi Rapor</h2>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 mb-8 w-full max-w-5xl">
        
        {/* PANEL KIRI: INFO & FILTER */}
        <div className="flex-1 flex flex-col gap-4">
          
          <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-blue-900">Validasi Kelengkapan Nilai</h4>
              <p className="text-sm text-blue-800 mt-1 leading-relaxed font-medium">
                Sistem akan mengunci tombol finalisasi jika masih ada nilai harian, PTS, atau PAS yang belum Anda masukkan.
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              {isLoadingDropdown ? <Loader2 className="w-6 h-6 text-gray-500 animate-spin" /> : <Filter className="w-6 h-6 text-gray-700" />}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Filter Kelas Mengajar</label>
              <select 
                value={selectedMengajarId}
                onChange={(e) => setSelectedMengajarId(e.target.value)}
                disabled={isLoadingDropdown || listMengajar.length === 0}
                className="w-full text-sm font-bold text-black border-none bg-transparent focus:ring-0 cursor-pointer p-0 disabled:opacity-50"
              >
                {listMengajar.length === 0 ? (
                  <option value="">Tidak ada kelas yang diajar</option>
                ) : (
                  listMengajar.map((m) => (
                    <option key={m.id_mengajar} value={m.id_mengajar}>
                      {m.kelas.nama_kelas} ({m.mapel.mapel})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

        </div>

        {/* PANEL KANAN: STATUS KESIAPAN */}
        <div className={`w-full xl:w-80 border p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center transition-colors 
          ${dataTampil.length === 0 ? "bg-gray-50 border-gray-200" 
          : isAllComplete ? "bg-green-50 border-green-200" 
          : "bg-red-50 border-red-200"}`}>
          
          {dataTampil.length === 0 ? (
             <>
               <AlertCircle className="w-8 h-8 text-gray-400 mb-3" />
               <h4 className="text-lg font-extrabold text-gray-600">Menunggu Data</h4>
             </>
          ) : isAllComplete ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-extrabold text-green-800">Data Lengkap!</h4>
              <p className="text-xs text-green-700 font-medium mt-1">Sistem siap menghitung nilai akhir.</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-3 animate-pulse">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="text-lg font-extrabold text-red-800">Terdapat Nilai Kosong</h4>
              <p className="text-xs text-red-700 font-medium mt-1">
                <span className="font-bold">{jumlahBelumLengkap} Siswa</span> belum memiliki nilai utuh.
              </p>
            </>
          )}
        </div>
      </div>

      {/* TABLE REKAP DATA */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm relative w-full max-w-5xl min-h-[300px]">
        
        {errorMsg && (
           <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-200">
             {errorMsg}
           </div>
        )}

        {isLoadingTable ? (
          <div className="absolute inset-0 flex flex-col justify-center items-center z-10 bg-white/80 rounded-2xl">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
            <p className="font-bold text-gray-500">Menarik data rekapitulasi nilai...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-black">Tabel Rekapitulasi Rapor</h3>
                <p className="text-sm font-semibold text-gray-500 mt-1">Pratinjau nilai sebelum dikunci permanen.</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-800 font-bold">
                    <tr>
                      <th className="px-6 py-4 w-16 text-center">No</th>
                      <th className="px-6 py-4 w-48">Nama Siswa</th>
                      <th className="px-6 py-4 text-center">Rerata Tugas</th>
                      <th className="px-6 py-4 text-center">Rerata PH</th>
                      <th className="px-6 py-4 text-center">Nilai PTS</th>
                      <th className="px-6 py-4 text-center">Nilai PAS</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {dataTampil.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-medium">
                          Belum ada data siswa di kelas ini.
                        </td>
                      </tr>
                    ) : (
                      dataTampil.map((siswa, index) => {
                        const isSiswaComplete = siswa.rata_tugas !== null && siswa.rata_ph !== null && siswa.nilai_pts !== null && siswa.nilai_pas !== null;
                        
                        return (
                          <tr key={siswa.id_siswa} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-center font-bold text-gray-900">{index + 1}</td>
                            <td className="px-6 py-4 font-semibold text-black">{siswa.nama_siswa}</td>
                            
                            <td className="px-6 py-4 text-center font-mono font-medium">
                              {siswa.rata_tugas !== null ? siswa.rata_tugas : <span className="text-red-500 font-bold">-</span>}
                            </td>
                            <td className="px-6 py-4 text-center font-mono font-medium">
                              {siswa.rata_ph !== null ? siswa.rata_ph : <span className="text-red-500 font-bold">-</span>}
                            </td>
                            <td className="px-6 py-4 text-center font-mono font-medium">
                              {siswa.nilai_pts !== null ? siswa.nilai_pts : <span className="text-red-500 font-bold">-</span>}
                            </td>
                            <td className="px-6 py-4 text-center font-mono font-medium">
                              {siswa.nilai_pas !== null ? siswa.nilai_pas : <span className="text-red-500 font-bold">-</span>}
                            </td>
                            
                            <td className="px-6 py-4 text-center flex justify-center">
                              {isSiswaComplete ? (
                                <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                  <CheckCircle2 className="w-4 h-4" /> <span className="text-xs font-bold">Lengkap</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                                  <XCircle className="w-4 h-4" /> <span className="text-xs font-bold">Kosong</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ACTION BUTTON BAWAH */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button 
                onClick={handleFinalisasi}
                disabled={!isAllComplete || isSubmitting || dataTampil.length === 0}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-extrabold text-white transition-all shadow-sm 
                  ${(!isAllComplete || isSubmitting || dataTampil.length === 0) 
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                    : "bg-black hover:bg-gray-800 cursor-pointer shadow-md transform hover:-translate-y-0.5"}`}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Sedang Menghitung...</>
                ) : !isAllComplete ? (
                  <><Lock className="w-5 h-5" /> Terkunci (Lengkapi Data)</>
                ) : (
                  <><Unlock className="w-5 h-5" /> Kunci & Hitung Rapor Kelas</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
