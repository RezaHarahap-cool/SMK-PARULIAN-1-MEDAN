import React from "react";
import { MapPin, Phone, Mail, Clock, ArrowUp } from "lucide-react";

export const FooterSection: React.FC = () => {
  // Fungsi untuk scroll mulus kembali ke paling atas halaman
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#211c1c] text-white/80 pt-20 pb-8 relative overflow-hidden border-t border-white/5">
      
      {/* Tombol Back to Top di Pojok Kanan Atas Footer */}
      <div className="absolute top-8 right-6 md:right-12">
        <button 
          onClick={scrollToTop}
          className="p-3 rounded-full bg-white/10 hover:bg-[#ff791f] text-white transition-all duration-300 group shadow-lg"
          title="Kembali ke atas"
        >
          <ArrowUp className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
        </button>
      </div>

      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Kolom 1: Profil Singkat Sekolah */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {/* Tempatkan Logo Sekolah di sini */}
              <div className="w-10 h-10 rounded-xl bg-[#ff791f] flex items-center justify-center font-black text-white text-lg shadow-md">
                P
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                SMK Parulian 1
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed pt-2">
              Mewujudkan generasi siap kerja, berkarakter mulia, inovatif, dan unggul di bidang teknologi serta bisnis di jantung Kota Medan.
            </p>
          </div>

          {/* Kolom 2: Tautan Pintar (Quick Links) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white relative before:absolute before:bottom-0 before:left-0 before:w-8 before:h-0.5 before:bg-[#ff791f] pb-2">
              Jelajahi
            </h3>
            <ul className="space-y-2.5 text-sm font-medium">
              <li><a href="#about" className="hover:text-[#ff791f] transition-colors">Sambutan</a></li>
              <li><a href="#jurusan" className="hover:text-[#ff791f] transition-colors">Program Keahlian</a></li>
              <li><a href="#prestasi" className="hover:text-[#ff791f] transition-colors">Prestasi Siswa</a></li>
              <li><a href="#ekskul" className="hover:text-[#ff791f] transition-colors">Ekstrakurikuler</a></li>
              <li><a href="#berita" className="hover:text-[#ff791f] transition-colors">Berita Terkini</a></li>
            </ul>
          </div>

          {/* Kolom 3: Hubungi Kami (Kontak & Alamat) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white relative before:absolute before:bottom-0 before:left-0 before:w-8 before:h-0.5 before:bg-[#ff791f] pb-2">
              Hubungi Kami
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#ff791f] flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">Jl. Stadion No. 4, Teladan Barat, Kec. Medan Kota, Kota Medan, Sumatera Utara</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#ff791f] flex-shrink-0" />
                <span>(061) 1234567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#ff791f] flex-shrink-0" />
                <span className="hover:text-[#ff791f] transition-colors cursor-pointer">info@smkparulian1medan.sch.id</span>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Jam Operasional & Media Sosial */}
          <div className="space-y-5">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white relative before:absolute before:bottom-0 before:left-0 before:w-8 before:h-0.5 before:bg-[#ff791f] pb-2">
                Jam Pelayanan
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-[#ff791f]" />
                <span>Senin - Jumat | 07.30 - 14.30 WIB</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase text-white/40 tracking-wider">
                Media Sosial
              </h4>

            </div>
          </div>

        </div>

        {/* Bagian Paling Bawah: Hak Cipta */}
        <div className="pt-8 border-t border-white/5 text-center text-xs font-medium text-white/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 SMK Swasta Parulian 1 Medan. Hak Cipta Dilindungi.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
