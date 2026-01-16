import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import AISection from '@/components/AISection';
import ServicesSection from '@/components/ServicesSection';
import WhyChooseSection from '@/components/WhyChooseSection';
import PortfolioSection from '@/components/PortfolioSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import CustomCursor from '@/components/CustomCursor';
import ScrollProgress from '@/components/ScrollProgress';
import SectionDivider from '@/components/SectionDivider';

export default function Home() {
  return (
    <div className="min-h-screen">
      <CustomCursor />
      <ScrollProgress />
      <Navigation />

      <HeroSection />
      <SectionDivider variant="wave" />
      <AboutSection />
      <SectionDivider variant="curve" flip />
      <AISection />
      <SectionDivider variant="wave" />
      <ServicesSection />
      <SectionDivider variant="curve" flip />
      <WhyChooseSection />
      <SectionDivider variant="wave" />
      <PortfolioSection />
      <SectionDivider variant="curve" flip />
      <ContactSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
}

