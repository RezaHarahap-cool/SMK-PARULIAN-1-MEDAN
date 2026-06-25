import komputer from "../asset/komputer.jpg";
import Jaringan from "../asset/jaringan.jpg";
import Akutasni from "../asset/akutansi.jpg";
import Perkantoran from "../asset/perkantoran.jpg";

interface JurusanDetail {
  id: string;
  singkatan: string;
  namaLengkap: string;
  tagline: string;
  deskripsi: string;
  kegunaan: string[];
  prospek: string[];
  image: string;
}

const detailJurusanData: JurusanDetail[] = [
  {
    id: "pplg",
    singkatan: "PPLG",
    namaLengkap: "Pengembangan Perangkat Lunak dan Gim",
    tagline: "Arsitek Digital Masa Depan, Mengubah Ide Menjadi Aplikasi.",
    deskripsi: "Jurusan ini mempelajari kompetensi coding, rekayasa perangkat lunak, pengembangan aplikasi mobile & web, hingga pembuatan gim interaktif menggunakan teknologi mutakhir.",
    kegunaan: [
      "Menguasai bahasa pemrograman populer (JavaScript, TypeScript, Python).",
      "Mampu membangun platform web dan aplikasi mobile standar industri.",
      "Memahami pengelolaan basis data (PostgreSQL/MySQL) dan logika sistem operasi."
    ],
    prospek: ["Fullstack Web Developer", "Mobile Apps Programmer", "UI/UX Designer", "Game Developer"],
    image: komputer // Ganti dengan path gambar lab PPLG asli nanti
  },
  {
    id: "tjkt",
    singkatan: "TJKT",
    namaLengkap: "Teknik Jaringan Komputer dan Telekomunikasi",
    tagline: "Menghubungkan Dunia Melalui Jaringan Komunikasi Global.",
    deskripsi: "Fokus pada penguasaan instalasi jaringan komputer, pengelolaan server, administrasi sistem jaringan, fiber optik, hingga dasar-dasar keamanan siber (cybersecurity).",
    kegunaan: [
      "Mampu merancang, mengonfigurasi, dan merawat infrastruktur jaringan LAN/WAN.",
      "Menguasai administrasi server (Linux/Windows Server) dan komputasi awan.",
      "Ahli dalam troubleshooting perangkat keras komputer dan sistem telekomunikasi."
    ],
    prospek: ["Network Engineer", "System Administrator", "IT Support Specialist", "Cyber Security Analyst"],
    image: Jaringan // Ganti dengan path gambar lab TJKT asli nanti
  },
  {
    id: "akl",
    singkatan: "AKL",
    namaLengkap: "Akuntansi dan Keuangan Lembaga",
    tagline: "Ketelitian Keuangan Finansial Berbasis Teknologi Digital.",
    deskripsi: "Membekali siswa dengan keahlian pengelolaan transaksi keuangan, pembukuan, perpajakan, serta penggunaan perangkat lunak akuntansi berbasis digital untuk kebutuhan korporasi.",
    kegunaan: [
      "Mampu menyusun laporan keuangan perusahaan jasa, dagang, dan manufaktur.",
      "Menguasai software akuntansi modern (MYOB, Spreadsheet, Accurate).",
      "Memahami regulasi perpajakan Indonesia dan pengelolaan administrasi kas."
    ],
    prospek: ["Staff Akuntansi / Keuangan", "Staff Perpajakan", "Internal Auditor", "Teller / Customer Service Bank"],
    image: Akutasni // Ganti dengan path gambar lab AKL asli nanti
  },
  {
    id: "otkp",
    singkatan: "OTKP",
    namaLengkap: "Otomatisasi Tata Kelola Perkantoran",
    tagline: "Profesionalitas Administrasi Modern dan Komunikasi Bisnis.",
    deskripsi: "Mempelajari manajemen perkantoran modern, otomatisasi dokumen, kearsipan digital, komunikasi bisnis internasional, serta layanan prima kepada klien korporasi.",
    kegunaan: [
      "Mahir mengoperasikan aplikasi administrasi perkantoran modern.",
      "Menguasai manajemen kearsipan berbasis komputer secara rapi dan aman.",
      "Memiliki keterampilan komunikasi publik (Public Relations) dan negosiasi bisnis."
    ],
    prospek: ["Sekretaris Eksekutif", "Administrative Assistant", "Resepsionis Profesional", "Staff HRD / Personalia"],
    image: Perkantoran // Ganti dengan path gambar lab OTKP asli nanti
  }
];

export default function DetailJurusan() {
  return (
    <section id="detail-jurusan" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl relative z-10 space-y-32">
        
        {detailJurusanData.map((jurusan, index) => {
          // Trik logika: Jika index ganjil, posisi kolom dibalik di layar besar (lg)
          const isEven = index % 2 === 0;

          return (
            <div 
              key={jurusan.id} 
              className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                isEven ? "" : "lg:flex-row-reverse"
              }`}
            >
              
              {/* Kolom Teks (Akan otomatis pindah kiri/kanan sesuai urutan) */}
              <div className={`space-y-6 ${!isEven ? "lg:order-2" : ""}`}>
                <div className="animate-fade-in">
                  <span className="text-secondary font-bold tracking-widest text-sm uppercase">
                    Program Keahlian #{index + 1}
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-extrabold leading-tight text-primary">
                  {jurusan.namaLengkap} 
                  <span className="block text-xl font-medium italic text-muted-foreground mt-1 font-serif">
                    ({jurusan.singkatan})
                  </span>
                </h2>

                <p className="text-lg font-semibold text-[#ff791f]">
                  "{jurusan.tagline}"
                </p>

                <p className="text-muted-foreground text-base leading-relaxed">
                  {jurusan.deskripsi}
                </p>

                {/* Grid Kegunaan & Prospek */}
                <div className="grid sm:grid-cols-2 gap-6 pt-2">
                  {/* Sub-section: Apa yang Dipelajari */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-primary border-b pb-1.5 border-gray-100">
                      Apa yang Dipelajari?
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {jurusan.kegunaan.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#ff791f] font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Sub-section: Prospek Kerja */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-primary border-b pb-1.5 border-gray-100">
                      Prospek Karier Lulusan:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {jurusan.prospek.map((karir, i) => (
                        <span 
                          key={i} 
                          className="px-3 py-1 bg-gray-100 text-primary font-medium text-xs rounded-full border border-gray-200 shadow-sm"
                        >
                          {karir}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom Gambar (Akan otomatis pindah kanan/kiri sesuai urutan) */}
              <div className={`relative w-full max-w-md mx-auto lg:max-w-none ${!isEven ? "lg:order-1" : ""}`}>
                {/* Efek glow belakang layar sesuai identitas warna utama */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/10 blur-[100px] rounded-full -z-10"></div>

                {/* Frame Foto Glassmorphism */}
                <div className="glass p-3 rounded-[2rem] bg-gray-50/50 border border-gray-200/50 relative z-10 transform transition-transform duration-500 hover:scale-[1.02] shadow-xl">
                  <img
                    src={jurusan.image}
                    alt={`Fasilitas Lab ${jurusan.singkatan}`}
                    className="w-full h-auto aspect-square md:aspect-[4/3] object-cover rounded-3xl"
                  />
                </div>
              </div>

            </div>
          );
        })}

      </div>
    </section>
  );
}