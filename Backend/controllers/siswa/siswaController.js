import prisma from '../../config/prisma.js';

// ==========================================
// FUNGSI MENGAMBIL PROFIL SISWA YANG LOGIN
// ==========================================
export const getProfileSiswa = async (req, res) => {
  try {
    const userId = req.user.id_users;

    const myProfile = await prisma.user.findUnique({
      where: {
        id_users: userId,
      },
      select: {
        username: true,
        email: true,
        role: true,
        siswa: { 
          select: {
            id_siswa: true,
            nis: true,
            nisn: true,
            nama_siswa: true,
            gender: true,
            tempat_tgl_lahir: true,
            foto: true,
            status_siswa: true,
            no_hp_wali: true,
            alamat: true,
            
            // 👇 TAMBAHAN DATA BARU YANG SEBELUMNYA KELUPAAN DI-SELECT 👇
            nama_ayah: true,
            pekerjaan_ayah: true,
            nama_ibu: true,
            pekerjaan_ibu: true,
            desa_kelurahan: true,
            kecamatan: true,
            kabupaten_kota: true,
            provinsi: true,
            // 👆 ======================================================= 👆

            // Kita tarik juga data kelas aktifnya saat ini!
            riwayat_kelas: {
              where: { status_kenaikan: 'Sedang_Belajar' },
              include: {
                kelas: {
                  include: { jurusan: true }
                },
                tahun_ajaran: true
              }
            }
          }
        }
      }
    });

    if (!myProfile) {
      return res.status(404).json({ success: false, message: "Data siswa tidak ditemukan." });
    }

    res.status(200).json({
      success: true,
      message: "Data profil siswa berhasil ditarik lengkap!",
      data: myProfile
    });

  } catch (error) {
    console.error("Gagal mengambil profil siswa:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

export const updateProfileSiswa = async (req, res) => {
  try {
    const userId = req.user.id_users;
    const {
      no_hp_wali,
      alamat,
      desa_kelurahan,
      kecamatan,
      kabupaten_kota,
      provinsi,
    } = req.body;

    const dataUpdate = {};
    if (no_hp_wali !== undefined) dataUpdate.no_hp_wali = no_hp_wali;
    if (alamat !== undefined) dataUpdate.alamat = alamat;
    if (desa_kelurahan !== undefined) dataUpdate.desa_kelurahan = desa_kelurahan;
    if (kecamatan !== undefined) dataUpdate.kecamatan = kecamatan;
    if (kabupaten_kota !== undefined) dataUpdate.kabupaten_kota = kabupaten_kota;
    if (provinsi !== undefined) dataUpdate.provinsi = provinsi;
    if (req.file) dataUpdate.foto = req.file.filename;

    if (Object.keys(dataUpdate).length === 0) {
      return res.status(400).json({ success: false, message: "Tidak ada data yang dikirim untuk diperbarui." });
    }

    const updated = await prisma.siswaProfile.update({
      where: { users_id: userId },
      data: dataUpdate,
    });

    res.status(200).json({ success: true, message: "Profil siswa berhasil diperbarui.", data: updated });
  } catch (error) {
    console.error("Gagal update profil siswa:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server saat memperbarui profil." });
  }
};
