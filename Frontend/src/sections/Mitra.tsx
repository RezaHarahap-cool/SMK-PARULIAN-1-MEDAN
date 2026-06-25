import { ChevronDown } from "lucide-react"; // Pastikan ini tetap di-import jika pakai panah

// Ganti data skills menjadi data Mitra Industri
const mitraIndustri = [
  "Sentral gadai persada",
  "Amik medikom",
  "Kementerian keuangan RI Kantor Wil Direktorat Jendral Pajak Sumut I",
  "Kementerian pekerjaan umum, direktorat jendral sumber daya air",
  "Kepala badan riset dan inovasi daerah kota medan",
  "Kejaksaan tinggi sumatera utara",
  "Dokter Laptop",
  "Profesor Laptop",
  "Maruli Jaya Komputer",
  "Atr BPN Prov Sumut",
  "Balai besar penerapan modernisasi pertanian sumut",
];

export const MitraSection = () => {
  return (
    <div className="relative w-full">
      {/* Section Mitra Industri */}
      <div className="mt-10 animate-fade-in animation-delay-600">
        <p className="text-sm font-bold text-primary uppercase tracking-widest mb-4 text-center">
          Mitra Industri & Tempat PKL
        </p>
        
        <div className="relative overflow-hidden py-4">
          {/* Efek Gradien Kiri (agar teks seolah muncul perlahan) */}
          <div
            className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10"
          />
          
          {/* Efek Gradien Kanan (agar teks seolah menghilang perlahan) */}
          <div
            className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10"
          />
          
          {/* Wadah Teks Berjalan (Marquee) */}
          <div className="flex animate-marquee whitespace-nowrap">
            {[...mitraIndustri, ...mitraIndustri].map((mitra, idx) => (
              <div key={idx} className="flex-shrink-0 px-8 py-2 md:px-12">
                <span className="text-2xl md:text-3xl font-bold text-muted-foreground/30 hover:text-primary transition-colors duration-300 cursor-default">
                  {mitra}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tombol Scroll Down (Opsional, letaknya menyesuaikan layout utamamu) */}
      <div
        className="absolute -bottom-24 left-1/2 -translate-x-1/2 animate-fade-in animation-delay-800 mt-10"
      >
        <a
          href="#jurusan" /* Ubah href ini sesuai ID section di bawahnya, misal: id="jurusan" */
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
        >
          <span className="text-xs uppercase tracking-wider font-medium">Jelajahi Jurusan</span>
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </a>
      </div>
    </div>
  );
};