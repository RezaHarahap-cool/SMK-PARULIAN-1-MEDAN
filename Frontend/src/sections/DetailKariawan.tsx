import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";

const API_BASE_URL = "http://localhost:3000";
const DEFAULT_IMAGE = `${API_BASE_URL}/uploads/general_profil.png`;

interface ApiGuru {
  id_users: string;
  nama_guru: string;
  pendidikan_tertinggi?: string | null;
  foto?: string | null;
  mapel?: string | null;
}

interface StafMember {
  id: string;
  namaLengkap: string;
  jabatan: string;
  mataPelajaran: string;
  image: string;
}

const resolveImage = (foto?: string | null) => {
  if (!foto) return DEFAULT_IMAGE;
  if (foto.startsWith("http")) return foto;
  return `${API_BASE_URL}/uploads/${foto}`;
};

export default function DetailKariawan() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dataStaf, setDataStaf] = useState<StafMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchGuru = async () => {
      setIsLoading(true);
      setErrorMsg("");

      try {
        const response = await fetch(`${API_BASE_URL}/api/guru/public`);
        const result = await response.json();

        if (!result.success) {
          setErrorMsg(result.message || "Data tenaga pendidik belum tersedia.");
          return;
        }

        const mappedData: StafMember[] = result.data.map((item: ApiGuru) => ({
          id: item.id_users,
          namaLengkap: item.nama_guru,
          jabatan: item.pendidikan_tertinggi || "Tenaga Pendidik",
          mataPelajaran: item.mapel || "Guru Mata Pelajaran",
          image: resolveImage(item.foto),
        }));

        setDataStaf(mappedData);
      } catch (error) {
        console.error("Gagal mengambil data guru publik:", error);
        setErrorMsg("Terjadi kesalahan koneksi server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuru();
  }, []);

  const filteredStaf = useMemo(() => {
    return dataStaf.filter((staf) => {
      const keyword = searchQuery.toLowerCase();
      return (
        staf.namaLengkap.toLowerCase().includes(keyword) ||
        staf.mataPelajaran.toLowerCase().includes(keyword) ||
        staf.jabatan.toLowerCase().includes(keyword)
      );
    });
  }, [dataStaf, searchQuery]);

  return (
    <section id="guru-staf" className="py-24 bg-[#f8f9fa] relative">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">
            Tenaga Pendidik & Kependidikan
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Mengenal lebih dekat para pendidik dan staf profesional yang berdedikasi membimbing generasi masa depan.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div className="flex flex-wrap gap-3">
            <span className="px-6 py-2.5 rounded-full text-sm font-semibold border shadow-sm bg-primary text-white border-primary">
              Semua Guru
            </span>
          </div>

          <div className="relative w-full lg:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="cari guru atau mata pelajaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all shadow-sm"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-bold">
            {errorMsg}
          </div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-3xl border border-gray-100 min-h-72 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredStaf.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {filteredStaf.map((staf, idx) => (
              <div
                key={staf.id}
                className="group animate-fade-in cursor-pointer"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden mb-5 bg-gray-200">
                  <img
                    src={staf.image}
                    alt={`Foto ${staf.namaLengkap}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-primary leading-tight group-hover:text-secondary transition-colors">
                    {staf.namaLengkap}
                  </h3>
                  <p className="text-secondary font-medium text-sm">
                    {staf.jabatan}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {staf.mataPelajaran}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <p className="text-gray-500 text-lg">Maaf, tidak ada guru atau mata pelajaran yang cocok dengan pencarian <strong>"{searchQuery}"</strong>.</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-secondary font-semibold hover:underline"
            >
              Reset Pencarian
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
