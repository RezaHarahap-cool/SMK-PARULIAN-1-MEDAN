import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logoSekolah from "../../../../asset/bg_logo.png";
import {
  LayoutDashboard,
  Users,
  UserSquare,
  GraduationCap,
  BookOpen,
  CalendarDays,
  Building,
  BookMarked,
  Newspaper,
  Printer,
  Settings,
  User,
  LogOut,
  MoreVertical,
  TrendingUp,
  FileBadge,
  X,
  Landmark,
  CalendarSync,
  BookText,
} from "lucide-react";
import Swal from "sweetalert2"; // 🔥 IMPORT SWEETALERT DI SINI
import { apiUrl, uploadUrl } from "../../../../lib/api";

// ==========================================
// 1. KOMPONEN SIDEBAR
// ==========================================
const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { title: "Data Guru", icon: Users, path: "/admin/data-guru" },
  { title: "Data Siswa", icon: UserSquare, path: "/admin/data-siswa" },
  { title: "Data Kepala Sekolah", icon: User, path: "/admin/data-kepsek" },
  { title: "Jurusan", icon: GraduationCap, path: "/admin/jurusan" },
  { title: "Mata Pelajaran", icon: BookOpen, path: "/admin/mata-pelajaran" },
  { title: "Semester", icon: CalendarSync, path: "/admin/semester" },
  { title: "Roster", icon: CalendarDays, path: "/admin/roster" },
  { title: "Data Kelas", icon: Building, path: "/admin/data-kelas" },
  { title: "Mengajar", icon: BookText, path: "/admin/mengajar" },
  { title: "Data Penempatan", icon: Landmark, path: "/admin/data-penempatan" },
  { title: "Tahun Ajaran", icon: BookMarked, path: "/admin/tahun-ajaran" },
  { title: "Berita", icon: Newspaper, path: "/admin/berita" },
  { title: "Cetak Rapor", icon: Printer, path: "/admin/cetak-rapor" },
  { title: "Kenaikan Kelas", icon: TrendingUp, path: "/admin/kenaikan-kelas" },
  { title: "Alumni", icon: FileBadge, path: "/admin/alumni" },
];

export default function Sidebar({
  isMobileOpen,
  setIsMobileOpen,
}: {
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean) => void;
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedFoto, setSelectedFoto] = useState<File | null>(null);
  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
    password: "",
    nama_admin: "",
    jenis_kelamin: "Perempuan",
    no_hp: "",
  });

  // ==========================================
  // STATE BARU: Untuk menyimpan data profil dari database
  // ==========================================
  const [profileData, setProfileData] = useState({
    nama: "Memuat...",
    username: "",
    email: "memuat...",
    jenis_kelamin: "Perempuan",
    no_hp: "",
    foto: null as string | null,
  });

  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================
  // FUNGSI FETCH PROFIL (Jalan otomatis saat sidebar muncul)
  // ==========================================
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token"); // Ambil token dari brankas browser
      if (!token) return;

      const res = await fetch(apiUrl("/api/admin/profile"), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        const nextProfile = {
          nama: data.data.admin?.nama_admin || data.data.username,
          username: data.data.username || "",
          email: data.data.email || "",
          jenis_kelamin: data.data.admin?.jenis_kelamin || "Perempuan",
          no_hp: data.data.admin?.no_hp || "",
          foto: data.data.admin?.foto || null,
        };

        setProfileData(nextProfile);
        setProfileForm((prev) => ({
          ...prev,
          username: nextProfile.username,
          email: nextProfile.email,
          nama_admin: nextProfile.nama,
          jenis_kelamin: nextProfile.jenis_kelamin,
          no_hp: nextProfile.no_hp,
          password: "",
        }));
      }
    } catch (error) {
      console.error("Gagal mengambil data profil:", error);
      setProfileData({
        nama: "Admin", // Fallback kalau server mati
        username: "admin",
        email: "admin@sekolah.com",
        jenis_kelamin: "Perempuan",
        no_hp: "",
        foto: null,
      });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []); // Array kosong artinya fungsi ini cuma dipanggil 1x saat pertama load

  const handleMenuClick = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  // 🔥 Fungsi Logout Super Aman dengan Konfirmasi SweetAlert2
  const handleLogout = async () => {
    setShowProfileMenu(false); // Tutup menu pop-up dulu
    const confirm = await Swal.fire({
      title: "Keluar Sistem?",
      text: "Sesi Anda akan diakhiri. Anda harus login kembali untuk masuk.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
    });

    if (confirm.isConfirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
    }
  };

  const openEditProfile = () => {
    setShowProfileMenu(false);
    setSelectedFoto(null);
    setProfileForm({
      username: profileData.username,
      email: profileData.email,
      password: "",
      nama_admin: profileData.nama,
      jenis_kelamin: profileData.jenis_kelamin,
      no_hp: profileData.no_hp,
    });
    setIsEditProfileOpen(true);
  };

  const handleProfileFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setProfileForm({
      ...profileForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleUpdateProfile = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        await Swal.fire("Sesi Habis", "Silakan login kembali.", "warning");
        navigate("/login");
        return;
      }

      const payload = new FormData();
      payload.append("username", profileForm.username);
      payload.append("email", profileForm.email);
      payload.append("nama_admin", profileForm.nama_admin);
      payload.append("jenis_kelamin", profileForm.jenis_kelamin);
      payload.append("no_hp", profileForm.no_hp);

      if (profileForm.password.trim()) {
        payload.append("password", profileForm.password.trim());
      }

      if (selectedFoto) {
        payload.append("foto", selectedFoto);
      }

      const response = await fetch(apiUrl("/api/admin/profile"), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const result = await response.json();

      if (!result.success) {
        await Swal.fire("Gagal", result.message || "Profil admin gagal diperbarui.", "error");
        return;
      }

      await fetchProfile();
      setIsEditProfileOpen(false);
      setSelectedFoto(null);

      await Swal.fire({
        title: "Berhasil",
        text: result.message || "Profil admin berhasil diperbarui.",
        icon: "success",
        confirmButtonColor: "#000000",
      });
    } catch (error) {
      console.error("Gagal update profil admin:", error);
      await Swal.fire("Server Error", "Terjadi kesalahan saat memperbarui profil admin.", "error");
    }
  };

  // 🔥 Menampilkan Info Profil dengan SweetAlert2
  const showAccountPopup = () => {
    setShowProfileMenu(false); // Tutup menu pop-up (titik tiga) terlebih dahulu

    Swal.fire({
      title: "Profil Administrator",
      html: `
        <div style="text-align: left; font-size: 15px; margin-top: 10px; background: #f8f9fa; padding: 15px; border-radius: 10px; border: 1px solid #eee;">
          <p><b>Nama Lengkap :</b> <br/> <span style="font-weight: 500;">${profileData.nama}</span></p>
          <p style="margin-top: 10px;"><b>Username :</b> <br/> <span style="font-weight: 500;">${profileData.username}</span></p>
          <p style="margin-top: 10px;"><b>Alamat Email :</b> <br/> <span style="font-weight: 500;">${profileData.email}</span></p>
          <p style="margin-top: 10px;"><b>No. HP :</b> <br/> <span style="font-weight: 500;">${profileData.no_hp || "-"}</span></p>
          <p style="margin-top: 10px;"><b>Hak Akses :</b> <br/> <span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; display: inline-block; margin-top: 4px;">Admin</span></p>
        </div>
      `,
      icon: "info",
      confirmButtonColor: "#000000",
      confirmButtonText: "Tutup",
    });
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#f8f9fa] border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-20 flex items-center gap-3 px-6 border-b border-gray-200">
          <div className="w-10 h-10 bg-transparent flex items-center justify-center rounded-md overflow-hidden">
            <img
              src={logoSekolah}
              alt="Logo SMK Parulian 1"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="font-bold text-sm leading-tight text-black">
            SMK Swasta <br /> Parulian 1 Medan
          </h1>
          <button
            className="ml-auto lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={idx}
                onClick={() => handleMenuClick(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? "bg-black text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-200 hover:text-black"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.title}
              </button>
            );
          })}
        </div>

        {/* Footer Sidebar: Profil Admin */}
        <div className="p-4 border-t border-gray-200 relative">
          {showProfileMenu && (
            <>
              {/* Invisible overlay to close popup when clicked outside */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              ></div>

              <div className="absolute bottom-[80px] left-4 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 animate-fade-in z-50">
                <button
                  onClick={openEditProfile}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <Settings className="w-4 h-4" /> Setting
                </button>

                {/* 🔥 BAGIAN INI YANG DIUBAH AGAR MEMANGGIL POP-UP, BUKAN PINDAH HALAMAN */}
                <button
                  onClick={showAccountPopup}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <User className="w-4 h-4" /> Profil
                </button>

                <div className="border-t border-gray-100 my-1"></div>

                {/* TOMBOL LOGOUT MENGGUNAKAN SWEETALERT */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </div>
            </>
          )}

          <div
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-200 cursor-pointer transition-colors relative z-50"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {/* LOGIKA MENAMPILKAN FOTO PROFIL ATAU ICON DEFAULT */}
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white overflow-hidden shrink-0">
              {profileData.foto ? (
                <img
                  src={uploadUrl(profileData.foto)}
                  alt="Profile"
                  onError={(e) => { e.currentTarget.src = "/general_profil.png"; }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>

            {/* TEKS NAMA DAN EMAIL DINAMIS */}
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-black truncate capitalize">
                {profileData.nama}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {profileData.email}
              </p>
            </div>
            <MoreVertical className="w-5 h-5 text-gray-400 shrink-0" />
          </div>
        </div>
      </aside>

      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-extrabold text-black">
                  Pengaturan Akun Admin
                </h2>
                <p className="text-xs text-gray-500">
                  Ubah profil, akun, password, dan foto admin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Username
                  </label>
                  <input
                    name="username"
                    value={profileForm.username}
                    onChange={handleProfileFormChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={profileForm.email}
                    onChange={handleProfileFormChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Nama Lengkap
                </label>
                <input
                  name="nama_admin"
                  value={profileForm.nama_admin}
                  onChange={handleProfileFormChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    name="jenis_kelamin"
                    value={profileForm.jenis_kelamin}
                    onChange={handleProfileFormChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                    required
                  >
                    <option value="Laki_laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    No. HP
                  </label>
                  <input
                    name="no_hp"
                    value={profileForm.no_hp}
                    onChange={handleProfileFormChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Password Baru
                </label>
                <input
                  name="password"
                  type="password"
                  value={profileForm.password}
                  onChange={handleProfileFormChange}
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Foto Profil
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={(event) =>
                    setSelectedFoto(event.target.files?.[0] || null)
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-black file:px-3 file:py-1 file:text-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {selectedFoto
                    ? selectedFoto.name
                    : "Kosongkan jika tidak ingin mengganti foto."}
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-black px-5 py-2 text-sm font-bold text-white hover:bg-gray-800"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
