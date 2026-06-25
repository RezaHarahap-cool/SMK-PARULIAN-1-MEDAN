import React, { useState, useEffect } from "react";
import { PlayCircle } from "lucide-react";

// 1. Definisikan tipe data untuk props komponen Counter
interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  decimals?: number;
}

// --- KOMPONEN 1: Logika Animasi Angka ---
const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  suffix = "", 
  decimals = 0 
}) => {
  // Tambahkan <number> agar TS tahu state ini isinya angka
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null; // Tipe data bisa number atau null
    const duration = 2500; // Durasi animasi (2.5 detik)

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4); 

      setCount(value * easeOut);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return (
    <span>
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
};

// 2. Definisikan tipe data untuk array statisik
interface StatItem {
  value: number;
  suffix: string;
  decimals: number;
  title: string;
  description: string;
}

// --- KOMPONEN 2: Data Statistik ---
// --- KOMPONEN 2: Data Statistik (Versi SMK) ---
const statsData: StatItem[] = [
  {
    value: 850, // Ganti dengan total siswa asli
    suffix: "+",
    decimals: 0,
    title: "Siswa Aktif",
    description: "Dipercaya oleh ratusan siswa untuk mengasah kompetensi keahlian mereka setiap tahunnya.",
  },
  {
    value: 45, // Ganti dengan jumlah guru
    suffix: "+",
    decimals: 0,
    title: "Guru Profesional",
    description: "Dibimbing langsung oleh tenaga pendidik tersertifikasi dan praktisi yang ahli di bidangnya.",
  },
  {
    value: 100, // Ganti dengan jumlah mitra
    suffix: "+",
    decimals: 0,
    title: "Mitra Industri",
    description: "Bekerja sama dengan berbagai perusahaan terkemuka untuk program PKL dan rekrutmen lulusan.",
  },
  {
    value: 95, // Persentase lulusan
    suffix: "%",
    decimals: 0,
    title: "Terserap Kerja",
    description: "Mayoritas alumni kami langsung bekerja di industri atau melanjutkan ke perguruan tinggi negeri.",
  },
];

// --- KOMPONEN UTAMA ---
export const StatsSection: React.FC = () => {
  return (
    <section className="p-4 md:p-8 bg-white">
      <div className="max-w-7xl mx-auto p-8 md:p-12">
        
        {/* Bagian Atas */}
{/* Bagian Atas: Header & Tombol */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#2a303c] mb-3 leading-tight">
              Mencetak Lulusan <span className="text-[#ff791f]">Siap Kerja</span> & Berprestasi
            </h2>
            <p className="text-gray-500 font-medium text-lg">
              Berkomitmen penuh memberikan fasilitas, pengajaran, dan peluang karier terbaik bagi setiap siswa.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
            {/* Tombol dengan icon Play cocok untuk mengarah ke Video Profil Sekolah */}
            <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors w-full sm:w-auto">
              <PlayCircle className="w-5 h-5" /> Video Profil
            </button>
            {/* Tombol Call to Action utama */}
            <button className="px-8 py-3 rounded-full bg-[#211c1c] text-white font-semibold hover:bg-[#ff791f] transition-all duration-300 shadow-lg w-full sm:w-auto">
              Info PPDB
            </button>
          </div>
        </div>

        {/* Bagian Bawah: Grid Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          {statsData.map((stat, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="text-5xl md:text-[3.5rem] font-extrabold text-[#374151] mb-4 tracking-tight">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              </div>
              <h3 className="text-lg font-bold text-[#2a303c] mb-2">
                {stat.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed pr-4">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};