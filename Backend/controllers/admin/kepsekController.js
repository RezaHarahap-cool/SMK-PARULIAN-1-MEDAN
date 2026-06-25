import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs';

const prisma = new PrismaClient();

const parseOptionalDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

// ==========================================
// 1. TAMBAH DATA KEPALA SEKOLAH (POST)
// ==========================================
export const createKepsek = async (req, res) => {
  try {
    const { 
      username, email, password, 
      nama_ks, tgl_lahir, gender, agama, pendidikan_tertinggi, no_hp,
      mulai_menjabat, selesai_menjabat, status_jabatan
    } = req.body;

    // 1. Validasi Data Krusial
    if (!username || !email || !password || !nama_ks || !mulai_menjabat) {
      if (req.file) fs.unlinkSync(`./uploads/${req.file.filename}`);
      return res.status(400).json({ success: false, message: "Username, Email, Password, Nama, dan Tanggal Mulai Jabatan wajib diisi!" });
    }

    const tanggalMulai = parseOptionalDate(mulai_menjabat);
    const tanggalSelesai = parseOptionalDate(selesai_menjabat);
    if (!tanggalMulai || (selesai_menjabat && !tanggalSelesai)) {
      if (req.file) fs.unlinkSync(`./uploads/${req.file.filename}`);
      return res.status(400).json({ success: false, message: "Format tanggal masa jabatan tidak valid." });
    }
    if (tanggalSelesai && tanggalSelesai < tanggalMulai) {
      if (req.file) fs.unlinkSync(`./uploads/${req.file.filename}`);
      return res.status(400).json({ success: false, message: "Tanggal selesai jabatan tidak boleh lebih awal dari tanggal mulai." });
    }
    if (status_jabatan === 'NON_AKTIF' && !tanggalSelesai) {
      if (req.file) fs.unlinkSync(`./uploads/${req.file.filename}`);
      return res.status(400).json({ success: false, message: "Tanggal selesai jabatan wajib diisi saat status jabatan non-aktif." });
    }

    // 2. Enkripsi Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Tangkap File Foto (Jika ada)
    const foto = req.file ? req.file.filename : null;

    // 4. Eksekusi Transaksi Database
    const result = await prisma.$transaction(async (tx) => {
      // Buat akun Login di tabel User
      const userAccount = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: 'kepala_sekolah' // Sesuaikan dengan enum role di database-mu
        }
      });

      // Buat biodata di tabel KepalaSekolahProfile
      const profile = await tx.kepalaSekolahProfile.create({
        data: {
          users_id: userAccount.id_users,
          nama_ks,
          tgl_lahir: new Date(tgl_lahir), // Wajib konversi ke Date Object untuk PostgreSQL
          gender, // Pastikan isinya sesuai enum ("L" atau "P" atau "Pria" / "Wanita")
          agama,
          pendidikan_tertinggi,
          no_hp: no_hp || null,
          mulai_menjabat: tanggalMulai,
          selesai_menjabat: tanggalSelesai,
          status_jabatan: status_jabatan === 'NON_AKTIF' ? 'NON_AKTIF' : 'AKTIF',
          foto
        }
      });

      return { userAccount, profile };
    });

    return res.status(201).json({
      success: true,
      message: `Data Kepala Sekolah atas nama ${result.profile.nama_ks} berhasil ditambahkan!`,
      data: result.profile
    });

  } catch (error) {
    // Sapu file foto jika error bentrok username/email
    if (req.file && fs.existsSync(`./uploads/${req.file.filename}`)) {
      fs.unlinkSync(`./uploads/${req.file.filename}`);
    }

    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: "Gagal! Username atau Email sudah terpakai." });
    }

    console.error("Error create kepsek:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server saat menyimpan data." });
  }
};


// ==========================================
// 2. TARIK SEMUA DATA KEPALA SEKOLAH (GET)
// ==========================================
export const getAllKepsek = async (req, res) => {
  try {
    const kepsekList = await prisma.user.findMany({
      where: { role: 'kepala_sekolah' }, // Filter hanya ambil yang jabatannya kepsek
      select: {
        id_users: true,
        username: true,
        email: true,
        is_active: true,
        // PERHATIAN: Nama 'kepalaSekolahProfile' ini harus sama persis dengan nama relasi di model User pada schema.prisma milikmu
        kepala_sekolah: {
          select: {
            id_kepsek: true,
            nama_ks: true,
            tgl_lahir: true,
            gender: true,
            agama: true,
            pendidikan_tertinggi: true,
            no_hp: true,
            mulai_menjabat: true,
            selesai_menjabat: true,
            status_jabatan: true,
            foto: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: "Data Kepala Sekolah berhasil ditarik!",
      data: kepsekList
    });

  } catch (error) {
    console.error("Error get all kepsek:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server saat mengambil data." });
  }
};

// ==========================================
// 3. TAMPILKAN DETAIL KEPALA SEKOLAH (GET BY ID)
// ==========================================
export const getKepsekById = async (req, res) => {
  try {
    const { id } = req.params; // Tangkap ID target dari parameter URL

    // 1. Tarik data dari database beserta profilnya
    const kepsekDetail = await prisma.user.findUnique({
      where: { id_users: id },
      select: {
        id_users: true,
        username: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
        // Kita pakai nama relasi yang sudah diperbaiki agar tidak error lagi
        kepala_sekolah: { 
          select: {
            id_kepsek: true,
            nama_ks: true,
            tgl_lahir: true,
            gender: true,
            agama: true,
            pendidikan_tertinggi: true,
            no_hp: true,
            mulai_menjabat: true,
            selesai_menjabat: true,
            status_jabatan: true,
            foto: true
          }
        }
      }
    });

    // 2. Validasi Ketersediaan Data
    if (!kepsekDetail) {
      return res.status(404).json({ success: false, message: "Data Kepala Sekolah tidak ditemukan." });
    }

    // 3. Validasi Keamanan: Pastikan ID ini benar-benar milik Kepala Sekolah
    if (kepsekDetail.role !== 'kepala_sekolah') {
      return res.status(403).json({ 
        success: false, 
        message: "Akses ditolak! ID tersebut bukan milik Kepala Sekolah." 
      });
    }

    // 4. Kirim data ke Frontend
    return res.status(200).json({
      success: true,
      message: "Detail Kepala Sekolah berhasil ditarik!",
      data: kepsekDetail
    });

  } catch (error) {
    console.error("Error get detail kepsek:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat mengambil detail data." 
    });
  }
};

// ==========================================
// 4. EDIT DATA KEPALA SEKOLAH (UPDATE)
// ==========================================
export const updateKepsek = async (req, res) => {
  try {
    const { id } = req.params; // Ambil ID dari parameter URL

    // 1. Ambil data dari form-data
    const { 
      username, email, password, is_active,
      nama_ks, tgl_lahir, gender, agama, pendidikan_tertinggi, no_hp,
      mulai_menjabat, selesai_menjabat, status_jabatan
    } = req.body;

    // 2. Cari data lama kepsek untuk mengecek akun dan foto lama
    const kepsekLama = await prisma.user.findUnique({
      where: { id_users: id },
      include: { kepala_sekolah: true } // Sesuai dengan nama relasi di Prisma
    });

    if (!kepsekLama) {
      // Jika admin mengunggah foto tapi akun tidak ditemukan, hapus foto tersebut
      if (req.file) {
        fs.unlinkSync(`./uploads/${req.file.filename}`);
      }
      return res.status(404).json({ success: false, message: "Data Kepala Sekolah tidak ditemukan!" });
    }

    // 3. Siapkan wadah data untuk Update (Pisahkan User dan Profile)
    let dataUser = { username, email };
    
    // Pastikan tgl_lahir dikonversi kembali ke Date Object untuk PostgreSQL
    let dataProfile = { 
      nama_ks, 
      gender, // Harus "Pria" atau "Wanita" dari frontend
      agama, 
      pendidikan_tertinggi,
      no_hp: no_hp || null
    };

    if (tgl_lahir) {
      dataProfile.tgl_lahir = new Date(tgl_lahir);
    }
    if (mulai_menjabat) {
      const tanggalMulai = parseOptionalDate(mulai_menjabat);
      if (!tanggalMulai) {
        if (req.file) fs.unlinkSync(`./uploads/${req.file.filename}`);
        return res.status(400).json({ success: false, message: "Format tanggal mulai jabatan tidak valid." });
      }
      dataProfile.mulai_menjabat = tanggalMulai;
    }
    if (selesai_menjabat !== undefined) {
      const tanggalSelesai = parseOptionalDate(selesai_menjabat);
      if (selesai_menjabat && !tanggalSelesai) {
        if (req.file) fs.unlinkSync(`./uploads/${req.file.filename}`);
        return res.status(400).json({ success: false, message: "Format tanggal selesai jabatan tidak valid." });
      }
      dataProfile.selesai_menjabat = tanggalSelesai;
    }
    if (status_jabatan !== undefined) {
      dataProfile.status_jabatan = status_jabatan === 'NON_AKTIF' ? 'NON_AKTIF' : 'AKTIF';
    }
    const tanggalMulaiValidasi = dataProfile.mulai_menjabat || kepsekLama.kepala_sekolah?.mulai_menjabat;
    const tanggalSelesaiValidasi = selesai_menjabat !== undefined
      ? dataProfile.selesai_menjabat
      : kepsekLama.kepala_sekolah?.selesai_menjabat;
    if (tanggalMulaiValidasi && tanggalSelesaiValidasi && tanggalSelesaiValidasi < tanggalMulaiValidasi) {
      if (req.file) fs.unlinkSync(`./uploads/${req.file.filename}`);
      return res.status(400).json({ success: false, message: "Tanggal selesai jabatan tidak boleh lebih awal dari tanggal mulai." });
    }
    if (dataProfile.status_jabatan === 'NON_AKTIF' && !tanggalSelesaiValidasi) {
      if (req.file) fs.unlinkSync(`./uploads/${req.file.filename}`);
      return res.status(400).json({ success: false, message: "Tanggal selesai jabatan wajib diisi saat status jabatan non-aktif." });
    }

    // --- LOGIKA KHUSUS ---

    // A. Parsing status aktif akun dari form-data string ke Boolean
    if (is_active !== undefined) {
      dataUser.is_active = is_active === 'true' || is_active === true;
    }

    // B. Logika Reset Password: Jika diisi, enkripsi dan timpa yang lama
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      dataUser.password = await bcrypt.hash(password, salt);
    }

    // C. Logika Penggantian Foto Profil
    if (req.file) {
      dataProfile.foto = req.file.filename;

      // Hapus fisik foto lama dari folder uploads agar tidak jadi sampah
      if (kepsekLama.kepala_sekolah?.foto) {
        const pathFotoLama = `./uploads/${kepsekLama.kepala_sekolah.foto}`;
        if (fs.existsSync(pathFotoLama)) {
          fs.unlinkSync(pathFotoLama);
        }
      }
    }

    // 4. Eksekusi Update dengan Transaksi
    const result = await prisma.$transaction(async (tx) => {
      const userUpdated = await tx.user.update({
        where: { id_users: id },
        data: dataUser
      });

      // Update data di tabel anak (kepala_sekolah_profiles)
      const profileUpdated = await tx.kepalaSekolahProfile.update({
        where: { users_id: id },
        data: dataProfile
      });

      return { userUpdated, profileUpdated };
    });

    res.status(200).json({
      success: true,
      message: `Data Pimpinan atas nama ${result.profileUpdated.nama_ks} berhasil diperbarui!`,
    });

  } catch (error) {
    // Bersihkan file jika update gagal di tengah jalan (misal karena bentrok email)
    if (req.file) {
      const pathGagal = `./uploads/${req.file.filename}`;
      if (fs.existsSync(pathGagal)) fs.unlinkSync(pathGagal);
    }

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: "Update gagal. Username atau Email sudah terpakai oleh akun lain!"
      });
    }

    console.error("Error update kepsek:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat memperbarui data." });
  }
};


// ==========================================
// 5. HAPUS DATA KEPALA SEKOLAH (DELETE)
// ==========================================
export const deleteKepsek = async (req, res) => {
  try {
    const { id } = req.params; // Ambil ID dari URL parameter

    // 1. Cari data Kepsek beserta profilnya
    const kepsekTarget = await prisma.user.findUnique({
      where: { id_users: id },
      include: { kepala_sekolah: true } // Menggunakan nama relasi yang sudah diperbaiki
    });

    // 2. Validasi Ketersediaan Data
    if (!kepsekTarget) {
      return res.status(404).json({ success: false, message: "Data Kepala Sekolah tidak ditemukan!" });
    }

    // 3. Validasi Keamanan: Pastikan yang dihapus benar-benar entitas Kepala Sekolah
    if (kepsekTarget.role !== 'kepala_sekolah') {
      return res.status(403).json({ 
        success: false, 
        message: "Akses ditolak! ID yang dimasukkan bukan milik entitas Kepala Sekolah." 
      });
    }

    // 4. Bersihkan file foto dari folder 'uploads' jika ada
    if (kepsekTarget.kepala_sekolah?.foto) {
      const pathFoto = `./uploads/${kepsekTarget.kepala_sekolah.foto}`;
      if (fs.existsSync(pathFoto)) {
        fs.unlinkSync(pathFoto); 
      }
    }

    // 5. Eksekusi Penghapusan Database via Transaksi
    await prisma.$transaction(async (tx) => {
      // Wajib: Hapus data di tabel anak (kepala_sekolah_profiles) terlebih dahulu
      await tx.kepalaSekolahProfile.delete({
        where: { users_id: id }
      });

      // Setelah anak terhapus, baru hapus data di tabel induk (users)
      await tx.user.delete({
        where: { id_users: id }
      });
    });

    // 6. Kirim respons berhasil
    res.status(200).json({
      success: true,
      message: `Data Pimpinan atas nama ${kepsekTarget.kepala_sekolah?.nama_ks || kepsekTarget.username} berhasil dihapus permanen!`
    });

  } catch (error) {
    console.error("Gagal menghapus kepsek:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat menghapus data." });
  }
};
