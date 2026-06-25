import React, { useState, useEffect } from "react";
import { Menu, AlertCircle, CheckCircle2, Power, Loader2 } from "lucide-react";
import Swal from "sweetalert2"; // 🔥 IMPORT SWEETALERT2

// Tipe Data Semester
interface Semester {
  id_semester: string;
  semester: "GANJIL" | "GENAP";
  status: "AKTIF" | "NON_AKTIF";
}

export default function SemesterContent({ onMenuClick }: { onMenuClick: () => void }) {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // ==========================================
  // FUNGSI 1: AMBIL DATA (GET)
  // ==========================================
  const fetchSemesters = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      const response = await fetch("http://187.127.121.139:3000/api/semesters", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        setSemesters(result.data);
      } else {
        setErrorMsg(result.message || "Gagal memuat data semester.");
      }
    } catch (error) {
      console.error("Gagal menarik data semester:", error);
      setErrorMsg("Kesalahan koneksi ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  // ==========================================
  // FUNGSI 2: SAKLAR AKTIFKAN SEMESTER (PATCH)
  // ==========================================
  const handleAktifkan = async (id_aktif: string, nama_semester: string) => {
    // 🔥 SweetAlert Konfirmasi
    const resultAlert = await Swal.fire({
      title: "Aktifkan Semester?",
      text: `Seluruh sistem akan beralih ke Semester ${nama_semester}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Aktifkan!",
      cancelButtonText: "Batal"
    });

    if (resultAlert.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://187.127.121.139:3000/api/semesters/${id_aktif}/aktifkan`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const result = await response.json();

        if (result.success) {
          // 🔥 SweetAlert Sukses
          Swal.fire({
            title: "Berhasil!",
            text: `Semester ${nama_semester} sekarang aktif.`,
            icon: "success",
            confirmButtonColor: "#000000"
          });
          fetchSemesters(); // Refresh data
        } else {
          // 🔥 SweetAlert Error
          Swal.fire({
            title: "Gagal!",
            text: result.message || "Gagal mengaktifkan semester.",
            icon: "error",
            confirmButtonColor: "#d33"
          });
        }
      } catch (error) {
        console.error("Gagal:", error);
        Swal.fire({
          title: "Server Error",
          text: "Terjadi kesalahan koneksi.",
          icon: "error",
          confirmButtonColor: "#d33"
        });
      }
    }
  };

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-gray-50 p-6 md:p-10">
      
      {/* HEADER CONTENT */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          className="lg:hidden p-2 bg-white rounded-lg shadow-sm cursor-pointer" 
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">
            Manajemen Semester
          </h2>
        </div>
      </div>

      {/* INFO ALERT */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800 font-medium leading-relaxed">
          <strong>Perhatian:</strong> Mengubah status semester akan berdampak pada seluruh aplikasi (Absensi, Rapor, dan Jadwal).
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-600 font-bold">
          {errorMsg}
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">Daftar Semester</h3>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-500 font-medium">Memuat data semester...</span>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 font-bold">
                  <tr>
                    <th className="px-6 py-4 w-16 text-center">No</th>
                    <th className="px-6 py-4">Jenis Semester</th>
                    <th className="px-6 py-4">Status Saat Ini</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {semesters.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500 font-medium">Belum ada data.</td>
                    </tr>
                  ) : (
                    semesters.map((item, index) => {
                      const isAktif = item.status === "AKTIF";
                      return (
                        <tr key={item.id_semester} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-center font-bold text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4 font-bold text-black">Semester {item.semester}</td>
                          <td className="px-6 py-4">
                            {isAktif ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold text-xs border border-green-200">
                                <CheckCircle2 className="w-3.5 h-3.5" /> AKTIF
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-semibold text-xs border ">
                                NON_AKTIF
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleAktifkan(item.id_semester, item.semester)}
                              disabled={isAktif}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm ${
                                isAktif
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                  : "bg-black text-white hover:bg-gray-800 cursor-pointer"
                              }`}
                            >
                              <Power className="w-4 h-4" />
                              {isAktif ? "Sedang Aktif" : "Aktifkan"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}