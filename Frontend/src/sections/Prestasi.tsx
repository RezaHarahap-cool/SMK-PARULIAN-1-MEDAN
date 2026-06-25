import React from "react";
import { Trophy, Medal, MapPin, Calendar } from "lucide-react";

// Tipe data untuk Prestasi
interface PrestasiItem {
  id: string;
  judul: string;
  namaSiswa: string;
  tingkat: "Nasional" | "Provinsi" | "Kota";
  tahun: string;
  image: string;
}

// Data Contoh Prestasi (Sesuaikan dengan data asli sekolah)
const dataPrestasi: PrestasiItem[] = [
  {
    id: "p1",
    judul: "Juara 1 Lomba Web Design LKS SMK",
    namaSiswa: "Tim PPLG (Angkatan 2024)",
    tingkat: "Nasional",
    tahun: "2025",
    image: "https://images.unsplash.com/photo-1511649475669-e288648b2339?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "p2",
    judul: "Juara 2 Olimpiade Jaringan Mikrotik",
    namaSiswa: "Rizky & Tim TJKT",
    tingkat: "Provinsi", // Sumatera Utara
    tahun: "2025",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "p3",
    judul: "Juara 1 Cerdas Cermat Akuntansi",
    namaSiswa: "Siti Aminah (Kelas XII AKL)",
    tingkat: "Kota", // Medan
    tahun: "2024",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
  },
];

export const PrestasiSection: React.FC = () => {
  // Fungsi untuk menentukan warna badge berdasarkan tingkat juara
  const getBadgeColor = (tingkat: string) => {
    switch (tingkat) {
      case "Nasional":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"; // Emas
      case "Provinsi":
        return "bg-slate-100 text-slate-700 border-slate-200"; // Perak
      case "Kota":
        return "bg-orange-100 text-orange-700 border-orange-200"; // Perunggu (Menyesuaikan warna secondary)
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <section id="prestasi" className="py-24 bg-gray-50/50">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="max-w-2xl animate-fade-in">
            <span className="text-secondary font-bold tracking-widest uppercase text-sm mb-2 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Hall of Fame
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-primary mb-4">
              Prestasi Membanggakan
            </h2>
            <p className="text-muted-foreground text-lg">
              Bukti nyata dedikasi dan kerja keras siswa-siswi kami dalam mengukir prestasi di berbagai kompetisi bergengsi.
            </p>
          </div>
          
          <button className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-colors">
            Lihat Semua Prestasi
          </button>
        </div>

        {/* Grid Prestasi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dataPrestasi.map((prestasi, idx) => (
            <div 
              key={prestasi.id} 
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 animate-fade-in flex flex-col"
              style={{ animationDelay: `${(idx + 1) * 150}ms` }}
            >
              {/* Gambar dengan Label Tingkat */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={prestasi.image} 
                  alt={prestasi.judul} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm backdrop-blur-md ${getBadgeColor(prestasi.tingkat)}`}>
                    <Medal className="w-3.5 h-3.5" />
                    Tingkat {prestasi.tingkat}
                  </span>
                </div>
              </div>

              {/* Konten Teks */}
              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-primary mb-2 line-clamp-2">
                  {prestasi.judul}
                </h3>
                
                <p className="text-secondary font-semibold mb-6 flex-1">
                  {prestasi.namaSiswa}
                </p>

                {/* Footer Kartu (Lokasi/Tahun) */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-muted-foreground font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {prestasi.tingkat === "Kota" ? "Medan" : 
                       prestasi.tingkat === "Provinsi" ? "Sumatera Utara" : "Indonesia"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{prestasi.tahun}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tombol Mobile */}
        <div className="mt-10 flex justify-center md:hidden">
          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-colors">
            Lihat Semua Prestasi
          </button>
        </div>

      </div>
    </section>
  );
};