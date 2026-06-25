-- CreateEnum
CREATE TYPE "Role" AS ENUM ('siswa', 'guru', 'admin', 'kepala_sekolah');

-- CreateEnum
CREATE TYPE "GenderLengkap" AS ENUM ('Laki_laki', 'Perempuan');

-- CreateEnum
CREATE TYPE "GenderSingkat" AS ENUM ('Wanita', 'Pria');

-- CreateTable
CREATE TABLE "users" (
    "id_users" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "role" "Role" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_users")
);

-- CreateTable
CREATE TABLE "admin_profiles" (
    "id_admin" UUID NOT NULL,
    "users_id" UUID NOT NULL,
    "nama_admin" VARCHAR(50) NOT NULL,
    "jenis_kelamin" "GenderLengkap" NOT NULL,
    "no_hp" VARCHAR(20) NOT NULL,
    "foto" VARCHAR(255),

    CONSTRAINT "admin_profiles_pkey" PRIMARY KEY ("id_admin")
);

-- CreateTable
CREATE TABLE "guru_profiles" (
    "id_guru" UUID NOT NULL,
    "users_id" UUID NOT NULL,
    "nama_guru" VARCHAR(50) NOT NULL,
    "tgl_lahir" TIMESTAMP(0) NOT NULL,
    "gender" "GenderSingkat" NOT NULL,
    "agama" VARCHAR(50) NOT NULL,
    "pendidikan_tertinggi" VARCHAR(50) NOT NULL,
    "no_hp" VARCHAR(20) NOT NULL,
    "foto" VARCHAR(255),
    "mapel_id" UUID NOT NULL,

    CONSTRAINT "guru_profiles_pkey" PRIMARY KEY ("id_guru")
);

-- CreateTable
CREATE TABLE "siswa_profiles" (
    "id_siswa" UUID NOT NULL,
    "users_id" UUID NOT NULL,
    "npsn" BIGINT NOT NULL,
    "nis" BIGINT NOT NULL,
    "nisn" BIGINT NOT NULL,
    "foto" VARCHAR(255),
    "nama_siswa" VARCHAR(255) NOT NULL,
    "gender" "GenderSingkat" NOT NULL,
    "tempat_tgl_lahir" VARCHAR(55) NOT NULL,
    "kelas_id" INTEGER NOT NULL,
    "nama_ayah" VARCHAR(55) NOT NULL,
    "pekerjaan_ayah" VARCHAR(55) NOT NULL,
    "nama_ibu" VARCHAR(55) NOT NULL,
    "pekerjaan_ibu" VARCHAR(55) NOT NULL,
    "alamat" VARCHAR(55) NOT NULL,
    "desa/kelurahan" VARCHAR(55) NOT NULL,
    "kecamatan" VARCHAR(55) NOT NULL,
    "kabupaten/kota" VARCHAR(55) NOT NULL,
    "provinsi" VARCHAR(55) NOT NULL,
    "no_hp_wali" VARCHAR(55) NOT NULL,

    CONSTRAINT "siswa_profiles_pkey" PRIMARY KEY ("id_siswa")
);

-- CreateTable
CREATE TABLE "kepala_sekolah_profiles" (
    "id_kepsek" UUID NOT NULL,
    "users_id" UUID NOT NULL,
    "nama_ks" VARCHAR(50) NOT NULL,
    "tgl_lahir" TIMESTAMP(0) NOT NULL,
    "gender" "GenderSingkat" NOT NULL,
    "agama" VARCHAR(50) NOT NULL,
    "pendidikan_tertinggi" VARCHAR(20) NOT NULL,
    "foto" VARCHAR(255),

    CONSTRAINT "kepala_sekolah_profiles_pkey" PRIMARY KEY ("id_kepsek")
);

-- CreateTable
CREATE TABLE "mata_pelajaran" (
    "id_mapel" UUID NOT NULL,
    "mapel" VARCHAR(55) NOT NULL,

    CONSTRAINT "mata_pelajaran_pkey" PRIMARY KEY ("id_mapel")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_profiles_users_id_key" ON "admin_profiles"("users_id");

-- CreateIndex
CREATE UNIQUE INDEX "guru_profiles_users_id_key" ON "guru_profiles"("users_id");

-- CreateIndex
CREATE UNIQUE INDEX "siswa_profiles_users_id_key" ON "siswa_profiles"("users_id");

-- CreateIndex
CREATE UNIQUE INDEX "kepala_sekolah_profiles_users_id_key" ON "kepala_sekolah_profiles"("users_id");

-- AddForeignKey
ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id_users") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guru_profiles" ADD CONSTRAINT "guru_profiles_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id_users") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guru_profiles" ADD CONSTRAINT "guru_profiles_mapel_id_fkey" FOREIGN KEY ("mapel_id") REFERENCES "mata_pelajaran"("id_mapel") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siswa_profiles" ADD CONSTRAINT "siswa_profiles_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id_users") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kepala_sekolah_profiles" ADD CONSTRAINT "kepala_sekolah_profiles_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id_users") ON DELETE CASCADE ON UPDATE CASCADE;
