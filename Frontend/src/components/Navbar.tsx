import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "../asset/bg_logo.png";
import { useNavigate } from "react-router-dom";

// Memindahkan menu ke dalam array agar lebih rapi dan mudah diatur
const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "jurusan", label: "Jurusan" },
  { href: "profile", label: "Profil" },
  { href: "kariawan", label: "Guru/Staf" },
  { href: "galeri", label: "Galeri" },
  { href: "berita", label: "Berita" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Efek untuk mendeteksi scroll layar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full transition-all duration-300 z-50 ${
        isScrolled
          ? "bg-white shadow-md py-3" // Saat discroll: latar putih, ada bayangan, lebih tipis
          : "bg-transparent py-5"      // Saat di atas: transparan, lebih tebal
      }`}
    >
      <nav className="container mx-auto px-6 flex items-center justify-between">
        
        {/* Logo Kiri */}
        <a href="/" className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-10 h-10" />
          <span className="text-primary font-semibold text-lg">
            Smk Parulian 1
          </span>
        </a>

        {/* Menu Tengah (Hanya muncul di Desktop) */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link, index) => (
            <a 
              key={index} 
              href={link.href} 
              className="hover:text-secondary font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Tombol Login Kanan (Hanya muncul di Desktop) */}
<div className="hidden md:block">
          {/* 3. Tambahkan onClick pada tombolnya */}
          <button 
            onClick={() => navigate('/login')} 
            className="bg-secondary text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity cursor-pointer"
          >
            Login
          </button>
        </div>

        {/* Tombol Hamburger Mobile */}
        <button
          className="md:hidden p-2 text-primary cursor-pointer"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

      </nav>

      {/* Dropdown Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg absolute w-full left-0 top-full">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)} // Otomatis tutup saat menu diklik
                className="text-lg font-medium hover:text-secondary py-2 border-b border-gray-100 last:border-none"
              >
                {link.label}
              </a>
            ))}
            
            {/* Tombol Login versi Mobile */}
            <button 
              className="bg-secondary text-white px-4 py-2 mt-2 rounded-full w-full max-w-[200px]"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          </div>
        </div>
      )}
    </header>
  );
}