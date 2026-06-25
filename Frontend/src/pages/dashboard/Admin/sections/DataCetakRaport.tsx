import React, { useState, useRef, useEffect } from "react";
import { Printer, Filter, Loader2, Menu, AlertCircle, CheckCircle } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import Swal from "sweetalert2";

type KelompokMapel = "UMUM" | "MULOK" | "KEJURUAN";

const RAPOR_GROUPS: { key: KelompokMapel; label: string }[] = [
  { key: "UMUM", label: "A. Kelompok Mata Pelajaran Umum" },
  { key: "MULOK", label: "Muatan Lokal" },
  { key: "KEJURUAN", label: "B. Kelompok Mata Pelajaran Kejuruan" },
];

const formatNilaiRapor = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || String(value).trim() === "") return "";
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? String(Math.round(numericValue)) : "-";
};

const formatSemesterRapor = (value: string) => {
  const normalized = String(value || "").toLowerCase();
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : "-";
};

const getFaseRapor = (kelas: string) => {
  const tingkat = String(kelas || "").trim().split(/\s+/)[0]?.toUpperCase();
  return tingkat === "X" ? "E" : "F";
};

// Tipe Data untuk Rapor utuh
interface SiswaCetak {
  id_siswa: string;
  nama_siswa: string;
  nis: string;
  nisn: string;
  kelas: string;
  jurusan: string;
  semester: string;
  tahun_pelajaran: string;
  nama_wali_kelas: string;
  nama_ayah: string;
  nama_kepsek: string;
  tanggal_cetak: string;
  kehadiran: {
    sakit: number;
    izin: number;
    alpha: number;
  };
  catatan: string;
  kelengkapan_wali?: {
    lengkap: boolean;
    kurang: string[];
  };
  ekstrakurikuler: {
    kegiatan: string;
    predikat: string;
    keterangan: string;
  }[];
  nilai: {
    mapel: string;
    kelompok: KelompokMapel;
    kktp: number | string | null;
    nilai_akhir: number | string | null;
    capaian: string;
  }[];
}

// Tipe Data untuk Tabel List Siswa
interface ListSiswa {
  id_riwayat: string;
  nama_siswa: string;
  nisn: string;
  rapor_pendukung_lengkap?: boolean;
  kurang_rapor_pendukung?: string[];
}

export default function DataCetakRaport({ onMenuClick }: { onMenuClick: () => void }) {
  // State untuk Dropdown & Tabel
  const [listKelas, setListKelas] = useState<{ id_kelas: string; nama_kelas: string }[]>([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [listSiswa, setListSiswa] = useState<ListSiswa[]>([]);
  
  // State untuk Data Cetak & Loading
  const [dataRapor, setDataRapor] = useState<SiswaCetak | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState<string | null>(null); // Menyimpan id_riwayat yang sedang diproses cetak
  const [errorMsg, setErrorMsg] = useState("");
  
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: dataRapor ? `Rapor_${dataRapor.nama_siswa.replace(/\s+/g, '_')}` : "Rapor_Siswa",
  });

  // Trik React: Tunggu dataRapor masuk ke state, baru buka dialog Print
  useEffect(() => {
    if (dataRapor && isPrinting) {
      handlePrint();
      setIsPrinting(null); // Reset setelah jendela print terbuka
    }
  }, [dataRapor, isPrinting, handlePrint]);

  // ==========================================
  // 1. Ambil Daftar Kelas saat Halaman Dibuka
  // ==========================================
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://187.127.121.139:3000/api/kelas", { // Sesuaikan dengan endpoint getKelas milikmu
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) setListKelas(result.data);
      } catch (error) {
        console.error("Gagal menarik data kelas", error);
      }
    };
    fetchKelas();
  }, []);

  // ==========================================
  // 2. Ambil Daftar Siswa Berdasarkan Kelas
  // ==========================================
  const cariSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKelas) return;

    setIsLoading(true);
    setErrorMsg("");
    setListSiswa([]);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://187.127.121.139:3000/api/admin/siswa-siap-cetak/${selectedKelas}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();

      if (result.success) {
        setListSiswa(result.data);
      } else {
        setErrorMsg(result.message);
      }
    } catch (error) {
      setErrorMsg("Gagal terhubung ke server database.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 3. Proses Tarik Detail Rapor & Langsung Cetak
  // ==========================================
  const siapkanCetak = async (id_riwayat: string) => {
    setIsPrinting(id_riwayat);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://187.127.121.139:3000/api/admin/cetak-rapor/${id_riwayat}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();

      if (result.success) {
        if (result.data.kelengkapan_wali && !result.data.kelengkapan_wali.lengkap) {
          await Swal.fire({
            title: "Rapor belum lengkap",
            html: `Rapor belum bisa dicetak karena data berikut belum diisi wali kelas:<br><br><b>${result.data.kelengkapan_wali.kurang.join(", ")}</b>`,
            icon: "warning",
            confirmButtonColor: "#000000",
          });
          setIsPrinting(null);
          return;
        }

        // Set data ke state. Setelah render selesai, useEffect di atas akan memanggil handlePrint()
        setDataRapor(result.data);
      } else {
        Swal.fire("Gagal", result.message || "Gagal memuat data rapor.", "error");
        setIsPrinting(null);
      }
    } catch (error) {
      Swal.fire("Koneksi bermasalah", "Terjadi kesalahan jaringan.", "error");
      setIsPrinting(null);
    }
  };

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-[#f4f7fb] p-6 md:p-10 relative">
      
      {/* HEADER UI ADMIN */}
      <div className="flex items-center gap-4 mb-8">
        <button className="lg:hidden p-2 bg-white rounded-lg shadow-sm cursor-pointer" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">Cetak Rapor Siswa</h2>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 mb-8 w-full max-w-6xl">
        
        {/* PANEL KIRI: FILTER KELAS */}
        <div className="w-full xl:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
          <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" /> Filter Pencarian
          </h3>
          <form onSubmit={cariSiswa} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pilih Kelas</label>
              <select 
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 focus:ring-2 focus:ring-black/5 outline-none cursor-pointer"
              >
                <option value="">-- Pilih Kelas --</option>
                {listKelas.map((k) => (
                  <option key={k.id_kelas} value={k.id_kelas}>{k.nama_kelas}</option>
                ))}
              </select>
            </div>
            <button 
              type="submit" 
              disabled={isLoading || !selectedKelas} 
              className="w-full bg-black hover:bg-gray-800 text-white px-6 py-3.5 rounded-xl font-extrabold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tampilkan Siswa"}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 flex items-start gap-2 bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm font-bold">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> {errorMsg}
            </div>
          )}
        </div>

        {/* PANEL KANAN: TABEL HASIL */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-black mb-4">Daftar Rapor Disetujui (Siap Cetak)</h3>
          
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-800 font-bold">
                  <tr>
                    <th className="px-6 py-4 w-16 text-center">No</th>
                    <th className="px-6 py-4">Nama Siswa</th>
                    <th className="px-6 py-4 text-center">NISN</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {listSiswa.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                        Silakan pilih kelas untuk menampilkan data siswa.
                      </td>
                    </tr>
                  ) : (
                    listSiswa.map((siswa, idx) => (
                      <tr key={siswa.id_riwayat} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-center font-bold text-gray-900">{idx + 1}</td>
                        <td className="px-6 py-4 font-extrabold text-black">{siswa.nama_siswa}</td>
                        <td className="px-6 py-4 text-center font-medium text-gray-600">{siswa.nisn}</td>
                        <td className="px-6 py-4 text-center">
                          {siswa.rapor_pendukung_lengkap === false ? (
                            <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full text-xs font-bold">
                              <AlertCircle className="w-3.5 h-3.5" /> Wali belum lengkap
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold">
                              <CheckCircle className="w-3.5 h-3.5" /> Siap cetak
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 flex justify-center">
                          <button 
                            onClick={() => siapkanCetak(siswa.id_riwayat)}
                            disabled={isPrinting !== null}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs text-white transition-all shadow-sm ${
                              isPrinting === siswa.id_riwayat ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            }`}
                          >
                            {isPrinting === siswa.id_riwayat ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Menyiapkan PDF</>
                            ) : (
                              <><Printer className="w-4 h-4" /> Cetak Rapor</>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* AREA KERTAS CETAK (TEMPLATE RAPOR ASLI) */}
      {/* ========================================== */}
      
      {dataRapor && (
        <div className="hidden print:block">
          <div
            ref={contentRef}
            className="w-full bg-white p-8 font-sans text-black relative"
            style={{
              width: "210mm",
              minHeight: "297mm",
              color: "#000",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontStyle: "normal"
            }}
          >
            
            {/* WATERMARK YAYASAN */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
              <img src="/logo-yayasan.png" alt="Watermark" className="w-[400px] h-auto grayscale" />
            </div>

            <div className="relative z-10">
              <div className="grid grid-cols-2 gap-4 text-sm font-bold mb-4">
                <table className="w-full">
                  <tbody>
                    <tr><td className="py-1">Nama Peserta Didik</td><td>:</td><td>{dataRapor.nama_siswa}</td></tr>
                    <tr><td className="py-1">NIS / NISN</td><td>:</td><td>{dataRapor.nis} / {dataRapor.nisn}</td></tr>
                    <tr><td className="w-36 py-1">Nama Sekolah</td><td className="w-4">:</td><td>SMK Swasta Parulian 1 Medan</td></tr>
                    <tr><td className="py-1">Alamat</td><td>:</td><td>Jl. Stadion Teladan No. 23 Medan</td></tr>
                  </tbody>
                </table>
                <table className="w-full">
                  <tbody>
                    <tr><td className="w-36 py-1">Kelas</td><td className="w-4">:</td><td>{dataRapor.kelas}</td></tr>
                    <tr><td className="py-1">Konsentrasi Keahlian</td><td>:</td><td>{dataRapor.jurusan}</td></tr>
                    <tr><td className="py-1">Fase / Semester</td><td>:</td><td>{getFaseRapor(dataRapor.kelas)} / {formatSemesterRapor(dataRapor.semester)}</td></tr>
                    <tr><td className="py-1">Tahun Pelajaran</td><td>:</td><td>{dataRapor.tahun_pelajaran}</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-center text-lg font-extrabold uppercase mb-4">
                Laporan Hasil Belajar
              </h3>

              <h4 className="font-bold text-sm mb-2">I. Nilai Akademik</h4>
              <table className="w-full table-fixed border-collapse border-2 border-black text-sm">
                <thead className="bg-gray-100 font-bold text-center">
                  <tr>
                    <th className="border border-black p-2 w-[10mm]">NO</th>
                    <th className="border border-black p-2 w-[55mm]">MATA PELAJARAN</th>
                    <th className="border border-black p-2 w-[16mm]">KKTP</th>
                    <th className="border border-black p-2 w-[18mm]">NA</th>
                    <th className="border border-black p-2">CAPAIAN KOMPETENSI</th>
                  </tr>
                </thead>
                <tbody>
                  {RAPOR_GROUPS.map(({ key, label }) => {
                    const items = dataRapor.nilai.filter((item) => item.kelompok === key);
                    if (items.length === 0) return null;
                    return (
                      <React.Fragment key={key}>
                        <tr>
                          <td colSpan={5} className="border border-black p-2 font-bold bg-gray-50">
                            {label}
                          </td>
                        </tr>
                        {items.map((item, idx) => (
                          <tr key={`${key}-${item.mapel}-${idx}`}>
                            <td className="border border-black p-2 text-center align-middle font-bold leading-none tabular-nums not-italic">{idx + 1}</td>
                            <td className="border border-black p-2 font-bold leading-snug whitespace-normal">{item.mapel}</td>
                            <td className="border border-black p-2 text-center align-middle leading-none tabular-nums not-italic">{formatNilaiRapor(item.kktp)}</td>
                            <td className="border border-black p-2 text-center align-middle font-bold leading-none tabular-nums not-italic whitespace-nowrap">{formatNilaiRapor(item.nilai_akhir)}</td>
                            <td className="border border-black p-2 text-justify text-xs leading-relaxed">{item.capaian}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>

              <div className="mt-6 text-sm break-inside-avoid">
                <h4 className="font-bold mb-2">II. Ekstrakurikuler</h4>
                <table className="w-full border-collapse border border-black">
                  <thead>
                    <tr className="font-bold text-center">
                      <th className="border border-black p-2 w-12">NO</th>
                      <th className="border border-black p-2">KEGIATAN EKSTRAKURIKULER</th>
                      <th className="border border-black p-2 w-28">PREDIKAT</th>
                      <th className="border border-black p-2">KETERANGAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataRapor.ekstrakurikuler.length > 0 ? (
                      dataRapor.ekstrakurikuler.map((item, index) => (
                        <tr key={`${item.kegiatan}-${index}`}>
                          <td className="border border-black p-2 text-center font-semibold w-12">{index + 1}</td>
                          <td className="border border-black p-2 font-semibold">{item.kegiatan}</td>
                          <td className="border border-black p-2 text-center w-24">{item.predikat}</td>
                          <td className="border border-black p-2">{item.keterangan || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="border border-black p-2 text-center font-semibold w-12">1</td>
                        <td className="border border-black p-2 font-semibold">-</td>
                        <td className="border border-black p-2 text-center w-24">-</td>
                        <td className="border border-black p-2">-</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-6 text-sm break-inside-avoid">
                <div>
                  <h4 className="font-bold mb-2">III. Ketidakhadiran</h4>
                  <table className="w-full border-collapse border border-black">
                    <tbody>
                      <tr><td className="border border-black p-2 font-semibold">Sakit</td><td className="border border-black p-2 text-center w-8">:</td><td className="border border-black p-2">{dataRapor.kehadiran.sakit} hari</td></tr>
                      <tr><td className="border border-black p-2 font-semibold">Izin</td><td className="border border-black p-2 text-center">:</td><td className="border border-black p-2">{dataRapor.kehadiran.izin} hari</td></tr>
                      <tr><td className="border border-black p-2 font-semibold">Tanpa Keterangan</td><td className="border border-black p-2 text-center">:</td><td className="border border-black p-2">{dataRapor.kehadiran.alpha} hari</td></tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <h4 className="font-bold mb-2">IV. Catatan</h4>
                  <div className="border border-black min-h-28 p-3 text-xs leading-relaxed">
                    {dataRapor.catatan || "-"}
                  </div>
                </div>
              </div>

              <div className="mt-12 flex justify-between px-8 text-sm break-inside-avoid">
                <div className="text-center">
                  <p className="mb-20">Orang Tua/Wali,</p>
                  <p className="font-bold underline decoration-1">{dataRapor.nama_ayah}</p>
                </div>
                <div className="text-center">
                  <p>Medan, {dataRapor.tanggal_cetak}</p>
                  <p className="mb-20">Wali Kelas,</p>
                  <p className="font-bold underline decoration-1">{dataRapor.nama_wali_kelas}</p>
                  <p>NIP. -</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </main>
  );
}
