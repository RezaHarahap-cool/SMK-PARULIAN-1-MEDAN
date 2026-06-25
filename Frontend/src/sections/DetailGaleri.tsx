import React, { useState, useEffect } from "react";
import { X, ZoomIn } from "lucide-react";

// 1. Tipe Data Galeri
interface GalleryItem {
  id: string;
  title: string;
  kategori: "Fasilitas" | "Kegiatan" | "Prestasi";
  image: string;
}

// 2. Data Dummy Galeri (Ganti dengan foto asli SMK Parulian 1)
const galleryData: GalleryItem[] = [
  {
    id: "g1",
    title: "Praktik Jaringan di Lab TJKT",
    kategori: "Fasilitas",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "g2",
    title: "Upacara Peringatan Hari Kemerdekaan",
    kategori: "Kegiatan",
    image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "g3",
    title: "Juara Umum Lomba Web Design LKS 2026",
    kategori: "Prestasi",
    image: "https://images.unsplash.com/photo-1511649475669-e288648b2339?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "g4",
    title: "Ruang Kelas Full AC & Proyektor",
    kategori: "Fasilitas",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "g5",
    title: "Pertandingan Final Futsal Antar Kelas",
    kategori: "Kegiatan",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "g6",
    title: "Piala Bergilir Cerdas Cermat Akuntansi",
    kategori: "Prestasi",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
  },
];

const categories = ["Semua", "Fasilitas", "Kegiatan", "Prestasi"];

export default function DetailGaleri() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  // Efek untuk mengunci scroll halaman (body) saat Lightbox terbuka
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    // Cleanup saat komponen dilepas
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedImage]);

  // Logika Filter
  const filteredGallery = galleryData.filter((item) =>
    activeCategory === "Semua" ? true : item.kategori === activeCategory
  );

  return (
    <section id="galeri" className="py-24 bg-white relative">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <span className="text-secondary font-bold tracking-widest text-sm uppercase block mb-2">
            Momen Kebersamaan
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-primary mb-4">
            Galeri Sekolah
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Jelajahi berbagai fasilitas, kegiatan seru, dan momen tak terlupakan di lingkungan SMK Swasta Parulian 1 Medan.
          </p>
        </div>

        {/* Tombol Filter Kategori */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((kategori) => (
            <button
              key={kategori}
              onClick={() => setActiveCategory(kategori)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
                activeCategory === kategori
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-transparent text-gray-500 border-gray-200 hover:border-secondary hover:text-secondary"
              }`}
            >
              {kategori}
            </button>
          ))}
        </div>

        {/* Grid Galeri */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredGallery.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)} // Tampilkan di Lightbox saat diklik
              className="group relative overflow-hidden rounded-2xl aspect-square bg-gray-100 cursor-pointer animate-fade-in shadow-sm hover:shadow-xl transition-all duration-300"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Gambar Utama */}
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay Gelap saat di-hover */}
              <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
                <ZoomIn className="w-10 h-10 text-white mb-3 transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300" />
                <h3 className="text-white font-bold text-lg leading-tight transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  {item.title}
                </h3>
                <span className="text-secondary font-medium text-sm mt-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                  {item.kategori}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================= */}
      {/* WINDOW LIGHTBOX (Muncul saat foto diklik) */}
      {/* ========================================= */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fade-in">
          
          {/* Background overlay (Klik luar gambar untuk menutup) */}
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          ></div>

          {/* Tombol Close (X) */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 md:top-10 md:right-10 z-50 p-2 bg-white/10 hover:bg-secondary rounded-full text-white transition-colors duration-300"
            title="Tutup (Esc)"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Kontainer Gambar Lightbox */}
          <div className="relative z-10 max-w-5xl w-full max-h-full flex flex-col items-center">
            <img
              src={selectedImage.image}
              alt={selectedImage.title}
              className="w-auto h-auto max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl scale-95 animate-[scale-up_0.3s_ease-out_forwards]"
            />
            
            {/* Keterangan Gambar di bawah */}
            <div className="mt-6 text-center bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
              <h3 className="text-white font-bold text-lg md:text-xl">
                {selectedImage.title}
              </h3>
              <p className="text-secondary text-sm font-medium">
                Kategori: {selectedImage.kategori}
              </p>
            </div>
          </div>
          
        </div>
      )}
    </section>
  );
}