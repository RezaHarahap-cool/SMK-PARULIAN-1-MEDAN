import prisma from '../../config/prisma.js'
import bcrypt from 'bcrypt';
import fs from 'fs';

export const createAdmin = async (req, res) => {
  try {
    // 1. Ambil data teks mentah dari body request
    const { username, password, email, nama_admin, jenis_kelamin, no_hp } = req.body;

    const saltRounds = 10; // Menentukan tingkat kerumitan acakan (10 adalah standar aman)
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const fotoName = req.file ? req.file.filename : null;

    // 3. Masukkan ke database menggunakan Transaction
    const result = await prisma.$transaction(async (tx) => {
      
      const userBaru = await tx.user.create({
        data: {
          username: username,
          password: hashedPassword, 
          email: email,
          role: 'admin',
          is_active: true,
        },
      });

      const adminBaru = await tx.adminProfile.create({
        data: {
          users_id: userBaru.id_users,
          nama_admin: nama_admin,
          jenis_kelamin: jenis_kelamin,
          no_hp: no_hp,
          foto: fotoName, // Masukkan nama file yang di-generate multer ke database
        },
      });

      return { userBaru, adminBaru };
    });

    // 4. Kirim respon sukses
    res.status(201).json({
      success: true,
      message: "Data Users dan Admin beserta foto berhasil disimpan!",
      data: {
        id_users: result.userBaru.id_users,
        username: result.userBaru.username,
        nama_admin: result.adminBaru.nama_admin,
        foto: result.adminBaru.foto // Menampilkan nama file yang tersimpan
      }
    });

  } catch (error) {
    if (error.code === 'P2002') {
      // Menangkap field apa yang duplikat (bisa email atau username)
      const fieldYangKembar = error.meta.target[0]; 
      
      return res.status(400).json({
        success: false,
        message: `Gagal mendaftar. ${fieldYangKembar} tersebut sudah digunakan! Silakan gunakan ${fieldYangKembar} lain.`
      });
    }
    console.error("Gagal insert data:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



export const getAllAdmins = async (req, res) => {
  try {
    // Mengambil semua data dengan role 'admin'
    const admins = await prisma.user.findMany({
      where: {
        role: 'admin',
      },
      // Menggunakan 'select' untuk memilih field apa saja yang mau ditampilkan,
      // sekaligus melakukan JOIN ke tabel 'admin_profiles'.
      // Perhatikan: kita TIDAK menuliskan 'password' di sini agar aman!
      select: {
        id_users: true,
        username: true,
        email: true,
        is_active: true,
        created_at: true,
        
        // Ini cara Prisma melakukan JOIN (One-to-One)
        admin: {
          select: {
            nama_admin: true,
            jenis_kelamin: true,
            no_hp: true,
            foto: true,
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Data seluruh admin berhasil ditarik!",
      data: admins
    });

  } catch (error) {
    console.error("Gagal mengambil data:", error);
    res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server saat mengambil data." 
    });
  }
};

// Tambahkan fungsi ini di bawah fungsi getAllAdmins
export const getMyProfile = async (req, res) => {
  try {
    // 1. Ambil ID user dari hasil terjemahan Middleware
    const userId = req.user.id_users;

    // 2. Suruh Prisma mencari data khusus untuk ID tersebut
    const myProfile = await prisma.user.findUnique({
      where: {
        id_users: userId,
      },
      select: {
        username: true,
        email: true,
        role: true,
        // Ambil juga biodata dari tabel admin_profiles
        admin: {
          select: {
            nama_admin: true,
            jenis_kelamin: true,
            no_hp: true,
            foto: true,
          }
        }
      }
    });

    if (!myProfile) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan." });
    }

    // 3. Kirim data ke frontend untuk ditampilkan di Dashboard
    res.status(200).json({
      success: true,
      message: "Data profil berhasil ditarik!",
      data: myProfile
    });

  } catch (error) {
    console.error("Gagal mengambil profil:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};


export const updateMyProfile = async (req, res) => {
  try {
    // 1. Ambil ID dari token JWT yang sedang login
    const userId = req.user.id_users;

    // 2. Ambil data teks dari form-data
    const { username, email, password, nama_admin, jenis_kelamin, no_hp } = req.body;

    // 3. Cari data admin lama terlebih dahulu untuk pengecekan foto
    const adminLama = await prisma.user.findUnique({
      where: { id_users: userId },
      include: { admin: true }
    });

    if (!adminLama) {
      return res.status(404).json({ success: false, message: "Akun tidak ditemukan." });
    }

    // 4. Siapkan objek data untuk di-update
    let dataUser = { username, email };
    let dataProfile = { nama_admin, jenis_kelamin, no_hp };

    // 5. Logika jika PASSWORD ingin diubah
    if (password && password.trim() !== "") {
      const saltRounds = 10;
      dataUser.password = await bcrypt.hash(password, saltRounds);
    }

    // 6. Logika jika FOTO PROFILE ingin diubah
    if (req.file) {
      dataProfile.foto = req.file.filename;

      // OPSIONAL: Hapus file foto lama di folder 'uploads' agar tidak memenuhi harddisk
      if (adminLama.admin?.foto) {
        const pathFotoLama = `./uploads/${adminLama.admin.foto}`;
        if (fs.existsSync(pathFotoLama)) {
          fs.unlinkSync(pathFotoLama);
        }
      }
    }

    // 7. Jalankan Update menggunakan Transaksi Prisma
    const result = await prisma.$transaction(async (tx) => {
      const userUpdated = await tx.user.update({
        where: { id_users: userId },
        data: dataUser
      });

      const profileUpdated = await tx.adminProfile.update({
        where: { users_id: userId },
        data: dataProfile
      });

      return { userUpdated, profileUpdated };
    });

    // 8. Berikan respon sukses
    res.status(200).json({
      success: true,
      message: "Profil Admin berhasil diperbarui!",
      data: {
        username: result.userUpdated.username,
        email: result.userUpdated.email,
        nama_admin: result.profileUpdated.nama_admin,
        foto: result.profileUpdated.foto
      }
    });

  } catch (error) {
    // Tangkap jika ada email/username kembar saat di-update
    if (error.code === 'P2002') {
      const fieldYangKembar = error.meta.target[0];
      return res.status(400).json({
        success: false,
        message: `${fieldYangKembar} tersebut sudah dipakai oleh akun lain!`
      });
    }

    console.error("Gagal update data:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat update." });
  }
};



export const deleteAdmin = async (req, res) => {
  try {
    // 1. Ambil ID admin yang mau dihapus dari URL parameter (:id)
    const { id } = req.params; 

    // 2. Ambil ID admin yang sedang login dari token JWT
    const adminSelesaiLogin = req.user.id_users;

    // KUNCI KEAMANAN: Cegah admin menghapus dirinya sendiri
    if (id === adminSelesaiLogin) {
      return res.status(400).json({
        success: false,
        message: "Akses ditolak! Anda tidak diizinkan menghapus akun Anda sendiri yang sedang aktif digunakan."
      });
    }

    // 3. Cari data admin yang mau dihapus untuk dicek fotonya
    const adminTarget = await prisma.user.findUnique({
      where: { id_users: id },
      include: { admin: true }
    });

    if (!adminTarget) {
      return res.status(404).json({ success: false, message: "Data admin tidak ditemukan!" });
    }

    // 4. Hapus file foto fisik di folder 'uploads' jika ada
    if (adminTarget.admin?.foto) {
      const pathFoto = `./uploads/${adminTarget.admin.foto}`;
      if (fs.existsSync(pathFoto)) {
        fs.unlinkSync(pathFoto); // File dihapus dari harddisk server
      }
    }

    // 5. Eksekusi penghapusan di database menggunakan Transaksi
    await prisma.$transaction(async (tx) => {
      // Hapus anak tabelnya dulu (Biodata)
      await tx.adminProfile.delete({
        where: { users_id: id }
      });

      // Hapus induk tabelnya (User)
      await tx.user.delete({
        where: { id_users: id }
      });
    });

    res.status(200).json({
      success: true,
      message: `Akun admin dengan username @${adminTarget.username} telah dihapus permanen dari sistem!`
    });

  } catch (error) {
    console.error("Gagal menghapus admin:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat menghapus data." });
  }
};
