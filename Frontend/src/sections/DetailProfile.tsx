import React from "react";
import { Target, BookOpen, ShieldCheck, CheckCircle2, Award, HeartHandshake, Milestone } from "lucide-react";

export default function DetailProfile() {
  const misiSekolah = [
    "Menyelenggarakan pembelajaran berbasis teknologi dan industri terkini.",
    "Menanamkan nilai-nilai kedisiplinan, etika, dan karakter budi pekerti luhur.",
    "Menjalin kemitraan strategis dengan dunia usaha dan dunia industri (DUDI).",
    "Membekali siswa dengan keterampilan kewirausahaan (entrepreneurship).",
  ];
  return (
    <section
      id="profil"
      className="py-24 bg-background relative overflow-hidden"
    >
      {/* Ornamen Latar Belakang */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10 space-y-20">
        {/* SECTION 1: Sejarah & Identitas (Grid 2 Kolom) */}
        {/* Perubahan: menggunakan items-start agar jika kolom kanan lebih panjang, posisinya tetap rapi di atas */}
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Kolom Kiri: Teks Selayang Pandang */}
          <div className="lg:col-span-7 space-y-6 animate-fade-in sticky top-24">
            <span className="text-secondary font-bold tracking-widest text-sm uppercase flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Tentang Kami
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-primary leading-tight">
              Membangun Peradaban Melalui{" "}
              <span className="text-secondary">Pendidikan Vokasi</span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-lg pt-2">
              <p>
                SMK Swasta Parulian 1 Medan didirikan dengan tujuan luhur untuk
                mencetak generasi muda yang tidak hanya cerdas secara akademis,
                tetapi juga memiliki keterampilan teknis yang relevan dengan
                kebutuhan industri masa kini.
              </p>
              <p>
                Berada di bawah naungan Yayasan Pendidikan Parulian, sekolah
                kami terus bertransformasi mengikuti perkembangan teknologi.
                Dengan fasilitas laboratorium modern dan tenaga pendidik
                profesional, kami berkomitmen menjadi jembatan terbaik antara
                dunia pendidikan dan dunia kerja profesional, memastikan setiap
                lulusan memiliki daya saing tinggi.
              </p>
            </div>
          </div>

          {/* Kolom Kanan: Kartu Identitas & Sejarah */}
          <div className="lg:col-span-5 animate-fade-in animation-delay-200 space-y-6">
            {/* Kartu 1: Identitas Formal */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-bl-full -z-10"></div>

              <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <ShieldCheck className="w-6 h-6 text-secondary" /> Identitas
                Sekolah
              </h3>

              <ul className="space-y-4">
                <li className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">
                    Nama Sekolah
                  </span>
                  <span className="font-bold text-primary">
                    SMKS Parulian 1 Medan
                  </span>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">NPSN</span>
                  <span className="font-bold text-primary bg-gray-100 px-2 py-1 rounded">
                    10210899
                  </span>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">
                    Status Akreditasi
                  </span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                    Akreditasi A
                  </span>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Kurikulum</span>
                  <span className="font-bold text-primary">
                    Merdeka Belajar
                  </span>
                </li>
              </ul>
            </div>

            {/* Kartu 2: Sejarah Singkat (BARU) */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg relative overflow-hidden group hover:border-secondary/30 transition-colors duration-300">
              <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
                <Milestone className="w-6 h-6 text-secondary" /> Jejak Langkah
              </h3>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Berdiri kokoh sejak era 90-an di bawah naungan Yayasan
                  Pendidikan Parulian, sekolah ini pada mulanya difokuskan untuk
                  menjawab kebutuhan tenaga administrasi dan bisnis di Kota
                  Medan melalui jurusan Akuntansi dan Perkantoran.
                </p>
                <p>
                  Menyadari pesatnya transformasi digital, SMK Parulian 1
                  melakukan lompatan inovasi dengan membuka program keahlian
                  teknologi informasi (TJKT & PPLG). Kini, di tahun 2026, kami
                  bangga telah diakui sebagai salah satu SMK percontohan yang
                  melahirkan tenaga ahli digital terkemuka di Sumatera Utara.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Semboyan / Budaya Sekolah */}
        <div className="bg-primary text-white rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h3 className="text-secondary font-bold tracking-widest text-sm uppercase">
              Semboyan Utama
            </h3>
            <p className="text-4xl md:text-5xl font-black leading-tight font-serif italic">
              "Unggul dalam Prestasi, <br className="hidden md:block" /> Santun
              dalam Budi"
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-6 text-sm font-medium text-white/80">
              <span className="flex items-center gap-2">
                <Award className="w-5 h-5 text-secondary" /> Kompeten
              </span>
              <span className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-secondary" /> Beretika
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-secondary" /> Disiplin
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Visi & Misi */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-extrabold text-primary mb-4">
              Visi Kami
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
              "Menjadi Sekolah Menengah Kejuruan unggulan yang menghasilkan
              lulusan berkarakter mulia, adaptif terhadap teknologi mutakhir,
              dan kompetitif di pasar kerja global."
            </p>
          </div>

          <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
            <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-extrabold text-primary mb-4">
              Misi Kami
            </h3>
            <ul className="space-y-4">
              {misiSekolah.map((misi, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-muted-foreground"
                >
                  <span className="mt-1 flex-shrink-0 w-5 h-5 bg-secondary/20 text-secondary flex items-center justify-center rounded-full text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{misi}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
