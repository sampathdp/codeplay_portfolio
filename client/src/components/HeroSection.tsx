import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, Brain, Zap, Rocket } from 'lucide-react';
import ParticleBackground from './ParticleBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import heroImage from '@assets/generated_images/AI_neural_network_hero_background_cdbc0c35.png';
import aiImage from '@assets/generated_images/AI_analytics_visualization_be61eb13.png';
import cloudImage from '@assets/generated_images/Cloud_integration_tech_illustration_330fd769.png';

const slides = [
  {
    icon: Sparkles,
    badge: 'AI-Powered Solutions',
    title: 'Building Smart, Scalable, and AI-Driven Software Solutions',
    subtitle: 'We design intelligent systems that solve real business challenges — from ERPs to mobile apps',
    bgImage: heroImage,
  },
  {
    icon: Brain,
    badge: 'AI & Innovation',
    title: 'Harness the Power of Artificial Intelligence',
    subtitle: 'Predictive analytics, automated decision-making, and intelligent bots that transform your business',
    bgImage: aiImage,
  },
  {
    icon: Rocket,
    badge: 'Modern Tech Stack',
    title: 'Cutting-Edge Technologies for Future-Ready Solutions',
    subtitle: 'Built with React, Next.js, Node.js, and cloud infrastructure for maximum scalability',
    bgImage: cloudImage,
  },
  {
    icon: Zap,
    badge: 'Fast & Efficient',
    title: 'From Concept to Deployment in Record Time',
    subtitle: 'Agile development process delivering production-ready software that exceeds expectations',
    bgImage: heroImage,
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [gradientPosition, setGradientPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientPosition((prev) => (prev + 1) % 200);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const autoplay = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(autoplay);
  }, []);

  const handleGetQuote = () => {
    console.log('Get Quote clicked');
    const contactSection = document.getElementById('contact');
    contactSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExploreWork = () => {
    console.log('Explore Our Work clicked');
    const portfolioSection = document.getElementById('portfolio');
    portfolioSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    console.log('Next slide');
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    console.log('Previous slide');
  };

  const currentSlideData = slides[currentSlide];
  const SlideIcon = currentSlideData.icon;

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${currentSlideData.bgImage})`,
          }}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, 
                hsl(222, 47%, 8%) 0%,
                hsl(217, 91%, 20%) ${gradientPosition}%,
                hsl(262, 83%, 25%) ${(gradientPosition + 50) % 100}%,
                hsl(222, 47%, 8%) 100%)`,
              opacity: 0.92,
            }}
          />
        </motion.div>
      </AnimatePresence>

      <ParticleBackground />

      <div className="relative z-10 container mx-auto px-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <SlideIcon className="h-4 w-4 text-primary" />
              </motion.div>
              <span className="text-sm font-medium text-primary">{currentSlideData.badge}</span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span
                className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
                style={{
                  backgroundSize: '200% auto',
                  animation: 'gradientFlow 4s linear infinite',
                }}
              >
                {currentSlideData.title}
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {currentSlideData.subtitle}
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  onClick={handleGetQuote}
                  className="bg-primary hover:bg-primary/90 backdrop-blur-sm group relative overflow-hidden"
                  data-testid="button-get-quote"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-accent/30 to-transparent"
                    animate={{ x: [-200, 200] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    Get a Quote
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleExploreWork}
                  className="backdrop-blur-sm bg-background/50"
                  data-testid="button-explore-work"
                >
                  Explore Our Work
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.button
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-background/20 backdrop-blur-sm border border-primary/20 flex items-center justify-center hover-elevate"
        onClick={prevSlide}
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(96, 165, 250, 0.1)' }}
        whileTap={{ scale: 0.9 }}
        data-testid="button-prev-slide"
      >
        <ChevronLeft className="h-6 w-6 text-primary" />
      </motion.button>

      <motion.button
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-background/20 backdrop-blur-sm border border-primary/20 flex items-center justify-center hover-elevate"
        onClick={nextSlide}
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(96, 165, 250, 0.1)' }}
        whileTap={{ scale: 0.9 }}
        data-testid="button-next-slide"
      >
        <ChevronRight className="h-6 w-6 text-primary" />
      </motion.button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-primary/30'
            }`}
            onClick={() => {
              setCurrentSlide(index);
              console.log('Slide indicator clicked:', index);
            }}
            whileHover={{ scale: 1.2 }}
            data-testid={`slide-indicator-${index}`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />

      <style>{`
        @keyframes gradientFlow {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </section>
  );
}
