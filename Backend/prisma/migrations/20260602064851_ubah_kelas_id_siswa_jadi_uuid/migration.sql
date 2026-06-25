/*
  Warnings:

  - Changed the type of `kelas_id` on the `siswa_profiles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "siswa_profiles" DROP COLUMN "kelas_id",
ADD COLUMN     "kelas_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "siswa_profiles" ADD CONSTRAINT "siswa_profiles_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "kelas"("id_kelas") ON DELETE RESTRICT ON UPDATE CASCADE;
