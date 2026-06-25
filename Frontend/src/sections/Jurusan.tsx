import React from "react";
import { MonitorPlay, Network, Calculator, Briefcase } from "lucide-react";

// Tipe data untuk Jurusan
interface JurusanItem {
  id: string;
  singkatan: string;
  namaLengkap: string;
  deskripsi: string;
  icon: React.ElementType;
  image: string;
}

// Data 4 Jurusan SMK Parulian 1
const dataJurusan: JurusanItem[] = [
  {
    id: "pplg",
    singkatan: "PPLG",
    namaLengkap: "Pengembangan Perangkat Lunak & Gim",
    deskripsi: "Mempelajari coding, pembuatan website, aplikasi mobile, hingga pengembangan game interaktif.",
    icon: MonitorPlay,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80", // Ganti dengan foto asli lab PPLG
  },
  {
    id: "tjkt",
    singkatan: "TJKT",
    namaLengkap: "Teknik Jaringan Komputer & Telekomunikasi",
    deskripsi: "Fokus pada instalasi jaringan, server, fiber optik, dan keamanan siber tingkat menengah.",
    icon: Network,
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80", // Ganti dengan foto asli lab TJKT
  },
  {
    id: "akl",
    singkatan: "AKL",
    namaLengkap: "Akuntansi & Keuangan Lembaga",
    deskripsi: "Mencetak tenaga ahli di bidang pembukuan, perpajakan, dan administrasi keuangan digital.",
    icon: Calculator,
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80", // Ganti dengan foto asli lab Akuntansi
  },
  {
    id: "otkp",
    singkatan: "OTKP",
    namaLengkap: "Otomatisasi Tata Kelola Perkantoran",
    deskripsi: "Membekali siswa dengan keahlian administrasi modern, kearsipan, dan public relations.",
    icon: Briefcase,
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80", // Ganti dengan foto perkantoran/resepsionis
  },
];

export const JurusanSection: React.FC = () => {
  return (
    <section id="jurusan" className="py-24 bg-background">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <span className="text-secondary font-bold tracking-widest uppercase text-sm mb-2 block">
            Program Keahlian
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-primary mb-4">
            Pilih Masa Depanmu
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Kami menawarkan 4 program keahlian unggulan yang dirancang khusus untuk memenuhi kebutuhan industri masa kini.
          </p>
        </div>

        {/* Grid Jurusan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dataJurusan.map((jurusan, idx) => (
            <div
              key={jurusan.id}
              className="group relative overflow-hidden rounded-3xl aspect-[4/5] cursor-pointer shadow-lg animate-fade-in"
              style={{ animationDelay: `${(idx + 1) * 150}ms` }}
            >
              {/* Background Image (Zoom effect on hover) */}
              <img
                src={jurusan.image}
                alt={jurusan.namaLengkap}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay Gelap agar teks terbaca */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/60 to-transparent transition-opacity duration-300" />

              {/* Konten Kartu (Berada di paling bawah) */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                
                {/* Icon */}
                <div className="w-12 h-12 rounded-full bg-secondary/20 backdrop-blur-md flex items-center justify-center mb-4 border border-secondary/30 transform transition-transform duration-300 group-hover:-translate-y-2">
                  <jurusan.icon className="w-6 h-6 text-secondary" />
                </div>

                {/* Judul & Singkatan */}
                <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
                  <h3 className="text-3xl font-black text-white mb-1">
                    {jurusan.singkatan}
                  </h3>
                  <p className="text-white/80 font-medium text-sm leading-snug">
                    {jurusan.namaLengkap}
                  </p>
                </div>

                {/* Deskripsi & Tombol (Sembunyi saat default, muncul saat di-hover) */}
                <div className="overflow-hidden max-h-0 opacity-0 transition-all duration-500 ease-in-out group-hover:max-h-40 group-hover:opacity-100 group-hover:mt-4">
                  <p className="text-white/70 text-sm mb-4 line-clamp-3">
                    {jurusan.deskripsi}
                  </p>
                  <button className="text-secondary text-sm font-bold flex items-center gap-2 hover:text-white transition-colors">
                    Lihat Detail <span>→</span>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};