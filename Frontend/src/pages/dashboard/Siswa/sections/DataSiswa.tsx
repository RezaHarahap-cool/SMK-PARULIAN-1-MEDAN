import React, { useState, useEffect, useRef } from "react";
import { 
  Menu, User, Phone, CalendarDays, 
  MapPin, Users, CreditCard, School, 
  Camera, Edit3, CheckCircle, Loader2, X
} from "lucide-react";
import Swal from "sweetalert2";

// 1. Tipe Data Profil Siswa (Sesuai Response API Backend)
interface ProfilSiswaResponse {
  username: string;
  email: string;
  siswa: {
    id_siswa: string;
    nis: string;
    nisn: string;
    nama_siswa: string;
    gender: string;
    tempat_tgl_lahir: string;
    foto: string | null;
    status_siswa: string;
    no_hp_wali: string;
    alamat: string;
    desa_kelurahan: string;
    kecamatan: string;
    kabupaten_kota: string;
    provinsi: string;
    nama_ayah: string;
    pekerjaan_ayah: string;
    nama_ibu: string;
    pekerjaan_ibu: string;
    npsn?: string; 
    riwayat_kelas?: {
      kelas: { nama_kelas: string };
    }[];
  };
}

export default function ProfilSiswaContent({ onMenuClick }: { onMenuClick: () => void }) {
  const [profileData, setProfileData] = useState<ProfilSiswaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    no_hp_wali: "",
    alamat: "",
    desa_kelurahan: "",
    kecamatan: "",
    kabupaten_kota: "",
    provinsi: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://187.127.121.139:3000/api/my-profile/siswa", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const result = await res.json();
      
      if (result.success) {
        setProfileData(result.data);
        setEditForm({
          no_hp_wali: result.data.siswa?.no_hp_wali || "",
          alamat: result.data.siswa?.alamat || "",
          desa_kelurahan: result.data.siswa?.desa_kelurahan || "",
          kecamatan: result.data.siswa?.kecamatan || "",
          kabupaten_kota: result.data.siswa?.kabupaten_kota || "",
          provinsi: result.data.siswa?.provinsi || "",
        });
      }
    } catch (error) {
      console.error("Gagal menarik profil siswa:", error);
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

    const res = await fetch("http://187.127.121.139:3000/api/my-profile/siswa", {
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
  if (!profileData || !profileData.siswa) {
    return (
      <main className="flex-1 h-screen flex flex-col items-center justify-center bg-[#f4f7fb]">
        <p className="text-red-500 font-bold text-xl mb-2">Gagal Memuat Profil!</p>
        <p className="text-gray-500">Pastikan Anda sudah login sebagai Siswa.</p>
      </main>
    );
  }

  // 3. Ekstrak data
  const { siswa } = profileData;
  const fotoTampil = siswa.foto ? `http://187.127.121.139:3000/uploads/${siswa.foto}` : null;
  const namaKelas = siswa.riwayat_kelas && siswa.riwayat_kelas.length > 0 
                      ? siswa.riwayat_kelas[0].kelas.nama_kelas 
                      : "Belum ada kelas";

  const npsnTampil = siswa.npsn || "10254321"; 

  const updateProfil = async () => {
    const token = localStorage.getItem("token");
    const form = new FormData();
    Object.entries(editForm).forEach(([key, value]) => form.append(key, value));

    const res = await fetch("http://187.127.121.139:3000/api/my-profile/siswa", {
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
    <main className="flex-1 h-screen overflow-y-auto bg-[#f4f7fb] p-6 md:p-10 custom-scrollbar">
      
      {/* Header Content */}
      <div className="flex items-center gap-4 mb-8">
        <button className="lg:hidden p-2 bg-white rounded-lg shadow-sm cursor-pointer" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">Profil Siswa</h2>
        </div>
      </div>

      {/* Kontainer Utama - Split Layout */}
      <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 max-w-7xl pb-20 animate-fade-in">
        
        {/* KOLOM KIRI: KARTU PROFIL UTAMA */}
        <div className="w-full xl:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden xl:sticky xl:top-10">
            <div className="h-36 bg-gradient-to-r from-teal-500 to-emerald-600"></div>
            
            <div className="px-6 pb-8 flex flex-col items-center text-center -mt-16">
              <div className="relative group">
                <div className="w-32 h-32 bg-white rounded-full p-1.5 shadow-md">
                  {fotoTampil ? (
                    <img src={fotoTampil} alt={siswa.nama_siswa} className="w-full h-full rounded-full object-cover bg-gray-100" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center border-2 border-gray-200 border-dashed">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
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

              <h3 className="mt-4 text-xl font-extrabold text-gray-900 leading-tight">{siswa.nama_siswa}</h3>
              
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> {siswa.status_siswa}
                </span>
                <span className="text-sm font-semibold text-gray-500 flex items-center gap-1">
                  <School className="w-4 h-4" /> {namaKelas}
                </span>
              </div>

              <div className="mt-6 w-full bg-gray-50 border border-gray-200 rounded-xl p-4 flex divide-x divide-gray-200">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">NISN</p>
                  <p className="text-sm font-extrabold text-gray-900">{siswa.nisn || "-"}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">NIS</p>
                  <p className="text-sm font-extrabold text-gray-900">{siswa.nis || "-"}</p>
                </div>
              </div>

              <button onClick={() => setIsEditOpen(true)} className="w-full mt-6 flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-sm cursor-pointer">
                <Edit3 className="w-4 h-4" /> Edit Profil
              </button>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: DETAIL INFORMASI LENGKAP */}
        <div className="w-full xl:w-2/3 space-y-6">
          
          {/* SECTION 1: Akademik & Pribadi */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h3 className="text-lg font-extrabold text-black mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" /> Data Akademik & Pribadi
            </h3>
            {/* Grid disesuaikan menjadi 3 item agar proporsional tanpa Tahun Lulus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tempat, Tanggal Lahir</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-400" /> {siswa.tempat_tgl_lahir || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Jenis Kelamin</p>
                <p className="text-sm font-semibold text-gray-900">{siswa.gender || "-"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">NPSN Sekolah</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" /> {npsnTampil}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: Data Orang Tua / Wali */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h3 className="text-lg font-extrabold text-black mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" /> Data Orang Tua & Wali
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Ayah</p>
                <p className="text-sm font-semibold text-gray-900">{siswa.nama_ayah || "-"}</p>
                <p className="text-xs text-gray-500 mt-1">Pekerjaan: {siswa.pekerjaan_ayah || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Ibu</p>
                <p className="text-sm font-semibold text-gray-900">{siswa.nama_ibu || "-"}</p>
                <p className="text-xs text-gray-500 mt-1">Pekerjaan: {siswa.pekerjaan_ibu || "-"}</p>
              </div>
              <div className="sm:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100 mt-2">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Nomor HP / WhatsApp Wali</p>
                <p className="text-sm font-extrabold text-blue-900 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {siswa.no_hp_wali || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: Alamat Lengkap */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h3 className="text-lg font-extrabold text-black mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600" /> Alamat Tempat Tinggal
            </h3>
            
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Alamat Jalan</p>
              <p className="text-sm font-semibold text-gray-900 leading-relaxed">{siswa.alamat || "-"}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Desa / Kelurahan</p>
                <p className="text-sm font-semibold text-gray-900">{siswa.desa_kelurahan || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Kecamatan</p>
                <p className="text-sm font-semibold text-gray-900">{siswa.kecamatan || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Kabupaten / Kota</p>
                <p className="text-sm font-semibold text-gray-900">{siswa.kabupaten_kota || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Provinsi</p>
                <p className="text-sm font-semibold text-gray-900">{siswa.provinsi || "-"}</p>
              </div>
            </div>
          </div>

        </div>

      </div>
      {isEditOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-black">Edit Profil Siswa</h3>
              <button onClick={() => setIsEditOpen(false)} className="p-1 text-gray-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ["no_hp_wali", "Nomor HP/WhatsApp Wali"],
                ["desa_kelurahan", "Desa / Kelurahan"],
                ["kecamatan", "Kecamatan"],
                ["kabupaten_kota", "Kabupaten / Kota"],
                ["provinsi", "Provinsi"],
              ].map(([name, label]) => (
                <label key={name} className="block">
                  <span className="text-sm font-bold text-gray-700">{label}</span>
                  <input
                    value={editForm[name as keyof typeof editForm]}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, [name]: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                  />
                </label>
              ))}
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-gray-700">Alamat Jalan</span>
                <textarea
                  value={editForm.alamat}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, alamat: e.target.value }))}
                  className="mt-1 min-h-24 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsEditOpen(false)} className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200">Batal</button>
              <button onClick={updateProfil} className="rounded-lg bg-black px-5 py-2 text-sm font-bold text-white hover:bg-gray-800">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
