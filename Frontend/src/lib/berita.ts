import { uploadUrl } from "./api";

export interface ApiBerita {
  id_berita: string;
  tanggal_publikasi: string;
  judul: string;
  content: string;
  jenis_berita: "Akademik" | "Pengumuman" | "Kegiatan_Prestasi";
  foto?: string | null;
  admin?: {
    nama_admin?: string | null;
  } | null;
}

export interface BeritaItem {
  id: string;
  tanggal: string;
  judul: string;
  ringkasan: string;
  content: string;
  kategori: string;
  penulis: string;
  image: string;
}

export const formatKategoriBerita = (value: ApiBerita["jenis_berita"]) => {
  if (value === "Kegiatan_Prestasi") return "Kegiatan/Prestasi";
  return value;
};

export const formatTanggalBerita = (value: string) =>
  new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export const mapBerita = (item: ApiBerita): BeritaItem => ({
  id: item.id_berita,
  tanggal: formatTanggalBerita(item.tanggal_publikasi),
  judul: item.judul,
  ringkasan: item.content,
  content: item.content,
  kategori: formatKategoriBerita(item.jenis_berita),
  penulis: item.admin?.nama_admin || "Admin Sekolah",
  image: uploadUrl(item.foto),
});
