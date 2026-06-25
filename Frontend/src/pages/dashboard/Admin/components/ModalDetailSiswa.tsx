import React, { useState, useEffect } from "react";
import { 
  X, UserCircle, Hash, GraduationCap, 
  Phone, User, Image as ImageIcon, Users, 
  Loader2, ShieldCheck, Mail, MapPin, FileText, Briefcase, History
} from "lucide-react";

// Tipe Data Dasar dari Tabel
interface SiswaItem {
  id: string;
  nis: string;
  nama: string;
  jk: "L" | "P";
  kelas: string;
  jurusan: string;
  namaAyah: string;
  noHpWali: string;
  foto: string;
}

// Tipe Data untuk Riwayat Kelas dari Backend
interface RiwayatKelas {
  id_riwayat: string;
  status_kenaikan: string;
  kelas: {
    nama_kelas: string;
    jurusan?: { jurusan: string };
    wali_kelas?: { nama_guru: string };
  };
  tahun_ajaran: {
    tahun: string;
  };
}

// Tipe Data Lengkap Hasil Fetch API
interface SiswaDetailLengkap {
  username: string;
  email: string;
  is_active: boolean;
  npsn: string;
  nisn: string;
  tempat_tgl_lahir: string;
  nama_ibu: string;
  pekerjaan_ayah: string;
  pekerjaan_ibu: string;
  alamat: string;
  desa_kelurahan: string;
  kecamatan: string;
  kabupaten_kota: string;
  provinsi: string;
  riwayat_kelas: RiwayatKelas[];
}

interface ModalDetailSiswaProps {
  siswa: SiswaItem | null;
  onClose: () => void;
}

export default function ModalDetailSiswa({ siswa, onClose }: ModalDetailSiswaProps) {
  const [detailLengkap, setDetailLengkap] = useState<SiswaDetailLengkap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Efek untuk menarik data detail saat modal terbuka
  useEffect(() => {
    if (siswa) {
      const fetchDetailSiswa = async () => {
        setIsLoading(true);
        setErrorMsg("");
        
        try {
          const token = localStorage.getItem("token");
          
          const res = await fetch(`http://187.127.121.139:3000/api/siswa/${siswa.id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          
          const result = await res.json();
          
          if (result.success) {
            const dataDb = result.data;
            // Mapping disesuaikan karena Prisma menarik dari tabel siswa_profiles sebagai root
            setDetailLengkap({
              username: dataDb.user?.username || "-",
              email: dataDb.user?.email || "-",
              is_active: dataDb.user?.is_active ?? false,
              npsn: dataDb.npsn || "-",
              nisn: dataDb.nisn || "-",
              tempat_tgl_lahir: dataDb.tempat_tgl_lahir || "-",
              nama_ibu: dataDb.nama_ibu || "-",
              pekerjaan_ayah: dataDb.pekerjaan_ayah || "-",
              pekerjaan_ibu: dataDb.pekerjaan_ibu || "-",
              alamat: dataDb.alamat || "-",
              desa_kelurahan: dataDb.desa_kelurahan || "-",
              kecamatan: dataDb.kecamatan || "-",
              kabupaten_kota: dataDb.kabupaten_kota || "-",
              provinsi: dataDb.provinsi || "-",
              riwayat_kelas: dataDb.riwayat_kelas || [] // Masukkan riwayat akademik
            });
          } else {
            setErrorMsg(result.message);
          }
        } catch (error) {
          console.error("Gagal menarik detail siswa:", error);
          setErrorMsg("Gagal terhubung ke server.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchDetailSiswa();
    } else {
      setDetailLengkap(null);
    }
  }, [siswa]);

  if (!siswa) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-0 py-10">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in z-10">
        
        {/* Header Modal - Fixed */}
        <div className="bg-[#f8f9fa] border-b border-gray-100 px-6 py-4 flex justify-between items-center shrink-0 rounded-t-3xl">
          <h3 className="text-lg font-bold text-black flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-gray-500" /> Profil Detail Siswa
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 bg-white rounded-full shadow-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* State Loading */}
        {isLoading && (
          <div className="p-20 flex flex-col items-center justify-center text-gray-500 flex-1">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-black" />
            <p className="text-sm font-medium">Menarik data dari database...</p>
          </div>
        )}

        {/* State Error */}
        {!isLoading && errorMsg && (
          <div className="p-6">
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center font-medium">
              {errorMsg}
            </div>
          </div>
        )}

        {/* Body Content - Tampil setelah selesai loading */}
        {!isLoading && !errorMsg && detailLengkap && (
          <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-8 items-start">
            
            {/* Bagian Kiri: Foto & Status Akun (Sticky di Desktop) */}
            <div className="flex flex-col gap-4 w-full md:w-56 shrink-0 md:sticky md:top-0">
              <div className="w-full h-64 bg-gray-100 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm relative flex items-center justify-center">
                {siswa.foto ? (
                  <img 
                    src={siswa.foto} 
                    alt={`Foto ${siswa.nama}`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                    <span className="text-xs font-semibold">Tidak ada foto</span>
                  </div>
                )}
              </div>

              {/* Lencana Status Akun */}
              <div className={`py-2.5 px-3 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-2 border ${detailLengkap.is_active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                <ShieldCheck className="w-4 h-4" /> 
                {detailLengkap.is_active ? "Akun Aktif" : "Akun Nonaktif"}
              </div>
            </div>

            {/* Bagian Kanan: Informasi Lengkap (Scrollable Grid) */}
            <div className="flex-1 w-full space-y-8">
              
              {/* Header Nama & Akademik Cepat */}
              <div>
                <h4 className="text-2xl md:text-3xl font-extrabold text-black leading-tight mb-2">
                  {siswa.nama}
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-black text-white px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">
                    <GraduationCap className="w-3.5 h-3.5" /> {siswa.kelas} {siswa.jurusan}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-md text-xs font-semibold">
                    <Hash className="w-3.5 h-3.5" /> NIS: {siswa.nis}
                  </span>
                </div>
              </div>

              {/* KOTAK 1: Akun & Login */}
              <div>
                <h5 className="text-sm font-bold text-gray-900 border-b pb-2 mb-3 flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-gray-500" /> Data Akun Login
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">Username</p>
                    <p className="font-bold text-black">@{detailLengkap.username}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-0.5 flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email</p>
                    <p className="font-bold text-black break-all">{detailLengkap.email}</p>
                  </div>
                </div>
              </div>

              {/* KOTAK 2: Data Sekolah & Pribadi */}
              <div>
                <h5 className="text-sm font-bold text-gray-900 border-b pb-2 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" /> Biodata Lengkap
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">NISN (Nasional)</p>
                    <p className="font-bold text-black">{detailLengkap.nisn}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">NPSN Sekolah</p>
                    <p className="font-bold text-black">{detailLengkap.npsn}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">Jenis Kelamin</p>
                    <p className="font-bold text-black">{siswa.jk === "L" ? "Laki-laki" : "Perempuan"}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">Tempat, Tanggal Lahir</p>
                    <p className="font-bold text-black">{detailLengkap.tempat_tgl_lahir}</p>
                  </div>
                </div>
              </div>

              {/* KOTAK 3: Data Orang Tua */}
              <div>
                <h5 className="text-sm font-bold text-gray-900 border-b pb-2 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" /> Data Orang Tua & Wali
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">Nama Ayah</p>
                    <p className="font-bold text-black">{siswa.namaAyah}</p>
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1"><Briefcase className="w-3 h-3" /> {detailLengkap.pekerjaan_ayah}</p>
                  </div>
                  <div className="bg-pink-50/50 p-3 rounded-xl border border-pink-100">
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">Nama Ibu</p>
                    <p className="font-bold text-black">{detailLengkap.nama_ibu}</p>
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1"><Briefcase className="w-3 h-3" /> {detailLengkap.pekerjaan_ibu}</p>
                  </div>
                  <div className="sm:col-span-2 bg-green-50/50 p-3 rounded-xl border border-green-100">
                    <p className="text-xs font-semibold text-gray-500 mb-0.5 flex items-center gap-1.5"><Phone className="w-3 h-3" /> Nomor HP / WhatsApp Wali</p>
                    <p className="font-bold text-black">{siswa.noHpWali}</p>
                  </div>
                </div>
              </div>

              {/* KOTAK 4: Alamat Domisili */}
              <div>
                <h5 className="text-sm font-bold text-gray-900 border-b pb-2 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" /> Alamat Domisili
                </h5>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
                  <p className="font-bold text-black mb-1">{detailLengkap.alamat}</p>
                  <p className="text-gray-600">
                    Kel/Desa: <span className="font-semibold text-gray-800">{detailLengkap.desa_kelurahan}</span>, 
                    Kec: <span className="font-semibold text-gray-800">{detailLengkap.kecamatan}</span>
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-800">{detailLengkap.kabupaten_kota}</span>, 
                    Provinsi <span className="font-semibold text-gray-800">{detailLengkap.provinsi}</span>
                  </p>
                </div>
              </div>

              {/* KOTAK 5: REKAM JEJAK AKADEMIK (BARU) */}
              <div>
                <h5 className="text-sm font-bold text-gray-900 border-b pb-2 mb-3 flex items-center gap-2">
                  <History className="w-4 h-4 text-gray-500" /> Rekam Jejak Akademik (Riwayat Kelas)
                </h5>
                <div className="space-y-3">
                  {detailLengkap.riwayat_kelas.length > 0 ? (
                    detailLengkap.riwayat_kelas.map((riwayat, index) => (
                      <div key={index} className="bg-white border border-gray-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-black transition-colors">
                        <div>
                          <p className="font-extrabold text-black text-base">
                            Kelas {riwayat.kelas.nama_kelas} 
                            <span className="text-gray-500 font-medium text-sm ml-1">
                              ({riwayat.kelas.jurusan?.jurusan || "-"})
                            </span>
                          </p>
                          <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                            <User className="w-3 h-3" /> Wali: {riwayat.kelas.wali_kelas?.nama_guru || "Belum diatur"}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-bold text-gray-800">T.A {riwayat.tahun_ajaran?.tahun || "-"}</p>
                          <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            riwayat.status_kenaikan === 'Sedang_Belajar' ? 'bg-blue-100 text-blue-700' : 
                            riwayat.status_kenaikan === 'Naik_Kelas' || riwayat.status_kenaikan === 'Tamat' ? 'bg-green-100 text-green-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {riwayat.status_kenaikan.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-center text-sm text-gray-500 font-medium">
                      Siswa ini belum memiliki rekam jejak akademik (Belum didaftarkan ke kelas manapun).
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}