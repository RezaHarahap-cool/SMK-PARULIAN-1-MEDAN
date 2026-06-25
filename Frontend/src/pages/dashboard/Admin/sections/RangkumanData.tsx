import React, { useState, useEffect } from "react";
import { ArrowUpRight, Menu, Loader2 } from "lucide-react";
// 1. IMPORT USENAVIGATE DARI REACT ROUTER DOM
import { useNavigate } from "react-router-dom"; 
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from "recharts";

interface ChartItem {
  tahun: string;
  jumlah: number;
}

export default function RangkumanData({ onMenuClick }: { onMenuClick: () => void }) {
  // 2. INISIALISASI NAVIGATE
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    siswa: 0,
    guru: 0,
    kelas: 0,
    mapel: 0
  });
  
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://187.127.121.139:3000/api/dashboard", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        const result = await response.json();

        if (result.success) {
          setStats(result.data.stats);
          setChartData(result.data.chart);
        } else {
          setErrorMsg("Gagal memuat data dasbor.");
        }
      } catch (error) {
        console.error("Gagal menarik data dasbor:", error);
        setErrorMsg("Kesalahan koneksi ke server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 3. SESUAIKAN URL DENGAN PATH DI MENU ITEMS-MU
  const statCards = [
    { title: "Total Siswa", count: stats.siswa, url: "/admin/data-siswa" },
    { title: "Total Guru", count: stats.guru, url: "/admin/data-guru" },
    { title: "Total Kelas", count: stats.kelas, url: "/admin/data-kelas" },
    { title: "Mata Pelajaran", count: stats.mapel, url: "/admin/mata-pelajaran" },
  ];

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-white p-6 md:p-10 custom-scrollbar">
      
      {/* Header Content Mobile Toggle */}
      <div className="flex items-center gap-4 mb-8 lg:mb-10">
        <button className="lg:hidden p-2 bg-gray-100 rounded-lg" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">Dashboard</h2>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-black" />
          <p className="font-semibold">Merekap data akademik...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 font-medium mb-6">
          ⚠️ {errorMsg}
        </div>
      ) : (
        <>
          {/* Grid Kartu Statistik */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {statCards.map((card, idx) => (
              <div key={idx} className="bg-[#f8f9fa] border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">{card.title}</h3>
                <p className="text-4xl font-extrabold text-black mb-6">{card.count}</p>
                
                {/* 4. EKSEKUSI PERPINDAHAN HALAMAN DENGAN NAVIGATE */}
                <button 
                  onClick={() => navigate(card.url)} 
                  className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-black transition-colors group cursor-pointer"
                >
                  Lihat Detail 
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </button>
              </div>
            ))}
          </div>

          {/* Area Grafik */}
          <div className="bg-[#f8f9fa] border border-gray-200 rounded-2xl p-6 w-full shadow-sm">
            <h3 className="text-xl font-bold text-black mb-8">Grafik Pertumbuhan Siswa</h3>
            
            {/* Container Chart Responsive */}
            <div className="w-full h-[300px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="tahun" 
                    axisLine={true} 
                    tickLine={false} 
                    tick={{ fill: '#374151', fontSize: 12, fontWeight: 600 }}
                    dy={15}
                  />
                  <YAxis 
                    axisLine={true} 
                    tickLine={false} 
                    tick={{ fill: '#374151', fontSize: 12, fontWeight: 600 }}
                    allowDecimals={false}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${value} Siswa`, 'Total']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="jumlah" 
                    name="Siswa"
                    stroke="#000000" 
                    strokeWidth={3}
                    dot={{ fill: '#ffffff', stroke: '#000000', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 7, fill: '#000000' }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Label Bawah Axis */}
            <div className="text-center mt-4 text-sm font-semibold text-gray-500 uppercase tracking-widest">
              Tahun Ajaran Aktif
            </div>
          </div>
        </>
      )}
    </main>
  );
};