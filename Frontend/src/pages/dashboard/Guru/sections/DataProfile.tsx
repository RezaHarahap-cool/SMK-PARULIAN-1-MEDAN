import React, { useState, useEffect, useRef } from "react";
import { 
  Menu, User, Phone, GraduationCap, 
  CalendarDays, BookOpen, Edit3, Camera, HandHeart, Loader2, X
} from "lucide-react";
import Swal from "sweetalert2";

// 1. Tipe Data Profil Guru (Diselaraskan 100% dengan response Backend Prisma-mu)
interface GuruProfile {
  username: string;
  email: string;
  guru: {
    id_guru: string;
    nama_guru: string;
    tgl_lahir: string;
    gender: "Wanita" | "Pria" | string;
    agama: string;
    pendidikan_tertinggi: string;
    no_hp: string;
    foto: string | null;
    // Ingat, di schema aslimu namanya 'mata_pelajaran' bukan 'mapel'
    mata_pelajaran?: { 
      mapel: string;
    } | null;
    kelas_wali?: {
      id_kelas: string;
      nama_kelas: string;
      ruang_kelas: string;
    }[];
  };
}

export default function ProfilGuruContent({ onMenuClick }: { onMenuClick: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State untuk Data Asli dari Database
  const [profileData, setProfileData] = useState<GuruProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ no_hp: "", agama: "" });

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://187.127.121.139:3000/api/my-profile/guru", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const result = await res.json();
      
      if (result.success) {
        setProfileData(result.data);
        setEditForm({
          no_hp: result.data.guru?.no_hp || "",
          agama: result.data.guru?.agama || "",
        });
      }
    } catch (error) {
      console.error("Gagal menarik profil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Tarik Data dari Backend saat halaman dimuat
  useEffect(() => {
    fetchProfile();
  }, []);

  const uploadFoto = async (file: File) => {
    const token = localStorage.getItem("token");
    const form = new FormData();
    form.append("foto", file);

    const res = await fetch("http://187.127.121.139:3000/api/my-profile/guru", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const result = await res.json();
    await Swal.fire({
      title: result.success ? "Berhasil" : "Gagal",
      text: result.message || "Proses upload selesai.",
      icon: result.success ? "success" : "error",
      confirmButtonColor: result.success ? "#000000" : "#d33",
    });
    if (result.success) fetchProfile();
  };

  // Fungsi untuk format tanggal YYYY-MM-DD ke format lokal
  const formatTanggal = (tanggal?: string) => {
    if (!tanggal) return "-";
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(tanggal).toLocaleDateString('id-ID', options);
  };

  // Tampilan Loading
  if (isLoading) {
    return (
      <main className="flex-1 h-screen flex flex-col items-center justify-center bg-[#f4f7fb]">
        <Loader2 className="w-10 h-10 animate-spin text-black mb-4" />
        <p className="text-gray-500 font-semibold">Memuat profil Anda...</p>
      </main>
    );
  }

  // Jika Data Gagal Dimuat
  if (!profileData || !profileData.guru) {
    return (
      <main className="flex-1 h-screen flex flex-col items-center justify-center bg-[#f4f7fb]">
        <p className="text-red-500 font-bold text-xl mb-2">Gagal Memuat Profil!</p>
        <p className="text-gray-500">Pastikan Anda sudah login sebagai Guru.</p>
      </main>
    );
  }

  // Ekstrak data agar lebih mudah dipanggil di JSX
  const { guru, email } = profileData;
  const fotoTampil = guru.foto ? `http://187.127.121.139:3000/uploads/${guru.foto}` : null;
  
  // Panggil 'mata_pelajaran.mapel' sesuai schema Prisma yang kamu buat
  const mapelTampil = guru.mata_pelajaran?.mapel || "Belum ditentukan";
  const kelasWaliTampil = guru.kelas_wali && guru.kelas_wali.length > 0
    ? guru.kelas_wali.map((kelas) => kelas.nama_kelas).join(", ")
    : "Bukan wali kelas";

  const updateKontak = async () => {
    const token = localStorage.getItem("token");
    const form = new FormData();
    form.append("no_hp", editForm.no_hp);
    form.append("agama", editForm.agama);

    const res = await fetch("http://187.127.121.139:3000/api/my-profile/guru", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const result = await res.json();
    await Swal.fire({
      title: result.success ? "Berhasil" : "Gagal",
      text: result.message || "Proses update selesai.",
      icon: result.success ? "success" : "error",
      confirmButtonColor: result.success ? "#000000" : "#d33",
    });
    if (result.success) {
      setIsEditOpen(false);
      fetchProfile();
    }
  };

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-[#f4f7fb] p-6 md:p-10">
      
      {/* Header Content */}
      <div className="flex items-center gap-4 mb-8">
        <button className="lg:hidden p-2 bg-white rounded-lg shadow-sm cursor-pointer" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">Profil Guru</h2>
        </div>
      </div>

      {/* Kontainer Utama - Split Layout */}
      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl animate-fade-in">
        
        {/* ======================================================== */}
        {/* KOLOM KIRI: KARTU PROFIL UTAMA                           */}
        {/* ======================================================== */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
            
            {/* Banner Background */}
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
            
            <div className="px-6 pb-8 flex flex-col items-center text-center -mt-16">
              
              {/* Foto Profil */}
              <div className="relative group">
                <div className="w-32 h-32 bg-white rounded-full p-1.5 shadow-md">
                  {fotoTampil ? (
                    <img 
                      src={fotoTampil} 
                      alt={guru.nama_guru} 
                      className="w-full h-full rounded-full object-cover bg-gray-100"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200 border-dashed">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                {/* Tombol Kamera */}
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 bg-black text-white p-2 rounded-full shadow-lg hover:bg-gray-800 transition-colors cursor-pointer border-2 border-white">
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFoto(file);
                  }}
                />
              </div>

              {/* Info Utama */}
              <h3 className="mt-4 text-xl font-extrabold text-gray-900 leading-tight">
                {guru.nama_guru}
              </h3>
              <p className="text-sm font-semibold text-blue-600 mt-1 flex items-center justify-center gap-1.5">
                <BookOpen className="w-4 h-4" /> Guru Mapel
              </p>

              {/* Badge Mapel */}
              <div className="mt-5 w-full bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">Mengampu</p>
                <p className="text-sm font-semibold text-blue-800 text-center">{mapelTampil}</p>
              </div>

              <div className="mt-3 w-full bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Wali Kelas</p>
                <p className="text-sm font-semibold text-emerald-800 text-center">{kelasWaliTampil}</p>
              </div>

              <button 
                onClick={() => setIsEditOpen(true)} 
                className="w-full mt-6 flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
              >
                <Edit3 className="w-4 h-4" /> Edit Profil
              </button>

            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* KOLOM KANAN: DETAIL INFORMASI (GRID)                     */}
        {/* ======================================================== */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 h-full">
            
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-extrabold text-black">Informasi Pribadi</h3>
              <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full">Status: Aktif</span>
            </div>

            {/* Grid Informasi Pribadi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" /> Tanggal Lahir
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatTanggal(guru.tgl_lahir)}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Jenis Kelamin
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {guru.gender || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <HandHeart className="w-3.5 h-3.5" /> Agama
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {guru.agama || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Pendidikan Tertinggi
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {guru.pendidikan_tertinggi || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Nomor WhatsApp / HP
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {guru.no_hp || "-"}
                </p>
              </div>

            </div>

            {/* Catatan Keamanan Akun */}
            <div className="mt-10 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="text-sm font-bold text-gray-800 mb-1">Keamanan Akun</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                Email <b>({email})</b> dan kata sandi Anda diatur melalui sistem manajemen pengguna. Hubungi admin IT sekolah jika ingin melakukan perubahan kredensial login.
              </p>
            </div>

          </div>
        </div>

      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditOpen(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-black">Edit Profil Guru</h3>
              <button onClick={() => setIsEditOpen(false)} className="p-1 text-gray-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-gray-700">Nomor HP/WhatsApp</span>
                <input value={editForm.no_hp} onChange={(e) => setEditForm((prev) => ({ ...prev, no_hp: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black" />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-700">Agama</span>
                <input value={editForm.agama} onChange={(e) => setEditForm((prev) => ({ ...prev, agama: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black" />
              </label>
              <p className="text-xs font-medium text-gray-500">Nama, mapel, wali kelas, dan pendidikan resmi hanya dapat diubah oleh admin.</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsEditOpen(false)} className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700 shadow-sm transition-colors">Batal</button>
              <button onClick={updateKontak} className="rounded-lg bg-black px-5 py-2 text-sm font-bold text-white hover:bg-gray-800">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
