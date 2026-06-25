import React from "react";
import { 
  X, Info, Clock, BookOpen, 
  User, GraduationCap, Layers, Calendar 
} from "lucide-react";

// TIPE DATA DISESUAIKAN DENGAN BACKEND POSTGRESQL
interface RosterItem {
  id_jadwal: string;
  les: number;
  jam_mulai: string;
  jam_berakhir: string;
  mapel?: { mapel: string };
  guru?: { nama_guru: string } | null;
  kelas?: { nama_kelas: string; ruang_kelas?: string };
  hari: string;
}

interface ModalDetailRosterProps {
  roster: RosterItem | null;
  onClose: () => void;
}

export default function ModalDetailRoster({ roster, onClose }: ModalDetailRosterProps) {
  // Jika tidak ada data yang dipilih, jangan render modal
  if (!roster) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      
      {/* Overlay Gelap */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Kotak Modal Detail (Responsif Scroll HP) */}
      <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in z-10 custom-scrollbar">
        
        {/* Header Modal */}
        <div className="bg-[#f8f9fa] border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
          <h3 className="text-lg font-bold text-black flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-500" /> Detail Jadwal Roster
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 bg-white rounded-full shadow-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content (Responsif Flexbox) */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
          
          {/* Bagian Kiri: Blok Indikator Sesi & Hari */}
          <div className="w-full md:w-44 h-36 md:h-52 flex-shrink-0 bg-black text-white rounded-2xl flex flex-col items-center justify-center shadow-md relative p-4 text-center">
            <Calendar className="w-8 h-8 mb-2 opacity-60 text-gray-400" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{roster.hari}</p>
            {/* Disesuaikan ke roster.les */}
            <h4 className="text-3xl font-black">{roster.les === 0 ? "Kegiatan" : `Les ${roster.les}`}</h4>
            <div className="absolute bottom-3 left-3 right-3 border-t border-white/10 pt-2 mt-2">
              <p className="text-xs text-gray-400 font-medium flex items-center justify-center gap-1">
                {/* Disesuaikan ke jam_mulai dan jam_berakhir */}
                <Clock className="w-3 h-3" /> {roster.jam_mulai} - {roster.jam_berakhir}
              </p>
            </div>
          </div>

          {/* Bagian Kanan: Informasi Detail Matapelajaran & Kelas */}
          <div className="flex-1 w-full space-y-5">
            
            {/* Nama Mata Pelajaran */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Mata Pelajaran
              </p>
              <h4 className="text-2xl font-extrabold text-black leading-tight">
                {/* Disesuaikan memanggil nested object mapel */}
                {roster.mapel?.mapel || "Data Tidak Tersedia"}
              </h4>
            </div>

            {/* Guru Pengampu */}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Guru Pengampu
              </p>
              <p className="text-lg font-bold text-gray-800">
                {/* Disesuaikan memanggil nested object guru */}
                {roster.les === 0 ? "Tidak ada guru" : roster.guru?.nama_guru || "Data Tidak Tersedia"}
              </p>
            </div>

            {/* Grid Sasaran Akademik (Kelas & Ruangan) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
              
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Tingkat Kelas
                </p>
                <p className="font-extrabold text-black">
                  {/* Disesuaikan memanggil nested object kelas */}
                  {roster.kelas?.nama_kelas || "Tidak Terdaftar"}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Ruang / Jurusan
                </p>
                <p className="font-extrabold text-black">
                  {/* Menggunakan data ruang kelas sebagai pengganti jurusan yang statis */}
                  {roster.kelas?.ruang_kelas || "-"}
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
