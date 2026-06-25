import React, { useState } from "react";
import Sidebar from "./sections/Sidebar";
import RaporSiswaContent   from "./sections/DataRaport"

// ==========================================
// 3. KOMPONEN LAYOUT (PEMBUNGKUS UTAMA)
// ==========================================
export default function PageRaport() {
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
      <RaporSiswaContent 
        onMenuClick={() => setIsMobileSidebarOpen(true)} 
      />

      
    </div>
  );
}