import gambar from "../asset/Tak terasa, perjalanan panjang siswa kelas XII di SMK Parulian 1 Medan telah sampai di garis ak.webp";

export default function Hero() {
  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden mt-20">
      {/* 1. Latar Belakang Gambar */}
      <img
        src={gambar}
        alt="Momen Kelas XII"
        // brightness diubah jadi 50 agar gambar lebih gelap dan teks putih lebih menyala
        className="absolute top-0 left-0 w-full h-full object-cover blur-[2px] brightness-50 z-0"
      />

      {/* 2. Overlay Gelap Tambahan */}
      <div className="absolute inset-0 bg-black/30 z-10"></div>

      {/* 3. Teks Sambutan (Tanpa Card) */}
      <div className="relative z-20 w-full max-w-4xl px-6 flex flex-col items-center text-center animate-fade-in">
        {/* Teks Kecil / Sub-judul */}
        <h3 className="text-secondary font-semibold text-sm md:text-lg mb-3 tracking-[0.2em] uppercase drop-shadow-md">
          Sambutan Hangat
        </h3>

        {/* Judul Utama */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-xl">
          Selamat Datang di <br />
          <span className="text-secondary">SMK Parulian 1</span>
        </h1>

        {/* Paragraf Sambutan */}
        <p className="text-gray-200 text-base md:text-xl mb-10 max-w-2xl drop-shadow-lg font-light">
          "Bersama SMK Parulian 1, Raih Potensi Terbaikmu."
        </p>

        {/* Tombol Aksi */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <button className="bg-primary text-white font-medium px-6 py-2.5 sm:px-8 sm:py-3 text-sm sm:text-base w-full sm:w-auto rounded-full hover:bg-primary/80 transition-all duration-300 shadow-lg">
            Jelajahi Profil
          </button>
          <button className="bg-white/10 backdrop-blur-sm text-white border border-white/50 font-medium px-6 py-2.5 sm:px-8 sm:py-3 text-sm sm:text-base w-full sm:w-auto rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg">
            Hubungi Kami
          </button>
        </div>
      </div>
    </section>
  );
}
