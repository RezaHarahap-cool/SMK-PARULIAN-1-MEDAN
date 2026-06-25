import React, { useState, useEffect, useRef } from "react";
import { 
  Menu, User, CalendarDays, 
  BookOpen, Award, Mail, Key,
  Camera, Edit3, CheckCircle, Loader2, X, Phone
} from "lucide-react";
import Swal from "sweetalert2";

// 1. Tipe Data Profil Kepsek (Sesuai Response API Backend & Skema Prisma)
interface ProfilKepsekResponse {
  nama_ks: string;
  tgl_lahir: string;
  gender: string;
  agama: string;
  pendidikan_tertinggi: string;
  no_hp: string | null;
  mulai_menjabat: string | null;
  selesai_menjabat: string | null;
  status_jabatan: "AKTIF" | "NON_AKTIF";
  foto: string | null;
  user: {
    username: string;
    email: string;
    role: string;
  };
}

export default function ProfilKepsekContent({ onMenuClick }: { onMenuClick: () => void }) {
  const [profileData, setProfileData] = useState<ProfilKepsekResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ no_hp: "", agama: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://187.127.121.139:3000/api/my-profile/kepsek", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const result = await res.json();
      
      if (result.success) {
        setProfileData(result.data);
        setEditForm({
          no_hp: result.data.no_hp || "",
          agama: result.data.agama || "",
        });
      }
    } catch (error) {
      console.error("Gagal menarik profil Kepala Sekolah:", error);
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

    const res = await fetch("http://187.127.121.139:3000/api/my-profile/kepsek", {
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

  const updateProfil = async () => {
    const token = localStorage.getItem("token");
    const form = new FormData();
    form.append("no_hp", editForm.no_hp);
    form.append("agama", editForm.agama);

    const res = await fetch("http://187.127.121.139:3000/api/my-profile/kepsek", {
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

  // Tampilan Loading
  if (isLoading) {
    return (
      <main className="flex-1 h-screen flex flex-col items-center justify-center bg-[#f4f7fb]">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600 mb-4" />
        <p className="text-gray-500 font-semibold">Memuat profil Anda...</p>
      </main>
    );
  }

  // Jika Data Gagal Dimuat
  if (!profileData) {
    return (
      <main className="flex-1 h-screen flex flex-col items-center justify-center bg-[#f4f7fb]">
        <p className="text-red-500 font-bold text-xl mb-2">Gagal Memuat Profil!</p>
        <p className="text-gray-500">Pastikan Anda sudah login sebagai Kepala Sekolah.</p>
      </main>
    );
  }

  // 3. Ekstrak data
  const kepsek = profileData;
  const fotoTampil = kepsek.foto ? `http://187.127.121.139:3000/uploads/${kepsek.foto}` : null;
  
  // Format Tanggal Lahir agar lebih enak dibaca (jika datanya ada)
  const tanggalLahirFormat = kepsek.tgl_lahir 
    ? new Date(kepsek.tgl_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : "-";
  const mulaiMenjabatFormat = kepsek.mulai_menjabat
    ? new Date(kepsek.mulai_menjabat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : "-";
  const selesaiMenjabatFormat = kepsek.selesai_menjabat
    ? new Date(kepsek.selesai_menjabat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : "Sekarang";

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-[#f4f7fb] p-6 md:p-10 custom-scrollbar">
      
      {/* Header Content */}
      <div className="flex items-center gap-4 mb-8">
        <button className="lg:hidden p-2 bg-white rounded-lg shadow-sm cursor-pointer" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">Profil Kepala Sekolah</h2>
        </div>
      </div>

      {/* Kontainer Utama - Split Layout */}
      <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 max-w-7xl pb-20 animate-fade-in">
        
        {/* KOLOM KIRI: KARTU PROFIL UTAMA */}
        <div className="w-full xl:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden xl:sticky xl:top-10">
            <div className="h-36 bg-gradient-to-r from-gray-800 to-black"></div>
            
            <div className="px-6 pb-8 flex flex-col items-center text-center -mt-16">
              <div className="relative group">
                <div className="w-32 h-32 bg-white rounded-full p-1.5 shadow-md">
                  {fotoTampil ? (
                    <img src={fotoTampil} alt={kepsek.nama_ks} className="w-full h-full rounded-full object-cover bg-gray-100" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center border-2 border-gray-200 border-dashed">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 bg-teal-600 text-white p-2 rounded-full shadow-lg hover:bg-teal-700 transition-colors cursor-pointer border-2 border-white">
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

              <h3 className="mt-4 text-xl font-extrabold text-gray-900 leading-tight">{kepsek.nama_ks}</h3>
              
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Aktif Mengabdi
                </span>
                <span className="text-sm font-semibold text-gray-500 flex items-center gap-1">
                  <Award className="w-4 h-4" /> Pimpinan
                </span>
              </div>

              <div className="mt-6 w-full bg-gray-50 border border-gray-200 rounded-xl p-4 flex divide-x divide-gray-200">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Username</p>
                  <p className="text-sm font-extrabold text-gray-900 truncate px-2">{kepsek.user?.username || "-"}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Hak Akses</p>
                  <p className="text-sm font-extrabold text-gray-900 uppercase">{kepsek.user?.role || "-"}</p>
                </div>
              </div>
              <div className="mt-3 w-full bg-teal-50 border border-teal-100 rounded-xl p-4">
                <p className="text-xs text-teal-700 font-bold uppercase tracking-wider mb-1">Masa Jabatan</p>
                <p className="text-sm font-extrabold text-teal-900">{mulaiMenjabatFormat} - {selesaiMenjabatFormat}</p>
                <p className="text-xs font-bold text-teal-700 mt-1">
                  {kepsek.status_jabatan === "NON_AKTIF" ? "Non-Aktif Menjabat" : "Aktif Menjabat"}
                </p>
              </div>
              <button onClick={() => setIsEditOpen(true)} className="w-full mt-6 flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-sm cursor-pointer">
                <Edit3 className="w-4 h-4" /> Edit Profil
              </button>
              
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: DETAIL INFORMASI LENGKAP */}
        <div className="w-full xl:w-2/3 space-y-6">
          
          {/* SECTION 1: Data Pribadi */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h3 className="text-lg font-extrabold text-black mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" /> Informasi Pribadi
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal Lahir</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-400" /> {tanggalLahirFormat}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Jenis Kelamin</p>
                <p className="text-sm font-semibold text-gray-900">{kepsek.gender || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Agama</p>
                <p className="text-sm font-semibold text-gray-900">{kepsek.agama || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nomor HP</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" /> {kepsek.no_hp || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pendidikan Tertinggi</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gray-400" /> {kepsek.pendidikan_tertinggi || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: Data Kontak & Keamanan */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h3 className="text-lg font-extrabold text-black mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
              <Key className="w-5 h-5 text-teal-600" /> Autentikasi & Kontak
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div className="sm:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Alamat Email Terdaftar</p>
                <p className="text-sm font-extrabold text-blue-900 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {kepsek.user?.email || "-"}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              *Jika Anda ingin mengubah kata sandi atau email pendaftaran, silakan hubungi administrator sistem.
            </p>
          </div>

        </div>

      </div>
      {isEditOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditOpen(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-black">Edit Profil Kepala Sekolah</h3>
              <button onClick={() => setIsEditOpen(false)} className="p-1 text-gray-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-gray-700">Nomor HP</span>
                <input value={editForm.no_hp} onChange={(e) => setEditForm((prev) => ({ ...prev, no_hp: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black" />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-700">Agama</span>
                <input value={editForm.agama} onChange={(e) => setEditForm((prev) => ({ ...prev, agama: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black" />
              </label>
              <p className="text-xs font-medium text-gray-500">Nama, jabatan, email, username, dan password tetap dikelola oleh admin.</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsEditOpen(false)} className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700">Batal</button>
              <button onClick={updateProfil} className="rounded-lg bg-black px-5 py-2 text-sm font-bold text-white hover:bg-gray-800">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
