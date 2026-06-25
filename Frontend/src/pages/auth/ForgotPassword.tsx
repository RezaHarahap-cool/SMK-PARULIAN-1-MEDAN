import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2"; // 🔥 IMPORT SWEETALERT DI SINI
import logo from "../../asset/bg_logo.png"; // Sesuaikan path
import gambarKiri from "../../asset/halaman login user-CKKiV6Yz.jpeg"; // Sesuaikan path

// 🔥 KONFIGURASI TOAST (Alert Pojok Kanan Bawah)
const Toast = Swal.mixin({
  toast: true,
  position: "bottom-end",
  showConfirmButton: false,
  timer: 4000, // Diatur 4 detik agar user sempat membaca
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Untuk mendisable tombol setelah berhasil

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://187.127.121.139:3000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        // 🔥 TOAST SUKSES
        Toast.fire({
          icon: "success",
          title: "Berhasil! Link reset password telah dikirim ke email Anda."
        });
        setEmail(""); // Kosongkan input setelah berhasil
        setIsSuccess(true); // Kunci tombol agar tidak di-spam
      } else {
        // 🔥 TOAST ERROR DARI BACKEND
        Toast.fire({
          icon: "error",
          title: data.message || "Gagal mengirim link reset password."
        });
      }
    } catch (error) {
      console.error("Kesalahan jaringan:", error);
      // 🔥 TOAST ERROR JARINGAN
      Toast.fire({
        icon: "error",
        title: "Koneksi ke server terputus. Pastikan server menyala."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Dekorasi Background (Sama dengan Login) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px]"></div>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-fade-in">
        
        {/* Kolom Kiri: Gambar */}
        <div className="hidden md:block md:w-1/2 relative bg-gray-900 group">
          <img src={gambarKiri} alt="Sekolah" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
            <h2 className="text-2xl font-bold mb-2">Pemulihan Akun</h2>
            <p className="text-sm text-white/80">Keamanan Data SMK Swasta Parulian 1 Medan</p>
          </div>
        </div>

        {/* Kolom Kanan: Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white relative">
          
          <div className="flex items-center gap-3 mb-8">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-lg sm:text-xl font-bold text-primary leading-tight">Lupa Kata Sandi?</h1>
          </div>

          <p className="text-gray-500 text-sm mb-8 font-medium">
            Masukkan alamat email yang terdaftar. Kami akan mengirimkan tautan aman untuk mereset kata sandi Anda.
          </p>

          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary block">Alamat Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isSuccess} // Disable jika loading atau sudah sukses
              className={`w-full text-white font-bold py-3.5 rounded-xl transition-colors duration-300 shadow-lg mt-4 cursor-pointer 
                ${isLoading || isSuccess ? "bg-gray-400 shadow-none cursor-not-allowed" : "bg-primary hover:bg-secondary shadow-primary/20"}`}
            >
              {isLoading ? "Mengirim Tautan..." : isSuccess ? "Tautan Terkirim" : "Kirim Link Reset"}
            </button>
          </form>

          {/* Footer Kembali */}
          <div className="flex items-center mt-8 pt-6 border-t border-gray-100 text-sm font-bold">
            <Link to="/" className="flex items-center gap-1.5 text-gray-500 hover:text-primary transition-colors group">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Kembali ke Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}