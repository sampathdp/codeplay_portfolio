import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AISection from "@/components/AISection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import CaseStudiesSection from "@/components/CaseStudiesSection";
import PricingSection from "@/components/PricingSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import MatrixRain from "@/components/MatrixRain";
import SEO from "@/components/SEO";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 relative">
      <SEO
        title="CodePlay Studios - Coding Your Vision | Smart Software Solutions"
        description="CodePlay Studios builds AI-powered business systems, web apps, mobile solutions, and games. We deliver scalable, intelligent software tailored to your needs. Get a quote today."
        keywords="AI development, web applications, mobile apps, ERP systems, game development, custom software, CodePlay Studios, software engineering, Sri Lanka"
      />
      <div className="fixed inset-0 z-0 h-full w-full bg-background pointer-events-none">
        <MatrixRain />
        <div className="absolute inset-0 bg-background/60 z-0" />
      </div>
      <div className="relative z-10">
        <Navigation />
        <HeroSection />
        <AISection />
        <AboutSection />
        <ServicesSection />
        <WhyChooseSection />
        <CaseStudiesSection />
        <PricingSection />
        <ContactSection />
        <Footer />
      </div>
    </div>
  );
}
