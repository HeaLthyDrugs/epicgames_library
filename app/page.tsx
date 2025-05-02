import Navbar from "./components/Navbar";
import SubNavbar from "./components/SubNavbar";
import Carousel from "./components/Carousel";
import FreeGames from "./components/FreeGames";
import DiscoverSection from "./components/DiscoverSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <Navbar />
      <div className="pt-[72px]">
        <SubNavbar />
        <Carousel />
        <DiscoverSection />
        <FreeGames />
        <Footer />
      </div>
    </main>
  );
}
