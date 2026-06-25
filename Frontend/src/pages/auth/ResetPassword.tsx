import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2"; // 🔥 IMPORT SWEETALERT DI SINI
import logo from "../../asset/bg_logo.png"; // Sesuaikan path
import gambarKiri from "../../asset/halaman login user-CKKiV6Yz.jpeg"; // Sesuaikan path

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

export default function ResetPassword() {
  const { token } = useParams(); // Mengambil token dari URL
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Untuk mengunci tombol jika berhasil

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi Frontend agar password cocok
    if (newPassword !== confirmPassword) {
      Toast.fire({
        icon: "error",
        title: "Konfirmasi kata sandi tidak cocok!"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`http://187.127.121.139:3000/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true); // Kunci tombol
        // 🔥 TOAST SUKSES
        Toast.fire({
          icon: "success",
          title: "Kata sandi berhasil diubah! Mengalihkan ke login..."
        });
        
        setTimeout(() => {
          navigate("/"); // Alihkan ke login setelah 3 detik
        }, 3000);
      } else {
        // 🔥 TOAST GAGAL
        Toast.fire({
          icon: "error",
          title: data.message || "Gagal mengubah kata sandi. Token mungkin kadaluarsa."
        });
      }
    } catch (error) {
      console.error("Kesalahan jaringan:", error);
      // 🔥 TOAST ERROR JARINGAN
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

      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-fade-in">
        
        {/* Kolom Kiri */}
        <div className="hidden md:block md:w-1/2 relative bg-gray-900 group">
          <img src={gambarKiri} alt="Sekolah" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
            <h2 className="text-2xl font-bold mb-2">Buat Kata Sandi Baru</h2>
            <p className="text-sm text-white/80">SMK Swasta Parulian 1 Medan</p>
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white relative">
          
          <div className="flex items-center gap-3 mb-8">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-lg sm:text-xl font-bold text-primary leading-tight">Keamanan Akun</h1>
          </div>

          <p className="text-gray-500 text-sm mb-8 font-medium">
            Silakan masukkan kata sandi baru Anda. Pastikan kata sandi kuat dan mudah Anda ingat.
          </p>

          <form onSubmit={handleResetPassword} className="space-y-5">
            
            {/* Input Password Baru */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary block">Kata Sandi Baru</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Masukkan kata sandi baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors cursor-pointer">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Input Konfirmasi Password */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary block">Konfirmasi Kata Sandi Baru</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  placeholder="Ketik ulang kata sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors cursor-pointer">
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className={`w-full text-white font-bold py-3.5 rounded-xl transition-colors duration-300 shadow-lg mt-6 cursor-pointer 
                ${isLoading || isSuccess ? "bg-gray-400 shadow-none cursor-not-allowed" : "bg-primary hover:bg-secondary shadow-primary/20"}`}
            >
              {isLoading ? "Menyimpan Data..." : isSuccess ? "Berhasil Diubah" : "Simpan Kata Sandi Baru"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}