import React, { useState } from "react";
import Sidebar from "./sections/Sidebar";
import DataNilaiContent   from "./sections/DataNilai"

// ==========================================
// 3. KOMPONEN LAYOUT (PEMBUNGKUS UTAMA)
// ==========================================
export default function PageNilai() {
  // State untuk mengontrol sidebar di layar HP (Mobile)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    // Container ini menggunakan flexbox, sehingga Sidebar di kiri, Content di Kanan
    <div className="flex h-screen w-full bg-white overflow-hidden">
      
      {/* Panggil Sidebar */}
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        setIsMobileOpen={setIsMobileSidebarOpen} 
      />
      
      {/* Panggil Content Utama (Dashboard) */}
      <DataNilaiContent 
        onMenuClick={() => setIsMobileSidebarOpen(true)} 
      />

      {/* 
        NOTE UNTUK PENGEMBANGAN KE DEPAN:
        Jika kamu sudah menerapkan React Router, bagian <DashboardContent /> di atas
        bisa kamu ganti dengan <Outlet />. Jadi nanti isinya akan dinamis berubah 
        saat menu di klik.
      */}
      
    </div>
  );
}