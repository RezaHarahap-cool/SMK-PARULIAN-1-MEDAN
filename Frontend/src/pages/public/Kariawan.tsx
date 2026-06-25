import { FooterSection } from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import DetailKariawan from "../../sections/DetailKariawan";

export default function Kariawan() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <div className="relative bg-[#211c1c] text-white pt-15 pb-12 md:pt-28 md:pb-16 overflow-hidden mt-20">
          {/* Akses dekorasi cahaya latar khas desainmu */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-72 h-72 bg-[#ff791f]/10 blur-[120px] rounded-full"></div>

          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            {/* Navigasi Kecil (Breadcrumbs) */}
            <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-white/60 mb-4">
              <Link
                to="/"
                className="hover:text-[#ff791f] transition-colors flex items-center gap-1"
              >
                <Home className="w-3.5 h-3.5" /> Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-white/30" />
              <span className="text-[#ff791f] font-semibold">Kariawan</span>
            </div>

            {/* Kata-kata Sambutan / Judul Utama Halaman */}
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
                Guru dan staf di SMK <span className="text-[#ff791f]">Parulian 1</span>{" "}
                Medan
              </h1>
              <p className="text-white/60 text-sm md:text-base leading-relaxed font-medium">
                Mari kenalan dengan guru dan staf kariawan di smk parulian 1 medan
              </p>
            </div>
          </div>
        </div>
        <DetailKariawan />
      </main>
      <FooterSection />
    </div>
  );
}
