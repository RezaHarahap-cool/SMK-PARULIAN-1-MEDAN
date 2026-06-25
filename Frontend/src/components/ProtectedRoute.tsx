import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // 1. Kalau belum login, lempar ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Kalau sudah login tapi rolenya tidak diizinkan masuk rute ini
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // Arahkan ke dashboard sesuai role asli mereka
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    if (userRole === 'guru') return <Navigate to="/guru" replace />;
    if (userRole === 'siswa') return <Navigate to="/siswa" replace />;
    
    return <Navigate to="/login" replace />;
  }

  // 3. Kalau aman, izinkan masuk ke semua anak-anak rute di dalamnya!
  return <Outlet />;
}