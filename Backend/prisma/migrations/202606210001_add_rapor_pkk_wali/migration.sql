-- Legacy filename: kebutuhan yang benar adalah Prakerin wali, bukan PKK.
-- Prakerin di rapor diinput oleh wali kelas dan tidak membutuhkan guru pengampu.
CREATE TABLE "rapor_prakerin_wali" (
    "id_rapor_prakerin_wali" UUID NOT NULL DEFAULT gen_random_uuid(),
    "riwayat_kelas_siswa_id" UUID NOT NULL,
    "semester_id" UUID NOT NULL,
    "wali_kelas_id" UUID NOT NULL,
    "kktp" VARCHAR(55) NOT NULL DEFAULT '',
    "nilai_akhir" DECIMAL(5,2) NOT NULL,
    "capaian_kompetensi" TEXT NOT NULL DEFAULT '',
    "status_acc" "StatusAccRapor" NOT NULL DEFAULT 'PENDING',
    "kepala_sekolah_id" UUID,
    "tgl_acc" TIMESTAMP(0),

    CONSTRAINT "rapor_prakerin_wali_pkey" PRIMARY KEY ("id_rapor_prakerin_wali")
);

CREATE UNIQUE INDEX "rapor_prakerin_wali_riwayat_kelas_siswa_id_semester_id_key"
ON "rapor_prakerin_wali"("riwayat_kelas_siswa_id", "semester_id");

ALTER TABLE "rapor_prakerin_wali"
ADD CONSTRAINT "rapor_prakerin_wali_kepala_sekolah_id_fkey"
FOREIGN KEY ("kepala_sekolah_id") REFERENCES "kepala_sekolah_profiles"("id_kepsek")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "rapor_prakerin_wali"
ADD CONSTRAINT "rapor_prakerin_wali_riwayat_kelas_siswa_id_fkey"
FOREIGN KEY ("riwayat_kelas_siswa_id") REFERENCES "riwayat_kelas_siswa"("id_riwayat")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "rapor_prakerin_wali"
ADD CONSTRAINT "rapor_prakerin_wali_semester_id_fkey"
FOREIGN KEY ("semester_id") REFERENCES "semesters"("id_semester")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "rapor_prakerin_wali"
ADD CONSTRAINT "rapor_prakerin_wali_wali_kelas_id_fkey"
FOREIGN KEY ("wali_kelas_id") REFERENCES "guru_profiles"("id_guru")
ON DELETE RESTRICT ON UPDATE CASCADE;
