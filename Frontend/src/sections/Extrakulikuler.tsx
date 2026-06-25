import React from "react";
import { MoveRight } from "lucide-react"; // Kita pakai icon panah untuk button detail

// Tipe Data untuk Ekskul (Updated for Images)
interface EkskulItem {
  id: string;
  nama: string;
  kategori: "Wajib" | "Teknologi" | "Bahasa" | "Olahraga" | "Kesenian" | "Media";
  deskripsi: string;
  image: string; // Properti untuk URL Gambar
}

// Data Contoh Ekstrakurikuler dengan Gambar
const dataEkskul: EkskulItem[] = [
  {
    id: "pramuka",
    nama: "Pramuka",
    kategori: "Wajib",
    deskripsi: "Membentuk karakter disiplin, mandiri, dan jiwa kepemimpinan yang tangguh.",
    image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=80", // Ganti dengan foto kemping Pramuka
  },
  {
    id: "it-club",
    nama: "IT & Web Club",
    kategori: "Teknologi",
    deskripsi: "Eksplorasi coding, UI/UX, dan basis data untuk menjadi developer handal.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80", // Ganti dengan foto siswa ngoding di Lab
  },
  {
    id: "english-club",
    nama: "English Club",
    kategori: "Bahasa",
    deskripsi: "Mengasah kemahiran bahasa Inggris untuk komunikasi profesional global.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80", // Ganti dengan foto siswa diskusi/presentasi
  },
  {
    id: "futsal",
    nama: "Futsal & Basket",
    kategori: "Olahraga",
    deskripsi: "Menyalurkan bakat, melatih sportivitas, dan menjaga kebugaran fisik.",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80", // Ganti dengan foto tanding di lapangan
  },
  {
    id: "seni",
    nama: "Seni & Tari Daerah",
    kategori: "Kesenian",
    deskripsi: "Melestarikan budaya lokal melalui seni tari tradisional dan modern dance.",
    image: "https://images.unsplash.com/photo-1741272689174-f7f03b09a0ab?q=80&w=1473&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80", // Ganti dengan foto siswa menari dengan kostum
  },
  {
    id: "jurnalistik",
    nama: "Fotografi & Media",
    kategori: "Media",
    deskripsi: "Wadah kreatif untuk fotografi, videografi, dan penulisan artikel digital.",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80", // Ganti dengan foto siswa pakai kamera besar
  },
];

export const EkskulSection: React.FC = () => {
  // Fungsi untuk memberikan warna badge berdasarkan kategori
  const getBadgeColor = (kategori: string) => {
    switch (kategori) {
      case "Wajib": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Teknologi": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Bahasa": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Olahraga": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Kesenian": return "bg-pink-100 text-pink-800 border-pink-200";
      case "Media": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <section id="ekskul" className="py-24 bg-background">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <span className="text-secondary font-bold tracking-widest uppercase text-sm mb-2 block">
            Ekstrakurikuler
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-primary mb-4">
            Temukan Wadah Kreativitasmu
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Kembangkan bakat, minat, dan bangun relasi yang kuat melalui berbagai kegiatan seru di luar jam pelajaran.
          </p>
        </div>

        {/* Grid Ekskul */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {dataEkskul.map((ekskul, idx) => (
            <div 
              key={ekskul.id}
              className="group relative overflow-hidden rounded-3xl aspect-[4/3] shadow-lg border border-gray-100 animate-fade-in cursor-pointer"
              style={{ animationDelay: `${(idx + 1) * 100}ms` }}
            >
              {/* 1. Background Image */}
              <img 
                src={ekskul.image} 
                alt={ekskul.nama} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* 2. Dynamic Category Badge (Top Right) */}
              <div className="absolute top-5 right-5 z-20">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border shadow-sm backdrop-blur-md ${getBadgeColor(ekskul.kategori)}`}>
                  {ekskul.kategori}
                </span>
              </div>

              {/* 3. Dark Overlay (Teks terbaca) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/60 to-transparent transition-opacity duration-300" />

              {/* 4. Text Content (Bottom) */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                <h3 className="text-2xl font-black text-white mb-2 group-hover:text-secondary transition-colors">
                  {ekskul.nama}
                </h3>
                
                {/* Description reveal on hover */}
                <div className="overflow-hidden max-h-0 opacity-0 transition-all duration-500 ease-in-out group-hover:max-h-24 group-hover:opacity-100">
                  <p className="text-white/80 text-sm mb-4 line-clamp-2">
                    {ekskul.deskripsi}
                  </p>
                </div>
                
                {/* Button detail with icon */}
                <button className="text-secondary text-sm font-bold flex items-center gap-2 hover:text-white transition-colors group/btn">
                  Lihat Detail 
                  <MoveRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};