import Header from "@/components/header/Header";
import HeroSection from "@/components/hero/HeroSection";
import UpcomingEvents from "@/components/events/UpcomingEvents";
import ExploreByCategory from "@/components/categories/ExploreByCategory";
import FeaturedEvent from "@/components/home/FeaturedEvent";
import HowItWorks from "@/components/home/HowItWorks";
import AppPromotion from "@/components/home/AppPromotion";
import Testimonials from "@/components/testimonials/Testimonials";
import Footer from "@/components/footer/Footer";

export default function HomePage() {
  return (
    <main>
      <Header />
      <HeroSection />
      <UpcomingEvents />
      <ExploreByCategory />
      <FeaturedEvent />
      <HowItWorks />
      <AppPromotion />
      <Testimonials />
      <Footer />
    </main>
  );
}

