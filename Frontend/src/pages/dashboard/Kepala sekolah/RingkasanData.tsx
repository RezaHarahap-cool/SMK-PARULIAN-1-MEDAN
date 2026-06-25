import React, { useState } from "react";
import Sidebar from "./sections/Sidebar";
import DashboardKepsekContent   from "./sections/DashboardKepsekContent"

// ==========================================
// 3. KOMPONEN LAYOUT (PEMBUNGKUS UTAMA)
// ==========================================
export default function RingkasanData() {
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
      <DashboardKepsekContent
        onMenuClick={() => setIsMobileSidebarOpen(true)} 
      />

      
    </div>
  );
}