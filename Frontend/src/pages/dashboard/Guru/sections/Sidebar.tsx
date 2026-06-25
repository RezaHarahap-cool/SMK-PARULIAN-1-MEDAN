import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logoSekolah from "../../../../asset/bg_logo.png";
import { 
  Megaphone, FileText, BookOpenCheck,
  ClipboardList, CalendarDays, Settings, User, LogOut, 
  MoreVertical,  X 
} from "lucide-react";
import Swal from "sweetalert2"; // 🔥 IMPORT SWEETALERT DI SINI

// ==========================================
// 1. Tipe Data Profil Guru (Sesuai response backend)
// ==========================================
interface ProfileData {
  username: string;
  email: string;
  role: string;
  guru?: {
    nama_guru: string;
    gender: string;
    foto: string | null;
    no_hp: string;
    kelas_wali?: {
      id_kelas: string;
      nama_kelas: string;
      ruang_kelas: string;
    }[];
  };
}

// 2. Menu Items (Master Menu)
const menuItems = [
  { title: "Profile", icon: User, path: "/guru" },
  { title: "Presensi", icon: BookOpenCheck, path: "/guru/presensi" },
  { title: "Nilai", icon: ClipboardList, path: "/guru/Nilai" },
  { title: "Data Nilai", icon: FileText, path: "/guru/DataNilai" },
  { title: "Jadwal Mengajar", icon: CalendarDays, path: "/guru/JadwalMengejar" },
  { title: "Rapor Wali", icon: FileText, path: "/guru/rapor-wali" },
  { title: "Laporan", icon: Megaphone, path: "/guru/laporan" }, // Menu sensitif
];

export default function Sidebar({ isMobileOpen, setIsMobileOpen }: { isMobileOpen: boolean, setIsMobileOpen: (v: boolean) => void }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // State untuk menyimpan data profil dari API
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================
  // 3. Ambil Data Profil Saat Sidebar Dimuat
  // ==========================================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return; // Kalau tidak ada token, batalkan

        const res = await fetch("http://187.127.121.139:3000/api/my-profile/guru", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const result = await res.json();
        
        if (result.success) {
          setProfile(result.data);
        }
      } catch (error) {
        console.error("Gagal memuat profil:", error);
      }
    };

    fetchProfile();
  }, []);

  // Fungsi untuk menangani klik menu
  const handleMenuClick = (path: string) => {
    navigate(path); 
    setIsMobileOpen(false); 
  };

  // 🔥 Fungsi Logout Super Aman dengan Konfirmasi SweetAlert2
  const handleLogout = async () => {
    const confirm = await Swal.fire({
      title: "Keluar Sistem?",
      text: "Sesi Anda akan diakhiri. Anda harus login kembali untuk masuk.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      localStorage.removeItem("token"); 
      localStorage.removeItem("role"); 
      navigate('/login'); 
    }
  };

  // 🔥 Menampilkan Info Setting dengan SweetAlert2
  const showSettingPopup = () => {
    setShowProfileMenu(false); // Tutup menu pop-up kecil dulu
    Swal.fire({
      title: "Pengaturan Akun Guru",
      html: `
        <div style="text-align: left; font-size: 14px;">
          <p style="margin-bottom: 10px;">Edit profil, foto, nomor HP, dan agama dapat dilakukan langsung pada halaman <b>Profile</b>.</p>
          <div style="padding: 10px; background-color: #fff3cd; color: #856404; border-radius: 8px; border: 1px solid #ffeeba;">
            <b style="font-size: 12px; display: block; margin-bottom: 4px;">⚠️ CATATAN PENTING</b>
            Perubahan data resmi seperti Nama Lengkap, Mata Pelajaran, dan penetapan Wali Kelas hanya dapat dilakukan oleh Admin Sekolah.
          </div>
        </div>
      `,
      icon: "info",
      confirmButtonColor: "#000000",
      confirmButtonText: "Mengerti"
    });
  };

  // Data dinamis untuk ditampilkan (Tampilkan 'Memuat...' jika data belum datang)
  const namaTampil = profile?.guru?.nama_guru || profile?.username || "Memuat...";
  const emailTampil = profile?.email || "Menunggu data...";
  
  // Asumsi url fotomu diakses melalui folder uploads di backend
  const fotoTampil = profile?.guru?.foto 
    ? `http://187.127.121.139:3000/uploads/${profile.guru.foto}` 
    : null;

  // 🔥 LOGIKA DETEKSI WALI KELAS
  const isWaliKelas = profile?.guru?.kelas_wali && profile.guru.kelas_wali.length > 0;

  // 🔥 FILTER MENU BERDASARKAN STATUS
  const visibleMenuItems = menuItems.filter(item => {
    if (item.title === "Laporan" || item.title === "Rapor Wali") {
      return isWaliKelas; // Hanya tampil jika wali kelas
    }
    return true; // Menu lain selalu tampil
  });

  return (
    <>
      {/* Overlay hitam untuk mobile jika sidebar terbuka */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#f8f9fa] border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Header Logo */}
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
          {/* Tombol close sidebar di mobile */}
          <button className="ml-auto lg:hidden" onClick={() => setIsMobileOpen(false)}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Menu Navigasi (Memakai visibleMenuItems yang sudah difilter) */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {visibleMenuItems.map((item, idx) => {
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

        {/* Footer Sidebar: Profil Admin & Popup Menu */}
        <div className="p-4 border-t border-gray-200 relative">
          
          {/* Popup Menu Profil */}
          {showProfileMenu && (
            <>
              {/* Invisible overlay to close popup when clicked outside */}
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
              
              <div className="absolute bottom-[80px] left-4 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 animate-fade-in z-50">
                <button onClick={showSettingPopup} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                  <Settings className="w-4 h-4" /> Setting
                </button>
                <button onClick={() => { handleMenuClick('/guru'); setShowProfileMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                  <User className="w-4 h-4" /> Profil
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  onClick={() => { handleLogout(); setShowProfileMenu(false); }} 
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </div>
            </>
          )}

          {/* Info Admin (Dinamis dari Backend) */}
          <div 
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-200 cursor-pointer transition-colors relative z-50"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {/* Cek apakah ada foto atau tidak */}
            {fotoTampil ? (
              <img 
                src={fotoTampil} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover border border-gray-300"
              />
            ) : (
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white shrink-0">
                <User className="w-5 h-5" />
              </div>
            )}
            
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-black truncate">{namaTampil}</p>
              <p className="text-xs text-gray-500 truncate">{emailTampil}</p>
            </div>
            <MoreVertical className="w-5 h-5 text-gray-400 shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
}
