import { Fragment, useEffect, useState } from "react";
import { Menu, FileText, Loader2, ChevronDown } from "lucide-react";

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

// Tipe data sudah di-update untuk mengambil 'kelompok'
interface RaporNilai {
  id_rapor: string;
  mapel: string;
  kelompok: KelompokMapel; 
  guru: string;
  kktp: string | null;
  nilai_akhir: string | null;
  capaian_kompetensi: string;
}

interface FilterOption {
  id: string;
  label: string;
}

interface RaporData {
  filters: {
    riwayatOptions: FilterOption[];
    semesterOptions: FilterOption[];
    activeRiwayatId: string;
    activeSemesterId: string;
  };
  siswa: {
    nama_siswa: string;
    nis: string;
    nisn: string;
    nama_ayah: string;
  };
  kelas: {
    nama_kelas: string;
    jurusan: string;
    wali_kelas: string;
  };
  tahun_ajaran: string;
  semester: string;
  kepala_sekolah: string;
  tanggal_cetak: string;
  nilai: RaporNilai[];
  kehadiran: {
    sakit: number;
    izin: number;
    alpha: number;
  };
  catatan: string;
  ekstrakurikuler: {
    kegiatan: string;
    predikat: string;
    keterangan: string;
  }[];
}

export default function RaporSiswaContent({ onMenuClick }: { onMenuClick: () => void }) {
  const [dataRapor, setDataRapor] = useState<RaporData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // State untuk nilai dropdown yang dipilih user
  const [selectedRiwayat, setSelectedRiwayat] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  const fetchRapor = async (riwayatId?: string, semesterId?: string) => {
    // Gunakan loading transparan jika sekadar memfilter
    if (riwayatId || semesterId) setIsFiltering(true);
    else setIsLoading(true);
    
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      
      // Susun URL dengan query parameters jika ada
      let url = "http://187.127.121.139:3000/api/siswa-area/rapor";
      const params = new URLSearchParams();
      if (riwayatId) params.append("riwayat_id", riwayatId);
      if (semesterId) params.append("semester_id", semesterId);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (result.success) {
        setDataRapor(result.data);
        // Set dropdown state ke data aktif dari server
        setSelectedRiwayat(result.data.filters.activeRiwayatId);
        setSelectedSemester(result.data.filters.activeSemesterId);
      } else {
        setErrorMsg(result.message || "Rapor belum tersedia.");
      }
    } catch (error) {
      console.error("Gagal mengambil rapor siswa:", error);
      setErrorMsg("Terjadi kesalahan koneksi server.");
    } finally {
      setIsLoading(false);
      setIsFiltering(false);
    }
  };

  // Panggil data awal tanpa parameter
  useEffect(() => {
    fetchRapor();
  }, []);

  const handleTampilkan = () => {
    fetchRapor(selectedRiwayat, selectedSemester);
  };

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-[#f4f7fb] p-4 md:p-10 custom-scrollbar relative">
      {/* Header Content */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 bg-white rounded-lg shadow-sm cursor-pointer" onClick={onMenuClick}>
            <Menu className="w-6 h-6 text-black" />
          </button>
          <div>
            <p className="text-gray-500 font-medium text-sm md:text-base">Selamat Datang,</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-black">Rapor</h2>
          </div>
        </div>

        {/* 🔥 PANEL FILTER (Sesuai Referensi Gambar) */}
        {dataRapor && dataRapor.filters && (
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-blue-200/60 shadow-sm w-full md:w-auto">
            {/* Dropdown Kelas (Riwayat) */}
            <div className="relative w-full md:w-48">
              <select
                value={selectedRiwayat}
                onChange={(e) => setSelectedRiwayat(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black cursor-pointer"
              >
                {dataRapor.filters.riwayatOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Dropdown Semester */}
            <div className="relative w-full md:w-32">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black cursor-pointer"
              >
                {dataRapor.filters.semesterOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Tombol Tampilkan */}
            <button
              onClick={handleTampilkan}
              disabled={isFiltering}
              className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:bg-gray-500"
            >
              {isFiltering ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tampilkan"}
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
          <p className="font-bold text-gray-600">Memuat rapor siswa...</p>
        </div>
      ) : errorMsg ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-base font-bold text-gray-800">Rapor Belum Tersedia</p>
          <p className="text-sm text-gray-500 mt-1 text-center px-4">{errorMsg}</p>
        </div>
      ) : dataRapor ? (
        <div className={`animate-fade-in flex justify-center pb-20 transition-opacity duration-300 ${isFiltering ? 'opacity-50' : 'opacity-100'}`}>
          <div className="bg-white w-full max-w-5xl p-6 md:p-12 border border-gray-300 shadow-lg rounded-sm text-gray-900">
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold">
                <div className="grid grid-cols-[140px_10px_1fr] gap-y-1">
                  <span>Nama Peserta Didik</span><span>:</span><span>{dataRapor.siswa.nama_siswa}</span>
                  <span>NIS / NISN</span><span>:</span><span>{dataRapor.siswa.nis} / {dataRapor.siswa.nisn}</span>
                  <span>Nama Sekolah</span><span>:</span><span>SMK Swasta Parulian 1 Medan</span>
                  <span>Alamat</span><span>:</span><span>Jl. Stadion Teladan No. 23 Medan</span>
                </div>
                <div className="grid grid-cols-[140px_10px_1fr] gap-y-1">
                  <span>Kelas</span><span>:</span><span>{dataRapor.kelas.nama_kelas}</span>
                  <span>Konsentrasi Keahlian</span><span>:</span><span>{dataRapor.kelas.jurusan}</span>
                  <span>Fase / Semester</span><span>:</span><span>{getFaseRapor(dataRapor.kelas.nama_kelas)} / {formatSemesterRapor(dataRapor.semester)}</span>
                  <span>Tahun Pelajaran</span><span>:</span><span>{dataRapor.tahun_ajaran}</span>
                </div>
              </div>

              <h3 className="text-center text-lg md:text-xl font-extrabold mt-6 uppercase tracking-wide">
                Laporan Hasil Belajar
              </h3>
            </div>

            <div className="mb-8">
              <h4 className="font-bold text-sm mb-3">I. Nilai Akademik</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-400 min-w-[760px]">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-400 px-3 py-2 text-center w-12">NO</th>
                      <th className="border border-gray-400 px-3 py-2 text-center">MATA PELAJARAN</th>
                      <th className="border border-gray-400 px-3 py-2 text-center w-16">KKTP</th>
                      <th className="border border-gray-400 px-3 py-2 text-center w-16">NA</th>
                      <th className="border border-gray-400 px-3 py-2 text-center w-72">CAPAIAN KOMPETENSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataRapor.nilai.length > 0 ? (
                      RAPOR_GROUPS.map(({ key, label }) => {
                        // filter menggunakan data bersih dari database
                        const items = dataRapor.nilai.filter((item) => item.kelompok === key);
                        if (items.length === 0) return null;
                        return (
                          <Fragment key={key}>
                            <tr>
                              <td colSpan={5} className="border border-gray-400 px-3 py-2 font-bold bg-gray-50">
                                {label}
                              </td>
                            </tr>
                            {items.map((item, index) => (
                              <tr key={item.id_rapor}>
                                <td className="border border-gray-400 px-3 py-2 text-center align-middle font-semibold">{index + 1}</td>
                                <td className="border border-gray-400 px-3 py-2 font-semibold">{item.mapel}</td>
                                <td className="border border-gray-400 px-3 py-2 text-center align-middle">{formatNilaiRapor(item.kktp)}</td>
                                <td className="border border-gray-400 px-3 py-2 text-center align-middle font-bold leading-none tabular-nums whitespace-nowrap">{formatNilaiRapor(item.nilai_akhir)}</td>
                                <td className="border border-gray-400 px-3 py-2 text-xs leading-relaxed">{item.capaian_kompetensi}</td>
                              </tr>
                            ))}
                          </Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="border border-gray-400 px-3 py-8 text-center text-gray-500 font-semibold">
                          Nilai pada periode ini belum diterbitkan / disetujui kepala sekolah.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="font-bold text-sm mb-3">II. Ekstrakurikuler</h4>
              <table className="w-full text-sm border-collapse border border-gray-400">
                <thead>
                  <tr className="font-bold text-center bg-gray-50">
                    <th className="border border-gray-400 px-3 py-2 w-12">NO</th>
                    <th className="border border-gray-400 px-3 py-2">KEGIATAN EKSTRAKURIKULER</th>
                    <th className="border border-gray-400 px-3 py-2 w-28">PREDIKAT</th>
                    <th className="border border-gray-400 px-3 py-2">KETERANGAN</th>
                  </tr>
                </thead>
                <tbody>
                  {dataRapor.ekstrakurikuler.length > 0 ? (
                    dataRapor.ekstrakurikuler.map((item, index) => (
                      <tr key={`${item.kegiatan}-${index}`}>
                        <td className="border border-gray-400 px-3 py-2 font-semibold w-12 text-center">{index + 1}</td>
                        <td className="border border-gray-400 px-3 py-2 font-semibold">{item.kegiatan}</td>
                        <td className="border border-gray-400 px-3 py-2 text-center w-28">{item.predikat}</td>
                        <td className="border border-gray-400 px-3 py-2">{item.keterangan || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="border border-gray-400 px-3 py-2 font-semibold w-12 text-center">1</td>
                      <td className="border border-gray-400 px-3 py-2 font-semibold">-</td>
                      <td className="border border-gray-400 px-3 py-2 text-center w-28">-</td>
                      <td className="border border-gray-400 px-3 py-2">-</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-sm mb-3">III. Ketidakhadiran</h4>
                <div className="border border-gray-400 rounded-sm">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-400">
                        <td className="px-4 py-2 font-semibold">Sakit</td>
                        <td className="px-4 py-2 w-4 text-center">:</td>
                        <td className="px-4 py-2">{dataRapor.kehadiran.sakit} hari</td>
                      </tr>
                      <tr className="border-b border-gray-400">
                        <td className="px-4 py-2 font-semibold">Izin</td>
                        <td className="px-4 py-2 w-4 text-center">:</td>
                        <td className="px-4 py-2">{dataRapor.kehadiran.izin} hari</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-semibold">Tanpa Keterangan</td>
                        <td className="px-4 py-2 w-4 text-center">:</td>
                        <td className="px-4 py-2">{dataRapor.kehadiran.alpha} hari</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-3">IV. Catatan Wali Kelas</h4>
                <div className="border border-gray-400 min-h-32 p-4 text-sm italic leading-relaxed text-gray-700">
                  {dataRapor.catatan ? `"${dataRapor.catatan}"` : "-"}
                </div>
              </div>
            </div>

           

          </div>
        </div>
      ) : null}
    </main>
  );
}
