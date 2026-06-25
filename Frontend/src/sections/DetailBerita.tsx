import React, { useEffect, useMemo, useState } from "react";
import { Search, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { apiUrl } from "../lib/api";
import { mapBerita, type ApiBerita, type BeritaItem } from "../lib/berita";
import PublicBeritaDetailModal from "./PublicBeritaDetailModal";

const categories = ["Semua Berita", "Akademik", "Pengumuman", "Kegiatan/Prestasi"];

export default function DetailBerita() {
  const [activeCategory, setActiveCategory] = useState("Semua Berita");
  const [searchQuery, setSearchQuery] = useState("");
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
          setErrorMsg(result.message || "Data berita belum tersedia.");
          return;
        }

        const mappedData: BeritaItem[] = result.data.map((item: ApiBerita) => mapBerita(item));

        setDataBerita(mappedData);
      } catch (error) {
        console.error("Gagal mengambil berita publik:", error);
        setErrorMsg("Terjadi kesalahan koneksi server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBerita();
  }, []);

  const filteredBerita = useMemo(() => {
    return dataBerita.filter((berita) => {
      const matchCategory = activeCategory === "Semua Berita" || berita.kategori === activeCategory;
      const keyword = searchQuery.toLowerCase();
      const matchSearch =
        berita.judul.toLowerCase().includes(keyword) ||
        berita.ringkasan.toLowerCase().includes(keyword);

      return matchCategory && matchSearch;
    });
  }, [activeCategory, dataBerita, searchQuery]);

  return (
    <section className="py-24 bg-[#f8f9fa] min-h-screen">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-12">
          <h2 className="text-3xl font-extrabold text-primary mb-2">Kumpulan Berita</h2>
          <p className="text-muted-foreground">Informasi, pengumuman, dan artikel terbaru.</p>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div className="flex flex-wrap gap-3">
            {categories.map((kategori) => (
              <button
                key={kategori}
                onClick={() => setActiveCategory(kategori)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border shadow-sm ${
                  activeCategory === kategori
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary/50 hover:text-primary"
                }`}
              >
                {kategori}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80 flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="cari berita..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all shadow-sm"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-bold">
            {errorMsg}
          </div>
        )}

        <div className="space-y-6">
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-gray-100 min-h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredBerita.length > 0 ? (
            filteredBerita.map((berita, idx) => (
              <article
                key={berita.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row overflow-hidden group animate-fade-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-center order-2 md:order-1">
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-secondary">
                      <Calendar className="w-4 h-4" />
                      {berita.tanggal}
                    </span>
                    <span className="px-2.5 py-1 bg-gray-100 rounded-md text-gray-500">
                      {berita.kategori}
                    </span>
                  </div>

                  <h3
                    onClick={() => setSelectedBerita(berita)}
                    className="text-xl md:text-2xl font-bold text-primary mb-4 leading-snug group-hover:text-secondary transition-colors cursor-pointer"
                  >
                    {berita.judul}
                  </h3>

                  <p className="text-gray-500 leading-relaxed mb-6 line-clamp-3">
                    {berita.ringkasan}
                  </p>

                  <div className="mt-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedBerita(berita)}
                      className="text-primary font-bold text-sm flex items-center gap-2 hover:text-secondary transition-colors group/btn"
                    >
                      Baca Selengkapnya
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>

                <div className="w-full md:w-2/5 lg:w-1/3 aspect-video md:aspect-auto relative overflow-hidden order-1 md:order-2 border-l border-gray-50 bg-gray-100">
                  <img
                    src={berita.image}
                    alt={berita.judul}
                    onClick={() => setSelectedBerita(berita)}
                    onError={(e) => {
                      e.currentTarget.src = "/general_profil.png";
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors"></div>
                </div>
              </article>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-lg mb-4">Pencarian untuk <strong>"{searchQuery}"</strong> tidak ditemukan.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("Semua Berita");
                }}
                className="px-6 py-2 bg-secondary text-white rounded-full font-semibold hover:bg-secondary/90 transition-colors"
              >
                Reset Pencarian
              </button>
            </div>
          )}
        </div>
      </div>
      <PublicBeritaDetailModal
        berita={selectedBerita}
        onClose={() => setSelectedBerita(null)}
      />
    </section>
  );
}
