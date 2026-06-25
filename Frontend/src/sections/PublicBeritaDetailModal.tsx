import { CalendarDays, ImageIcon, Tag, User, X } from "lucide-react";
import type { BeritaItem } from "../lib/berita";

interface PublicBeritaDetailModalProps {
  berita: BeritaItem | null;
  onClose: () => void;
}

export default function PublicBeritaDetailModal({
  berita,
  onClose,
}: PublicBeritaDetailModalProps) {
  if (!berita) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <article className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl custom-scrollbar">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
          aria-label="Tutup detail berita"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative h-64 sm:h-80 bg-gray-100">
          {berita.image ? (
            <img
              src={berita.image}
              alt={berita.judul}
              onError={(e) => {
                e.currentTarget.src = "/general_profil.png";
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <ImageIcon className="w-16 h-16" />
            </div>
          )}
        </div>

        <div className="p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-4 pb-4 mb-5 border-b border-gray-100">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#fff3ea] text-[#ff791f] text-xs font-bold">
              <Tag className="w-3.5 h-3.5" />
              {berita.kategori}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <CalendarDays className="w-4 h-4" />
              {berita.tanggal}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <User className="w-4 h-4" />
              {berita.penulis}
            </span>
          </div>

          <h2 className="text-2xl md:text-4xl font-extrabold text-primary leading-tight mb-6">
            {berita.judul}
          </h2>

          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {berita.content}
          </div>
        </div>
      </article>
    </div>
  );
}
