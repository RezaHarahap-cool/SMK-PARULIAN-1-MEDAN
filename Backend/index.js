import express from 'express';
import cors from 'cors';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import guruRoutes from './routes/guruRoutes.js';
import siswaRoutes from './routes/siswaRoutes.js';
import mapelRoutes from './routes/mapelRoutes.js';
import jurusanRoutes from './routes/jurusanRoutes.js';
import kelasRoutes from './routes/kelasRoutes.js';
import kepsekRoutes from './routes/kepsekRoutes.js';
import tahunAjaranRoutes from './routes/tahunAjaranRoutes.js';
import beritaRoute from './routes/beritaRoute.js';
import dashboardRoute from './routes/dashboardRoute.js';
import penempatanRoute from './routes/penempatanRoute.js';
import jadwalRoute from './routes/jadwalRoute.js';
import kenaikanKelasRoute from './routes/kenaikanKelasRoute.js';
import alumniRoute from './routes/alumniRoute.js';
import semesterRoutes from './routes/semesterRoutes.js'
import mengajarRoutes from './routes/mengajarRoutes.js';
import { initWhatsApp } from './services/whatsappService.js';
import raporAdminRoutes from './routes/raporAdminRoutes.js';

// bagian guru
import profileGuruRoute from './routes/guru/profileRoute.js';
import absensiRoutes from './routes/guru/absensiRoutes.js';
import nilaiRoutes from './routes/guru/nilaiRoutes.js';
import jadwalGuruRoutes from './routes/guru/jadwalGuruRoutes.js';
import laporanHarianRoutes from './routes/guru/laporanHarianRoutes.js';
import raporRoutes from './routes/guru/raporRoutes.js';
import raporWaliRoutes from './routes/guru/raporWaliRoutes.js';


// Bagian siswa
import profileSiswaRoute from './routes/siswa/profileRoute.js';
import absensiSiswaRoutes from './routes/siswa/absensiSiswaRoutes.js';
import jadwalSiswaRoutes from './routes/siswa/jadwalSiswaRoutes.js';
import raporSiswaRoutes from './routes/siswa/raporSiswaRoutes.js';

// Bagian kepsek
import profileKepsekRoute from './routes/kepsek/profileRoute.js';
import raporKepsekRoutes from './routes/kepsek/raporKepsekRoutes.js';
import dashboardKepsekRoutes from './routes/kepsek/dashboardKepsekRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();


// Persiapan untuk path statis di sistem ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// PENTING: Buka akses folder 'uploads' agar bisa diakses lewat URL
// Contoh: http://localhost:3000/uploads/1715423...-foto.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/guru', guruRoutes);
app.use('/api/siswa', siswaRoutes);
app.use('/api/mapel', mapelRoutes);
app.use('/api/jurusan', jurusanRoutes);
app.use('/api/kelas', kelasRoutes);
app.use('/api/kepsek', kepsekRoutes);
app.use('/api/tahun-ajaran', tahunAjaranRoutes);
app.use('/api/berita', beritaRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/penempatan', penempatanRoute);
app.use('/api/jadwal', jadwalRoute);
app.use('/api/kenaikan-kelas', kenaikanKelasRoute);
app.use('/api/alumni', alumniRoute);
app.use('/api', semesterRoutes);
app.use('/api/', mengajarRoutes);
app.use('/api/admin', raporAdminRoutes);

// bagian guru
app.use('/api/my-profile', profileGuruRoute);
app.use('/api', absensiRoutes);
app.use('/api', nilaiRoutes);
app.use('/api', jadwalGuruRoutes);
app.use('/api/wali-kelas', laporanHarianRoutes);
app.use('/api/wali-kelas', raporWaliRoutes);
app.use('/api/guru-area', raporRoutes);



// bagian siswa
app.use('/api/my-profile/siswa', profileSiswaRoute);
app.use('/api/siswa-area', absensiSiswaRoutes);
app.use('/api/siswa-area', jadwalSiswaRoutes);
app.use('/api/siswa-area', raporSiswaRoutes);

// bagian kepsek
app.use('/api/my-profile/kepsek', profileKepsekRoute);
app.use('/api/kepsek-area', raporKepsekRoutes);
app.use('/api/dashboard-kepsek', dashboardKepsekRoutes);

if (process.env.NODE_ENV !== 'test') {
  initWhatsApp();
  app.listen(PORT, () => {
    console.log(`Server backend sudah menyala di http://localhost:${PORT}`);
  });
}

export default app;
