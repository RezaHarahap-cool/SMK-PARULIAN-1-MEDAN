import gambar from "../asset/IMG-20260625-WA0019.jpg";
export default function Sambutan() {
  return (
    <section id="about" className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column (Teks Profil) - Tetap sama seperti sebelumnya */}
          <div className="space-y-8">
            <div className="animate-fade-in">
              <span className="text-secondary-foreground text-sm font-medium tracking-wider uppercase">
                Kepala sekolah
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold leading-tight animate-fade-in animation-delay-100 text-secondary-foreground">
              Membangun generasi masa depan,
              <span className="font-serif italic font-normal text-secondary">
                {" "}
                berkarakter dan berprestasi.
              </span>
            </h2>

            <div className="space-y-4 text-muted-foreground animate-fade-in animation-delay-200">
              <p>
                Selamat datang di website resmi sekolah kami. Kami sangat bangga
                dapat menjadi tempat di mana anak-anak Anda bertumbuh, belajar,
                dan menemukan potensi terbaik mereka. Bagi kami, pendidikan
                adalah pondasi utama dalam membangun peradaban bangsa.
              </p>
              <p>
                Kami berkomitmen untuk menyediakan lingkungan belajar yang aman,
                inovatif, dan inklusif. Didukung oleh fasilitas yang memadai
                serta tenaga pendidik yang berdedikasi tinggi, kami tidak hanya
                berfokus pada kecerdasan akademis, tetapi juga pada pembentukan
                akhlak mulia dan keterampilan abad 21.
              </p>
              <p>
                Terima kasih atas kepercayaan Bapak dan Ibu sekalian. Mari kita
                terus berkolaborasi, mendampingi langkah putra-putri kita untuk
                meraih cita-cita dan masa depan yang gemilang.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 glow-border bg-gray-400">
              <p className="text-lg font-medium italic text-foreground">
                "Tujuan utama pendidikan bukanlah sekadar mentransfer
                pengetahuan, melainkan membentuk karakter yang kuat dan
                menyalakan api keingintahuan yang tak pernah padam."
              </p>
            </div>
          </div>

          {/* Right Column - Gambar Profil */}
          <div className="relative w-full max-w-md mx-auto lg:max-w-none animate-fade-in animation-delay-400">
            {/* Dekorasi efek cahaya (blur) di belakang gambar */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/30 blur-[100px] rounded-full -z-10"></div>

            {/* Frame gambar dengan efek glass */}
            <div className="glass p-3 rounded-[2rem] glow-border relative z-10 transform transition-transform duration-500 hover:scale-[1.02]">
              <img
                src={gambar} /* GANTI DENGAN LOKASI GAMBAR KAMU */
                alt="Foto Profil Saya"
                className="w-full h-auto aspect-square md:aspect-[4/5] object-cover rounded-3xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
