import React, { useState } from "react";
import Sidebar from "./sections/Sidebar";
import DataRaporWali from "./sections/DataRaporWali";

export default function PageRaporWali() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />
      <DataRaporWali onMenuClick={() => setIsMobileSidebarOpen(true)} />
    </div>
  );
}
