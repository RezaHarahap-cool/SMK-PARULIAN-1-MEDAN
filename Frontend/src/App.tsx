import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute'; // <-- Jangan lupa import satpamnya

import Home from './pages/public/Home';
import JurusanPage from './pages/public/JurusanPage';
import Profile from './pages/public/Profile';
import Kariawan from './pages/public/Kariawan';
import Galeri from './pages/public/Galeri';
import Berita from './pages/public/Berita';
import Login from './pages/auth/LoginPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword'

// --- (Import Halaman Admin, Guru, Siswa tetap sama seperti milikmu) ---
import AdminLayout from './pages/dashboard/Admin/Dashbord';
import PageDataGuru from './pages/dashboard/Admin/PageDataGuru';
import PageDataSiswa from './pages/dashboard/Admin/PageDataSiswa';
import PageDataKepalaSekolah from './pages/dashboard/Admin/PageDataKepalaSekolah';
import PageDataPenempatan from './pages/dashboard/Admin/PageDataPenempatan';
import PageDataJurusan from './pages/dashboard/Admin/PageDataJurusan'
import PageDataMapel from './pages/dashboard/Admin/PageDataMapel';
import PageDataSemester from './pages/dashboard/Admin/pageSemester';
import PageDataRoster from './pages/dashboard/Admin/PageDataRoster';
import PageDataKelas from './pages/dashboard/Admin/PageDataKelas';
import PageDataTahunAjaran from './pages/dashboard/Admin/PageDataTahunAjaran';
import PageDataBerita from './pages/dashboard/Admin/PageDataBerita';
import PageDataRaport from './pages/dashboard/Admin/PageDataRaport';
import PageDataKenaikanKelas from './pages/dashboard/Admin/PageKenaikankelas';
import PageDataAlumni from './pages/dashboard/Admin/PageAlumni';
import PageDataMengajar from './pages/dashboard/Admin/PageMengajar';

import GuruLayout from './pages/dashboard/Guru/GuruDashbord';
import PaggePresensi from './pages/dashboard/Guru/PagePresensi';
import PageNilai from './pages/dashboard/Guru/PageNilai';
import PageJadwalMengajar from './pages/dashboard/Guru/PageJadwalMengajar';
import PageLaporan from './pages/dashboard/Guru/PageLaporan';
import PageRaporWali from './pages/dashboard/Guru/PageRaporWali';

import SiswaLayout from './pages/dashboard/Siswa/SiswaDashbord';
import PageAbsensi from './pages/dashboard/Siswa/PageAbsensi';
import PageRaport from './pages/dashboard/Siswa/PageRaport';
import PageRoster from './pages/dashboard/Siswa/PageRoster';

import KepsekLayout from './pages/dashboard/Kepala sekolah/KepsekDashbord';
import RaportCek from './pages/dashboard/Kepala sekolah/RaportCek';
import RingkasanData from './pages/dashboard/Kepala sekolah/RingkasanData'
import PageKumpulanNilai from './pages/dashboard/Guru/PageKumpulanNilai';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========================================== */}
        {/* RUTE PUBLIK (Bebas diakses siapa saja)       */}
        {/* ========================================== */}
        <Route path="/" element={<Home />} />
        <Route path="/jurusan" element={<JurusanPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/kariawan" element={<Kariawan />} />
        <Route path="/galeri" element={<Galeri />} />
        <Route path="/berita" element={<Berita/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/lupa-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ========================================== */}
        {/* RUTE ADMIN (Hanya bisa diakses admin)        */}
        {/* ========================================== */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />} />
          <Route path="/admin/data-guru" element={<PageDataGuru />} />
          <Route path="/admin/data-siswa" element={<PageDataSiswa />} />
          <Route path="/admin/data-kepsek" element={<PageDataKepalaSekolah />} />
          <Route path="/admin/jurusan" element={<PageDataJurusan />} />
          <Route path="/admin/mata-pelajaran" element={<PageDataMapel />} />
          <Route path="/admin/semester" element={<PageDataSemester />} />
          <Route path="/admin/roster" element={<PageDataRoster />} />
          <Route path="/admin/data-penempatan" element={<PageDataPenempatan />} />
          <Route path="/admin/data-kelas" element={<PageDataKelas />} />
          <Route path="/admin/tahun-ajaran" element={<PageDataTahunAjaran />} />
          <Route path="/admin/berita" element={<PageDataBerita />} />
          <Route path="/admin/cetak-rapor" element={<PageDataRaport />} />
          <Route path="/admin/kenaikan-kelas" element={<PageDataKenaikanKelas />} />
          <Route path="/admin/alumni" element={<PageDataAlumni />} />
          <Route path="/admin/mengajar" element={<PageDataMengajar />} />
        </Route>

        {/* ========================================== */}
        {/* RUTE GURU (Hanya bisa diakses guru)          */}
        {/* ========================================== */}
        <Route element={<ProtectedRoute allowedRoles={['guru']} />}>
          <Route path="/guru" element={<GuruLayout />} />
          <Route path="/guru/presensi" element={<PaggePresensi />} />
          <Route path="/guru/Nilai" element={<PageNilai />} />
          <Route path="/guru/DataNilai" element={<PageKumpulanNilai />} />
          <Route path="/guru/JadwalMengejar" element={<PageJadwalMengajar />} />
          <Route path="/guru/laporan" element={<PageLaporan />} />
          <Route path="/guru/rapor-wali" element={<PageRaporWali />} />
        </Route>

        {/* ========================================== */}
        {/* RUTE SISWA (Hanya bisa diakses siswa)        */}
        {/* ========================================== */}
        <Route element={<ProtectedRoute allowedRoles={['siswa']} />}>
          <Route path="/siswa" element={<SiswaLayout />} />
          <Route path="/siswa/absensi" element={<PageAbsensi />} />
          <Route path="/siswa/rapor" element={<PageRaport />} />
          <Route path="/siswa/roster" element={<PageRoster />} />
        </Route>

        {/* ========================================== */}
        {/* RUTE SISWA (Hanya bisa diakses siswa)        */}
        {/* ========================================== */}
        <Route element={<ProtectedRoute allowedRoles={['kepala_sekolah']} />}>
          <Route path="/kepsek" element={<KepsekLayout />} />
          <Route path="/kepsek/dashbord" element={<RingkasanData />} />
          <Route path="/kepsek/raport-cek" element={<RaportCek />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
