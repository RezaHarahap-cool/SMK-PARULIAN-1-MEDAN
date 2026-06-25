import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight, Loader2 } from "lucide-react";
import { apiUrl } from "../lib/api";
import { mapBerita, type ApiBerita, type BeritaItem } from "../lib/berita";
import PublicBeritaDetailModal from "./PublicBeritaDetailModal";

export const BeritaSection: React.FC = () => {
  const [dataBerita, setDataBerita] = useState<BeritaItem[]>([]);
  const [selectedBerita, setSelectedBerita] = useState<BeritaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchBerita = async () => {
      setIsLoading(true);
      setErrorMsg("");

      try {
        const response = await fetch(apiUrl("/api/berita"));
        const result = await response.json();

        if (!result.success) {
          setErrorMsg(result.message || "Berita belum tersedia.");
          return;
        }

        setDataBerita(
          result.data.map((item: ApiBerita) => mapBerita(item)).slice(0, 3)
        );
      } catch (error) {
        console.error("Gagal mengambil berita beranda:", error);
        setErrorMsg("Berita belum dapat dimuat.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBerita();
  }, []);

  // Fungsi penentu warna label kategori berita
  const getKategoriColor = (kategori: string) => {
    switch (kategori) {
      case "Pengumuman": return "bg-red-50 text-red-600 border-red-100";
      case "Kegiatan/Prestasi": return "bg-blue-50 text-blue-600 border-blue-100";
      case "Akademik": return "bg-amber-50 text-amber-600 border-amber-100";
      default: return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <section id="berita" className="py-24 bg-gray-50/30">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="max-w-2xl animate-fade-in">
            <span className="text-secondary font-bold tracking-widest uppercase text-sm mb-2 block">
              Informasi Terkini
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-primary mb-4">
              Berita & Pengumuman
            </h2>
            <p className="text-muted-foreground text-lg">
              Ikuti terus perkembangan, kegiatan seru, dan informasi penting seputar SMK Swasta Parulian 1 Medan.
            </p>
          </div>
          
          <Link
            to="/berita"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold hover:bg-secondary transition-colors duration-300 shadow-md"
          >
            Lihat Semua Berita <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid Berita */}
        {isLoading ? (
          <div className="min-h-72 flex items-center justify-center rounded-3xl bg-white border border-gray-100">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : errorMsg ? (
          <div className="min-h-48 flex items-center justify-center rounded-3xl bg-white border border-gray-100 text-gray-500 font-semibold">
            {errorMsg}
          </div>
        ) : dataBerita.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dataBerita.map((berita, idx) => (
            <article 
              key={berita.id}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col animate-fade-in"
              style={{ animationDelay: `${(idx + 1) * 150}ms` }}
            >
              {/* Image & Kategori */}
              <div className="relative h-52 overflow-hidden group">
                <img 
                  src={berita.image} 
                  alt={berita.judul} 
                  onClick={() => setSelectedBerita(berita)}
                  onError={(e) => {
                    e.currentTarget.src = "/general_profil.png";
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm ${getKategoriColor(berita.kategori)}`}>
                  {berita.kategori}
                </span>
              </div>

              {/* Konten Berita */}
              <div className="p-6 md:p-8 flex-1 flex flex-col">
                {/* Meta Data: Tanggal & Penulis */}
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{berita.tanggal}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>{berita.penulis}</span>
                  </div>
                </div>

                {/* Judul Berita */}
                <h3
                  onClick={() => setSelectedBerita(berita)}
                  className="text-xl font-bold text-primary mb-3 hover:text-secondary transition-colors line-clamp-2 cursor-pointer"
                >
                  {berita.judul}
                </h3>

                {/* Ringkasan Berita */}
                <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1 line-clamp-3">
                  {berita.ringkasan}
                </p>

                {/* Tombol Baca Selengkapnya */}
                <div className="pt-4 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={() => setSelectedBerita(berita)}
                    className="text-primary font-bold text-sm flex items-center gap-1.5 hover:text-secondary transition-colors group/btn"
                  >
                    Baca Selengkapnya 
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            </article>
            ))}
          </div>
        ) : (
          <div className="min-h-48 flex items-center justify-center rounded-3xl bg-white border border-gray-100 text-gray-500 font-semibold">
            Belum ada berita dipublikasikan.
          </div>
        )}

      </div>
      <PublicBeritaDetailModal
        berita={selectedBerita}
        onClose={() => setSelectedBerita(null)}
      />
    </section>
  );
};
