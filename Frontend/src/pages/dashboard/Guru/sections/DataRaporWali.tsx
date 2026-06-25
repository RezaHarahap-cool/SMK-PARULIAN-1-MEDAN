import { useEffect, useState } from "react";
import { Menu, ChevronDown, Loader2, Save, SearchX } from "lucide-react";
import Swal from "sweetalert2";

type PredikatEkskul = "" | "SANGAT_BAIK" | "BAIK" | "CUKUP" | "KURANG" | "SANGAT_BURUK";

interface OptionItem {
  id: string;
  label: string;
}

interface SiswaRaporWali {
  riwayat_id: string;
  id_siswa: string;
  nama_siswa: string;
  nisn: string;
  predikat: PredikatEkskul;
  keterangan: string;
  catatan: string;
  nilai_prakerin: string;
}

interface RaporWaliData {
  kelasOptions: OptionItem[];
  semesterOptions: OptionItem[];
  activeKelasId: string;
  activeSemesterId: string;
  kelas: {
    nama_kelas: string;
    jurusan: string;
    tahun_ajaran: string;
  };
  ekstrakurikuler: {
    id: string;
    nama: string;
  };
  prakerin: {
    tersedia: boolean;
    mapel: string;
    guru: string | null;
  };
  siswa: SiswaRaporWali[];
}

const predikatOptions: { value: Exclude<PredikatEkskul, "">; label: string }[] = [
  { value: "SANGAT_BAIK", label: "Sangat Baik" },
  { value: "BAIK", label: "Baik" },
  { value: "CUKUP", label: "Cukup" },
  { value: "KURANG", label: "Kurang" },
  { value: "SANGAT_BURUK", label: "Sangat Buruk" },
];

export default function DataRaporWali({ onMenuClick }: { onMenuClick: () => void }) {
  const [data, setData] = useState<RaporWaliData | null>(null);
  const [rows, setRows] = useState<SiswaRaporWali[]>([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchData = async (kelasId?: string, semesterId?: string) => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (kelasId) params.append("kelas_id", kelasId);
      if (semesterId) params.append("semester_id", semesterId);

      const url = `http://187.127.121.139:3000/api/wali-kelas/rapor-pendukung${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();

      if (result.success) {
        const normalizedRows: SiswaRaporWali[] = result.data.siswa.map((row: SiswaRaporWali) => ({
          ...row,
          nilai_prakerin: row.nilai_prakerin == null ? "" : String(row.nilai_prakerin),
        }));
        const normalizedData: RaporWaliData = {
          ...result.data,
          prakerin: result.data.prakerin || {
            tersedia: false,
            mapel: "Praktik Kerja Lapangan (Prakerin) 6 bulan",
            guru: null,
          },
          siswa: normalizedRows,
        };

        setData(normalizedData);
        setRows(normalizedRows);
        setSelectedKelas(result.data.activeKelasId);
        setSelectedSemester(result.data.activeSemesterId);
      } else {
        setErrorMsg(result.message || "Data rapor wali tidak dapat dimuat.");
      }
    } catch (error) {
      console.error("Gagal mengambil data rapor wali:", error);
      setErrorMsg("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateRow = (riwayatId: string, field: keyof Pick<SiswaRaporWali, "predikat" | "keterangan" | "catatan" | "nilai_prakerin">, value: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.riwayat_id === riwayatId ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSave = async () => {
    if (!data) return;

    const belumLengkap = rows.filter((row) => !row.predikat);
    if (belumLengkap.length > 0) {
      Swal.fire({
        title: "Predikat belum lengkap",
        text: "Pilih predikat Pramuka untuk semua siswa sebelum menyimpan.",
        icon: "warning",
        confirmButtonColor: "#000000",
      });
      return;
    }

    const nilaiPrakerinTidakValid = rows.filter((row) => {
      if (!row.nilai_prakerin.trim()) return false;
      const nilai = Number(row.nilai_prakerin);
      return Number.isNaN(nilai) || nilai < 0 || nilai > 100;
    });

    if (nilaiPrakerinTidakValid.length > 0) {
      Swal.fire({
        title: "Nilai Prakerin tidak valid",
        text: "Nilai Prakerin harus berupa angka 0 sampai 100 atau dikosongkan.",
        icon: "warning",
        confirmButtonColor: "#000000",
      });
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://187.127.121.139:3000/api/wali-kelas/rapor-pendukung", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          kelas_id: selectedKelas,
          semester_id: selectedSemester,
          items: rows.map((row) => ({
            riwayat_id: row.riwayat_id,
            predikat: row.predikat,
            keterangan: row.keterangan,
            catatan: row.catatan,
            nilai_prakerin: row.nilai_prakerin,
          })),
        }),
      });

      const result = await res.json();

      if (result.success) {
        await Swal.fire({
          title: "Berhasil",
          text: result.message || "Data rapor wali berhasil disimpan.",
          icon: "success",
          confirmButtonColor: "#000000",
        });
        fetchData(selectedKelas, selectedSemester);
      } else {
        Swal.fire({
          title: "Gagal",
          text: result.message || "Gagal menyimpan data rapor wali.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Gagal menyimpan data rapor wali:", error);
      Swal.fire({
        title: "Koneksi bermasalah",
        text: "Terjadi kesalahan jaringan saat menyimpan data.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTampilkan = () => {
    fetchData(selectedKelas, selectedSemester);
  };

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-[#f4f7fb] p-6 md:p-10 custom-scrollbar">
      <div className="flex items-center gap-4 mb-8">
        <button className="lg:hidden p-2 bg-white rounded-lg shadow-sm cursor-pointer" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">Rapor Wali Kelas</h2>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-end gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <label className="block">
              <span className="text-xs font-bold text-gray-500 uppercase">Kelas Wali</span>
              <div className="relative mt-1">
                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  disabled={!data}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm font-bold text-gray-800 outline-none focus:border-black disabled:opacity-60"
                >
                  {data?.kelasOptions.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-bold text-gray-500 uppercase">Semester</span>
              <div className="relative mt-1">
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  disabled={!data}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm font-bold text-gray-800 outline-none focus:border-black disabled:opacity-60"
                >
                  {data?.semesterOptions.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleTampilkan}
              disabled={isLoading || !selectedKelas || !selectedSemester}
              className="rounded-xl bg-gray-100 px-5 py-3 text-sm font-extrabold text-gray-800 hover:bg-gray-200 disabled:opacity-50"
            >
              Tampilkan
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading || rows.length === 0}
              className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-extrabold text-white hover:bg-gray-800 disabled:bg-gray-400"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan
            </button>
          </div>
        </div>

        {data && (
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-900">
            {data.kelas.nama_kelas} - {data.kelas.jurusan} | Tahun Ajaran {data.kelas.tahun_ajaran} | Ekstrakurikuler: {data.ekstrakurikuler.nama}
            {` | Prakerin: ${data.prakerin?.mapel || "Praktik Kerja Lapangan (Prakerin) 6 bulan"}`}
          </div>
        )}
      </div>

      {errorMsg ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 font-bold text-red-600">
          {errorMsg}
        </div>
      ) : isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <Loader2 className="mb-3 h-10 w-10 animate-spin text-blue-600" />
          <p className="font-bold text-gray-500">Memuat data siswa...</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-20">
          <SearchX className="mb-3 h-12 w-12 text-gray-300" />
          <p className="font-bold text-gray-700">Belum ada siswa pada kelas ini.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] text-left text-sm">
              <thead className="border-b border-gray-200 bg-[#f8f9fa] font-bold text-gray-800">
                <tr>
                  <th className="px-5 py-4 w-16 text-center">No</th>
                  <th className="px-5 py-4 w-64">Nama Siswa</th>
                  <th className="px-5 py-4 w-40">NISN</th>
                  <th className="px-5 py-4 w-40">Nilai Prakerin</th>
                  <th className="px-5 py-4 w-44">Predikat Pramuka</th>
                  <th className="px-5 py-4 w-64">Keterangan Ekskul</th>
                  <th className="px-5 py-4">Catatan Rapor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, index) => (
                  <tr key={row.riwayat_id} className="align-top hover:bg-gray-50">
                    <td className="px-5 py-4 text-center font-bold text-gray-500">{index + 1}</td>
                    <td className="px-5 py-4 font-extrabold text-gray-900">{row.nama_siswa}</td>
                    <td className="px-5 py-4 font-mono font-semibold text-gray-600">{row.nisn}</td>
                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={row.nilai_prakerin}
                        onChange={(e) => updateRow(row.riwayat_id, "nilai_prakerin", e.target.value)}
                        placeholder="Opsional"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold outline-none focus:border-black disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={row.predikat}
                        onChange={(e) => updateRow(row.riwayat_id, "predikat", e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-800 outline-none focus:border-black"
                      >
                        <option value="">Pilih</option>
                        {predikatOptions.map((item) => (
                          <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <input
                        value={row.keterangan}
                        onChange={(e) => updateRow(row.riwayat_id, "keterangan", e.target.value)}
                        placeholder="Contoh: Aktif mengikuti latihan"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <textarea
                        value={row.catatan}
                        onChange={(e) => updateRow(row.riwayat_id, "catatan", e.target.value)}
                        placeholder="Catatan wali kelas untuk rapor siswa"
                        className="min-h-20 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
