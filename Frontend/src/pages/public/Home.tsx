import Navbar from '../../components/Navbar';
import {FooterSection} from '../../components/Footer';
import Hero from '../../sections/Hero';
import Sambutan from '../../sections/Sambutan';
import {StatsSection} from "../../sections/Statistic"
import { MitraSection } from '../../sections/Mitra';
import { JurusanSection } from '../../sections/Jurusan';
import { PrestasiSection } from "../../sections/Prestasi"
import { EkskulSection } from "../../sections/Extrakulikuler";
import { BeritaSection } from '../../sections/Berita';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main >
        <Hero />
        <MitraSection />
        <Sambutan />
        <StatsSection />
        <JurusanSection />
        <PrestasiSection />
        <EkskulSection />
        <BeritaSection />
      </main>

      <FooterSection />
    </div>
  );
}