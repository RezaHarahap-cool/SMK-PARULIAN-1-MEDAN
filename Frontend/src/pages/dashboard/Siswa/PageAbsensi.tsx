import React, { useState } from "react";
import Sidebar from "./sections/Sidebar";
import ModalDetailAbsensi from "./components/ModalDetailAbsensi";
import AbsensiContent   from "./sections/DataAbsensi"

// ==========================================
// 3. KOMPONEN LAYOUT (PEMBUNGKUS UTAMA)
// ==========================================
export default function PageAbsensi() {
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
      <AbsensiContent 
        onMenuClick={() => setIsMobileSidebarOpen(true)} 
      />

      
    </div>
  );
}