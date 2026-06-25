-- CreateEnum
CREATE TYPE "StatusJurusan" AS ENUM ('AKTIF', 'NON_AKTIF');

-- CreateTable
CREATE TABLE "jurusan" (
    "id_jurusan" UUID NOT NULL,
    "jurusan" VARCHAR(55) NOT NULL,
    "status" "StatusJurusan" NOT NULL,

    CONSTRAINT "jurusan_pkey" PRIMARY KEY ("id_jurusan")
);

-- CreateTable
CREATE TABLE "kelas" (
    "id_kelas" UUID NOT NULL,
    "ruang_kelas" VARCHAR(55) NOT NULL,
    "guru_id" UUID,
    "jurusan_id" UUID NOT NULL,

    CONSTRAINT "kelas_pkey" PRIMARY KEY ("id_kelas")
);

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_guru_id_fkey" FOREIGN KEY ("guru_id") REFERENCES "guru_profiles"("id_guru") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_jurusan_id_fkey" FOREIGN KEY ("jurusan_id") REFERENCES "jurusan"("id_jurusan") ON DELETE RESTRICT ON UPDATE CASCADE;
