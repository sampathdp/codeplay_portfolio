import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import ParticleBackground from './ParticleBackground';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import heroImage from '@assets/generated_images/AI_neural_network_hero_background_cdbc0c35.png';

export default function HeroSection() {
  const [gradientPosition, setGradientPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientPosition((prev) => (prev + 1) % 200);
    }, 50);
    return () => clearInterval(interval);
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

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
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

      <ParticleBackground />

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="h-4 w-4 text-primary" />
          </motion.div>
          <span className="text-sm font-medium text-primary">AI-Powered Solutions</span>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span
            className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
            style={{
              backgroundSize: '200% auto',
              animation: 'gradientFlow 4s linear infinite',
            }}
          >
            Building Smart, Scalable, and AI-Driven Software Solutions
          </span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          We design intelligent systems that solve real business challenges — from ERPs to mobile apps
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
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
