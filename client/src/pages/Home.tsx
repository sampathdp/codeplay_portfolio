import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import PortfolioTeaser from "@/components/PortfolioTeaser";
import PricingSection from "@/components/PricingSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import MatrixRain from "@/components/MatrixRain";
import SEO from "@/components/SEO";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 relative">
      <SEO
        title="CodePlay Studios — Software Development Company in Sri Lanka"
        description="CodePlay Studios is a software development company in Sri Lanka building AI-powered business systems, web apps, mobile apps, and games. Scalable, intelligent software tailored to your needs — get a quote today."
        keywords="software development company Sri Lanka, software development Sri Lanka, custom software development Sri Lanka, web development Sri Lanka, mobile app development Sri Lanka, AI development, ERP systems, game development, CodePlay Studios"
      />
      <div className="fixed inset-0 z-0 h-full w-full bg-background pointer-events-none">
        <MatrixRain />
        <div className="absolute inset-0 bg-background/60 z-0" />
      </div>
      <div className="relative z-10">
        <Navigation />
        <main id="main">
          <HeroSection />
          <ServicesSection />
          <PortfolioTeaser />
          <PricingSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
