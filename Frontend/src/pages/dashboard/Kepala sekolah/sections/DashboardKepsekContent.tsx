import React, { useState, useEffect } from "react";
import { Menu, Loader2, Users, UserSquare, Building, BookOpen, X } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from "recharts";

interface ChartItem {
  tahun: string;
  jumlah: number;
}

type DetailKey = "siswa" | "guru" | "kelas" | "mapel";

interface DetailItem {
  id: string;
  nama: string;
  info: string;
  status: string;
}

export default function DashboardKepsekContent({ onMenuClick }: { onMenuClick: () => void }) {
  const [stats, setStats] = useState({
    siswa: 0,
    guru: 0,
    kelas: 0,
    mapel: 0
  });
  
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [details, setDetails] = useState<Record<DetailKey, DetailItem[]>>({
    siswa: [],
    guru: [],
    kelas: [],
    mapel: [],
  });
  const [selectedDetail, setSelectedDetail] = useState<DetailKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        // 🔥 Endpoint ini bisa menggunakan endpoint dashboard yang sama dengan Admin
        const response = await fetch("http://187.127.121.139:3000/api/dashboard-kepsek", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        const result = await response.json();

        if (result.success) {
          setStats(result.data.stats);
          setChartData(result.data.chart);
          setDetails(result.data.details || { siswa: [], guru: [], kelas: [], mapel: [] });
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

  // Card Statistik (Tanpa URL agar Kepsek tidak nyasar ke halaman Admin)
  const statCards = [
    { key: "siswa" as const, title: "Total Siswa", count: stats.siswa, icon: UserSquare, color: "text-blue-600", bg: "bg-blue-100" },
    { key: "guru" as const, title: "Total Guru", count: stats.guru, icon: Users, color: "text-green-600", bg: "bg-green-100" },
    { key: "kelas" as const, title: "Total Kelas", count: stats.kelas, icon: Building, color: "text-yellow-600", bg: "bg-yellow-100" },
    { key: "mapel" as const, title: "Mata Pelajaran", count: stats.mapel, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  const detailColumns: Record<DetailKey, { info: string; status: string }> = {
    siswa: { info: "NISN", status: "Kelas" },
    guru: { info: "Mata Pelajaran", status: "No. HP" },
    kelas: { info: "Jurusan", status: "Wali Kelas" },
    mapel: { info: "Kelompok", status: "Kode Kelompok" },
  };

  const selectedCard = selectedDetail ? statCards.find((card) => card.key === selectedDetail) : null;
  const selectedColumns = selectedDetail ? detailColumns[selectedDetail] : null;

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-white p-6 md:p-10 custom-scrollbar">
      
      {/* Header Content Mobile Toggle */}
      <div className="flex items-center gap-4 mb-8 lg:mb-10">
        <button className="lg:hidden p-2 bg-gray-100 rounded-lg" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-black" />
        </button>
        <div>
          <p className="text-gray-500 font-medium">Selamat Datang,</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-black">Dashboard Sekolah</h2>
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
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDetail(card.key)}
                className="text-left bg-[#f8f9fa] border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-gray-300 transition-all relative overflow-hidden cursor-pointer"
              >
                <div className={`absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center ${card.bg}`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">{card.title}</h3>
                <p className="text-4xl font-extrabold text-black mb-2">{card.count}</p>
                <p className="text-xs font-semibold text-gray-400">Lihat rincian data</p>
              </button>
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

          {selectedDetail && selectedCard && selectedColumns && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedDetail(null)}></div>
              <div className="relative bg-white w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-100 p-5">
                  <div>
                    <h3 className="text-lg font-extrabold text-black">{selectedCard.title}</h3>
                    <p className="text-sm font-semibold text-gray-500">{details[selectedDetail].length} data aktif ditampilkan</p>
                  </div>
                  <button onClick={() => setSelectedDetail(null)} className="p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="max-h-[65vh] overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-[#f8f9fa] text-gray-700 font-bold border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-3 w-16 text-center">No</th>
                        <th className="px-5 py-3">Nama</th>
                        <th className="px-5 py-3">{selectedColumns.info}</th>
                        <th className="px-5 py-3">{selectedColumns.status}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {details[selectedDetail].length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-5 py-10 text-center font-semibold text-gray-500">
                            Belum ada data.
                          </td>
                        </tr>
                      ) : (
                        details[selectedDetail].map((item, index) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-5 py-3 text-center font-bold text-gray-500">{index + 1}</td>
                            <td className="px-5 py-3 font-bold text-gray-900">{item.nama}</td>
                            <td className="px-5 py-3 font-medium text-gray-600">{item.info}</td>
                            <td className="px-5 py-3 font-semibold text-gray-700">{item.status}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
