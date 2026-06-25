-- Koreksi aman untuk database yang sudah sempat dibuat dengan nama PKK.
DO $$
BEGIN
  IF to_regclass('public.rapor_pkk_wali') IS NOT NULL
     AND to_regclass('public.rapor_prakerin_wali') IS NULL THEN
    ALTER TABLE "rapor_pkk_wali" RENAME TO "rapor_prakerin_wali";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'rapor_prakerin_wali'
      AND column_name = 'id_rapor_pkk_wali'
  ) THEN
    ALTER TABLE "rapor_prakerin_wali"
    RENAME COLUMN "id_rapor_pkk_wali" TO "id_rapor_prakerin_wali";
  END IF;
END $$;
