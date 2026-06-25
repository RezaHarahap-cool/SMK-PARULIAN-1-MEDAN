import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2"; // 🔥 IMPORT SWEETALERT
import logo from "../../asset/bg_logo.png"; // Sesuaikan path logo
import gambarKiri from "../../asset/halaman login user-CKKiV6Yz.jpeg"; // Ganti dengan foto sekolah/siswa

// 🔥 KONFIGURASI TOAST (Alert Pojok Kanan Bawah)
const Toast = Swal.mixin({
  toast: true,
  position: "bottom-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

export default function Login() {
  // 1. STATE: Untuk menyimpan inputan, loading, dsb
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  // 2. LOGIKA UTAMA: Fungsi jembatan ke Backend
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Tembak API ke backend Express-mu
      const response = await fetch("http://187.127.121.139:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: loginId, 
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // SUKSES: Simpan token ke brankas browser
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.data.role);

        // 🔥 Toast Sukses Login
        Toast.fire({
          icon: "success",
          title: "Login berhasil! Mengalihkan..."
        });

        // Arahkan ke dashboard berdasarkan Role secara spesifik
        setTimeout(() => {
          if (data.data.role === "admin") {
            navigate("/admin");
          } else if (data.data.role === "guru") {
            navigate("/guru");
          } else if (data.data.role === "siswa") {
            navigate("/siswa");
          } else if (data.data.role === "kepala_sekolah") {
            navigate("/kepsek");
          } else {
            navigate("/"); 
          }
        }, 800); // Beri jeda sedikit agar animasi Toast terlihat
        
      } else {
        // GAGAL: Tampilkan pesan error dengan Toast Pojok Bawah
        Toast.fire({
          icon: "error",
          title: data.message || "Email atau password salah."
        });
      }
    } catch (error) {
      console.error("Gagal terhubung ke server:", error);
      // GAGAL JARINGAN
      Toast.fire({
        icon: "error",
        title: "Koneksi ke server terputus. Pastikan backend menyala."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Dekorasi Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px]"></div>
      </div>

      {/* Kontainer Utama Card Login */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-fade-in">
        
        {/* Kolom Kiri: Gambar */}
        <div className="hidden md:block md:w-1/2 relative bg-gray-900 group">
          <img
            src={gambarKiri}
            alt="Kegiatan Siswa"
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
          />
          <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
            <h2 className="text-2xl font-bold mb-2">Sistem Informasi Akademik</h2>
            <p className="text-sm text-white/80">SMK Swasta Parulian 1 Medan</p>
          </div>
        </div>

        {/* Kolom Kanan: Form Login */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white relative">
          
          {/* Header Form */}
          <div className="flex items-center gap-3 mb-10">
            <img src={logo} alt="Logo SMK Parulian 1" className="w-10 h-10 object-contain" />
            <h1 className="text-lg sm:text-xl font-bold text-primary leading-tight">
              SMK Swasta Parulian 1 <br className="hidden sm:block" /> Medan
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Input Email/Username */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary block">
                Email atau Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                 type="text"
                 required
                 placeholder="nama@gmail.com / nama_user"
                 value={loginId}
                 onChange={(e) => setLoginId(e.target.value)}
                 className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Masukkan Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Tombol Login */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-bold py-3.5 rounded-xl transition-colors duration-300 shadow-lg mt-4 cursor-pointer 
                ${isLoading ? "bg-gray-400 shadow-none cursor-not-allowed" : "bg-primary hover:bg-secondary shadow-primary/20"}`}
            >
              {isLoading ? "Memeriksa Data..." : "Login"}
            </button>
          </form>

          {/* Footer Form */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 text-sm font-bold">
            <button 
              onClick={() => navigate("/")} 
              className="flex items-center gap-1.5 text-gray-500 hover:text-primary transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Kembali
            </button>
            <Link 
              to="/lupa-password" 
              className="text-primary hover:text-secondary transition-colors"
            >
              Lupa Kata Sandi
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}